-- Costing a batch against the consignments it actually came out of.
--
-- A production run valued its output at each material's weighted average.
-- That is one number standing in for three consignments bought at three
-- prices, and it matches none of them: peppercorns bought at 90, at 10 and at
-- 119.80 average to 65.15, so every batch was costed at a price the shop
-- never paid. First in, first out draws the oldest stock first and bills it
-- at what that stock cost.
--
-- FIFO needs to know how much of each batch is left, which means recording
-- which batch every issue came out of. That is what the allocations table is.

create table stock_batch_allocations (
  id bigint generated always as identity primary key,
  -- The movement drawing stock out.
  consuming_movement_id bigint not null references stock_movements(id) on delete cascade,
  -- The inbound movement whose batch it was drawn from.
  batch_movement_id bigint not null references stock_movements(id) on delete cascade,
  qty numeric(12,3) not null check (qty > 0),
  -- Frozen at the layer's rate. What a batch cost is settled when it arrives,
  -- not re-read later when the rate has moved on.
  unit_cost numeric,
  unique (consuming_movement_id, batch_movement_id)
);

create index stock_batch_allocations_batch_idx on stock_batch_allocations (batch_movement_id);
alter table stock_batch_allocations enable row level security;

-- What is left in each batch: what arrived, less what has been drawn from it.
create view stock_layers as
select m.id as movement_id,
       m.item_id,
       m.batch_no,
       m.kind,
       m.occurred_at,
       m.qty as batch_qty,
       m.unit_cost,
       m.total_cost,
       (m.qty - coalesce(a.taken, 0))::numeric(12,3) as remaining_qty
  from stock_movements m
  left join (
    select batch_movement_id, sum(qty) as taken
      from stock_batch_allocations group by batch_movement_id
  ) a on a.batch_movement_id = m.id
 -- Anything that brought stock in is a layer FIFO can draw from, including an
 -- opening balance: it is stock that arrived, even if what it cost is not
 -- known. Leaving it out would have FIFO skip the oldest stock in the shop.
 where m.qty > 0;

-- A produced lot needs a number of its own. MNF says it was made here; BN
-- says it was bought in. Both are what a recall traces back to.
create or replace function public.assign_batch_no() returns trigger
language plpgsql as $fn$
declare
  prefix text;
begin
  if new.batch_no is null then
    prefix := case new.kind
      when 'receipt'::stock_movement_kind then 'BN'
      when 'production'::stock_movement_kind then 'MNF'
      else null
    end;
    if prefix is not null then
      new.batch_no :=
        prefix || '-'
        || to_char(coalesce(new.occurred_at, now()) at time zone 'Asia/Kolkata', 'YYYYMMDD')
        || '-'
        || lpad(nextval('stock_batch_no_seq')::text, 4, '0');
    end if;
  end if;
  return new;
end $fn$;

create or replace function public.post_production_run() returns trigger
language plpgsql as $fn$
declare
  line record;
  layer record;
  consumption_id bigint;
  still_needed numeric;
  taken numeric;
  batch_cost numeric := 0;
  short_item text;
begin
  if new.posted_at is null or old.posted_at is not null then
    return new;
  end if;

  if not exists (select 1 from production_inputs i where i.run_id = new.id) then
    raise exception 'Production run % has no inputs', new.id;
  end if;

  select p.name into short_item
    from production_inputs i
    join products p on p.id = i.item_id
    join item_stock s on s.item_id = i.item_id
   where i.run_id = new.id and i.qty > s.quantity_on_hand
   limit 1;
  if short_item is not null then
    raise exception 'Not enough % in stock for this run', short_item;
  end if;

  for line in select i.item_id, i.qty from production_inputs i where i.run_id = new.id loop
    insert into stock_movements (item_id, kind, qty, occurred_at, note)
    values (line.item_id, 'consumption', -line.qty, new.occurred_at,
            'Consumed by production run ' || new.id)
    returning id into consumption_id;

    still_needed := line.qty;

    for layer in
      select l.movement_id, l.remaining_qty, l.unit_cost
        from stock_layers l
       where l.item_id = line.item_id and l.remaining_qty > 0
       order by l.occurred_at, l.movement_id
    loop
      exit when still_needed <= 0;
      taken := least(still_needed, layer.remaining_qty);

      insert into stock_batch_allocations (consuming_movement_id, batch_movement_id, qty, unit_cost)
      values (consumption_id, layer.movement_id, taken, layer.unit_cost);

      -- A layer with no known cost — an opening balance — contributes stock
      -- but nothing to the bill. Inventing a rate for it would be worse.
      batch_cost := batch_cost + taken * coalesce(layer.unit_cost, 0);
      still_needed := still_needed - taken;
    end loop;
  end loop;

  insert into stock_movements (item_id, kind, qty, total_cost, occurred_at, note)
  values (new.product_id, 'production', new.output_qty, nullif(batch_cost, 0), new.occurred_at,
          coalesce(nullif(new.note, ''), 'Production run ' || new.id));

  return new;
end $fn$;

-- The card for a manufactured good had nothing to show, because "last
-- purchased" only ever looked at receipts and a made thing has none.
create or replace view item_stock as
with last_batch as (
  select distinct on (m.item_id) m.item_id, m.unit_cost, m.occurred_at, m.batch_no, m.kind
    from stock_movements m
   where m.kind in ('receipt'::stock_movement_kind, 'production'::stock_movement_kind)
   order by m.item_id, m.occurred_at desc, m.id desc
), costed as (
  select m.item_id,
         sum(m.total_cost) as purchase_spend,
         sum(m.qty) as purchased_qty
    from stock_movements m
   where m.kind in ('receipt'::stock_movement_kind, 'production'::stock_movement_kind)
     and m.total_cost is not null
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
  lb.unit_cost::numeric(12,2) as last_purchase_cost,
  lb.occurred_at as last_purchased_at,
  lb.batch_no as last_batch_no,
  lb.kind::text as last_batch_kind
 from products p
 left join stock_movements m on m.item_id = p.id
 left join last_batch lb on lb.item_id = p.id
 left join costed c on c.item_id = p.id
 where p.is_active
 group by p.id, lb.unit_cost, lb.occurred_at, lb.batch_no, lb.kind, c.purchase_spend, c.purchased_qty;
