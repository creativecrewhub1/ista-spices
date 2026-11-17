-- What each product actually earned in a month.
--
-- Revenue was already answerable: order_items records what was sold and at
-- what price. Cost was not. A despatch wrote a stock_movements row and
-- nothing else, so the only cost figure available was the item's weighted
-- average — one number standing in for several consignments bought at
-- several prices, matching none of them.
--
-- Three things are needed, and they are kept in three places because they
-- are recorded by three different acts:
--
--   what was sold      order_items, summarised by order_line_revenue
--   what it cost       stock_batch_allocations against the sale movement
--   what else was paid monthly_expenses
--
-- Rent and a sale share nothing but the month they fell in, so they do not
-- belong in one table.

-- 1. Running costs that belong to a month rather than to a product.
create table monthly_expenses (
  id bigint generated always as identity primary key,
  -- Always the first of the month. The check makes that a rule rather than
  -- a convention every caller has to remember.
  month date not null,
  description text not null check (btrim(description) <> ''),
  amount numeric(12,2) not null check (amount >= 0),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint monthly_expenses_month_is_first_of_month
    check (month = date_trunc('month', month)::date)
);

create index monthly_expenses_month_idx on monthly_expenses (month);
alter table monthly_expenses enable row level security;

-- 2. A sale now draws from named batches, the same way production does.
create or replace function public.despatch_order_stock() returns trigger
language plpgsql as $fn$
declare
  line record;
  layer record;
  sale_id bigint;
  still_needed numeric;
  taken numeric;
begin
  if new.status in ('shipped','delivered')
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
     and (tg_op = 'INSERT' or old.status not in ('shipped','delivered'))
  then
    for line in
      select oi.product_id,
             -- The line snapshots the pack quantity in the selling unit, so
             -- the draw-down is that times the selling-to-stock factor.
             sum(oi.qty * oi.pack_qty * p.sales_to_stock_factor) as draw
        from order_items oi join products p on p.id = oi.product_id
       where oi.order_id = new.id
       group by oi.product_id
    loop
      insert into stock_movements (item_id, kind, qty, order_id, note)
      values (line.product_id, 'sale', -line.draw, new.id,
              'Despatched with order ' || new.id)
      on conflict (order_id, item_id) where kind = 'sale' do nothing
      returning id into sale_id;

      -- Already despatched — the conflict did nothing, so there is nothing
      -- to allocate either.
      continue when sale_id is null;

      -- Costed the same way production is: oldest batch first, at what that
      -- batch cost. This is what makes cost of goods sold a real figure
      -- rather than an average standing in for one.
      still_needed := line.draw;
      for layer in
        select l.movement_id, l.remaining_qty, l.unit_cost
          from stock_layers l
         where l.item_id = line.product_id and l.remaining_qty > 0
         order by l.occurred_at, l.movement_id
      loop
        exit when still_needed <= 0;
        taken := least(still_needed, layer.remaining_qty);
        insert into stock_batch_allocations (consuming_movement_id, batch_movement_id, qty, unit_cost)
        values (sale_id, layer.movement_id, taken, layer.unit_cost);
        still_needed := still_needed - taken;
      end loop;
    end loop;
  end if;

  return new;
end $fn$;

-- 3. The three questions, each answered by one view.
--
-- Months are cut in Asia/Kolkata. An order placed at half past eleven at
-- night on the 31st belongs to the month the shop was trading in, not to
-- whatever month it was in UTC.

create view product_revenue_by_month as
select product_id,
       product_name,
       date_trunc('month', placed_at at time zone 'Asia/Kolkata')::date as month,
       sum(qty)::integer as units_sold,
       sum(line_total)::numeric(12,2) as revenue
  from order_line_revenue
 group by product_id, product_name,
          date_trunc('month', placed_at at time zone 'Asia/Kolkata')::date;

create view product_cogs_by_month as
select m.item_id as product_id,
       date_trunc('month', m.occurred_at at time zone 'Asia/Kolkata')::date as month,
       -- A batch with no known cost — an opening balance — contributes stock
       -- but nothing to the bill. Inventing a rate for it would be worse.
       sum(a.qty * coalesce(a.unit_cost, 0))::numeric(12,2) as material_cost,
       sum(a.qty)::numeric(12,3) as units_drawn
  from stock_movements m
  join stock_batch_allocations a on a.consuming_movement_id = m.id
 where m.kind = 'sale'::stock_movement_kind
 group by m.item_id, date_trunc('month', m.occurred_at at time zone 'Asia/Kolkata')::date;

-- Gross, not net: monthly running costs are not attributable to a product,
-- so apportioning them is a reporting decision and is made above this view,
-- where the rule can be seen and changed. What is stored stays factual.
create view product_profit_by_month as
select r.month,
       r.product_id,
       r.product_name,
       r.units_sold,
       r.revenue,
       coalesce(c.material_cost, 0)::numeric(12,2) as material_cost,
       (r.revenue - coalesce(c.material_cost, 0))::numeric(12,2) as gross_profit
  from product_revenue_by_month r
  left join product_cogs_by_month c
    on c.product_id = r.product_id and c.month = r.month;
