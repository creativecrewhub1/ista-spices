-- Recording what a batch consumed and what it yielded.
--
-- stock_movements has reserved the 'production' and 'consumption' kinds since
-- the ledger was built and nothing had ever written either. Stock arrived by
-- purchase and left by sale; the middle step, where raw materials become a
-- finished good, existed only in someone's head. That left manufactured goods
-- with no cost basis at all: however much went into them, they valued at
-- nothing, because valuation counted receipts and a made thing has none.
--
-- Header and lines, which is how every stock system models this: one run, many
-- inputs.

create table production_runs (
  id bigint generated always as identity primary key,
  product_id text not null references products(id),
  output_qty numeric(12,3) not null check (output_qty > 0),
  occurred_at timestamptz not null default now(),
  -- Null while the run is still being written. Setting it posts the run to
  -- the ledger, which is what makes a multi-line write all-or-nothing: a
  -- failure part-way through leaves a draft with no stock effect, never a
  -- half-recorded production.
  posted_at timestamptz,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table production_inputs (
  id bigint generated always as identity primary key,
  run_id bigint not null references production_runs(id) on delete cascade,
  item_id text not null references products(id),
  qty numeric(12,3) not null check (qty > 0),
  -- The same material twice would leave the second figure as the only one
  -- recorded, silently halving what the batch is thought to have consumed.
  unique (run_id, item_id)
);

create index production_runs_product_idx on production_runs (product_id, occurred_at desc);
create index production_inputs_item_idx on production_inputs (item_id);

alter table production_runs enable row level security;
alter table production_inputs enable row level security;

-- Stock acquires a cost two ways: bought, or made. Counting only receipts left
-- every manufactured good valued at nothing.
create or replace view item_stock as
with last_receipt as (
  select distinct on (m.item_id) m.item_id, m.unit_cost, m.occurred_at, m.batch_no
    from stock_movements m
   where m.kind = 'receipt'::stock_movement_kind
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
  lr.unit_cost::numeric(12,2) as last_purchase_cost,
  lr.occurred_at as last_purchased_at,
  lr.batch_no as last_batch_no
 from products p
 left join stock_movements m on m.item_id = p.id
 left join last_receipt lr on lr.item_id = p.id
 left join costed c on c.item_id = p.id
 where p.is_active
 group by p.id, lr.unit_cost, lr.occurred_at, lr.batch_no, c.purchase_spend, c.purchased_qty;

-- A produced lot is a batch too. It is the thing a recall or a quality
-- question has to be traced back to, so it gets a number like a consignment.
create or replace function public.assign_batch_no() returns trigger
language plpgsql as $fn$
begin
  if new.kind in ('receipt'::stock_movement_kind, 'production'::stock_movement_kind)
     and new.batch_no is null then
    new.batch_no :=
      'BN-'
      || to_char(coalesce(new.occurred_at, now()) at time zone 'Asia/Kolkata', 'YYYYMMDD')
      || '-'
      || lpad(nextval('stock_batch_no_seq')::text, 4, '0');
  end if;
  return new;
end $fn$;

create or replace function public.post_production_run() returns trigger
language plpgsql as $fn$
declare
  consumed_cost numeric;
  short_item text;
begin
  -- Only the transition into posted writes anything.
  if new.posted_at is null or old.posted_at is not null then
    return new;
  end if;

  -- Nothing is made out of nothing. A run with no inputs would credit stock
  -- that never came from anywhere.
  if not exists (select 1 from production_inputs i where i.run_id = new.id) then
    raise exception 'Production run % has no inputs', new.id;
  end if;

  -- Refuse to consume what is not there. The ledger would accept a negative
  -- balance and quietly report stock the shop does not have.
  select p.name into short_item
    from production_inputs i
    join products p on p.id = i.item_id
    join item_stock s on s.item_id = i.item_id
   where i.run_id = new.id and i.qty > s.quantity_on_hand
   limit 1;
  if short_item is not null then
    raise exception 'Not enough % in stock for this run', short_item;
  end if;

  -- What the run consumed, valued at each component's average cost. This is
  -- the only thing that gives a manufactured good a cost basis.
  select sum(i.qty * s.avg_unit_cost) into consumed_cost
    from production_inputs i
    join item_stock s on s.item_id = i.item_id
   where i.run_id = new.id;

  insert into stock_movements (item_id, kind, qty, total_cost, occurred_at, note)
  values (new.product_id, 'production', new.output_qty, consumed_cost, new.occurred_at,
          coalesce(nullif(new.note, ''), 'Production run ' || new.id));

  insert into stock_movements (item_id, kind, qty, occurred_at, note)
  select i.item_id, 'consumption', -i.qty, new.occurred_at,
         'Consumed by production run ' || new.id
    from production_inputs i
   where i.run_id = new.id;

  return new;
end $fn$;

create trigger production_runs_post after update on production_runs
  for each row execute function public.post_production_run();
