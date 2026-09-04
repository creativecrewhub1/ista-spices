-- A goods receipt records what the consignment cost, not a rate.
--
-- The figure the shop actually has is the invoice total. The per-unit cost is
-- arithmetic on top of it, so entering the rate and multiplying back up had it
-- backwards: 100 paid for 3 kg is 33.333..., and any stored rounding of that
-- makes the recorded spend disagree with the invoice.
--
-- total_cost is now the fact and unit_cost is generated from it, so the two
-- cannot drift apart and no code path can write a rate that contradicts the
-- amount paid.

alter table stock_movements add column total_cost numeric(12,2);

update stock_movements set total_cost = round(qty * unit_cost, 2) where unit_cost is not null;

-- item_stock reads unit_cost, so it has to stand aside while the column is
-- replaced. It is recreated at the bottom of this file.
drop view item_stock;

alter table stock_movements drop constraint stock_movements_receipt_has_cost;
alter table stock_movements drop constraint stock_movements_unit_cost_non_negative;
alter table stock_movements drop column unit_cost;

alter table stock_movements
  add column unit_cost numeric generated always as (case when qty <> 0 then total_cost / qty end) stored;

alter table stock_movements add constraint stock_movements_receipt_has_cost
  check (kind <> 'receipt'::stock_movement_kind or total_cost is not null);
alter table stock_movements add constraint stock_movements_total_cost_non_negative
  check (total_cost is null or total_cost >= 0);

create view item_stock as
with last_receipt as (
  select distinct on (m.item_id) m.item_id, m.unit_cost, m.occurred_at, m.batch_no
    from stock_movements m
   where m.kind = 'receipt'::stock_movement_kind
   order by m.item_id, m.occurred_at desc, m.id desc
), costed as (
  /* Spend is the sum of what was actually paid. Re-multiplying a rounded
     per-unit rate by the quantity drifts away from the invoice. */
  select m.item_id,
         sum(m.total_cost) as purchase_spend,
         sum(m.qty) as purchased_qty
    from stock_movements m
   where m.kind = 'receipt'::stock_movement_kind
   group by m.item_id
)
select p.id as item_id,
  p.name,
  p.origin,
  p.is_sellable,
  p.is_consumable,
  p.stock_unit,
  p.sales_unit,
  p.sales_to_stock_factor,
  p.low_stock_threshold,
  coalesce(sum(m.qty), 0::numeric)::numeric(12,3) as quantity_on_hand,
  (c.purchase_spend / nullif(c.purchased_qty, 0::numeric))::numeric(12,2) as avg_unit_cost,
  (coalesce(sum(m.qty), 0::numeric) * (c.purchase_spend / nullif(c.purchased_qty, 0::numeric)))::numeric(12,2) as stock_value,
  coalesce(sum(m.qty), 0::numeric) <= p.low_stock_threshold as is_low_stock,
  lr.unit_cost::numeric(12,2) as last_purchase_cost,
  lr.occurred_at as last_purchased_at,
  lr.batch_no as last_batch_no
 from products p
 left join stock_movements m on m.item_id = p.id
 left join last_receipt lr on lr.item_id = p.id
 left join costed c on c.item_id = p.id
 where p.is_active
 group by p.id, lr.unit_cost, lr.occurred_at, lr.batch_no, c.purchase_spend, c.purchased_qty;
