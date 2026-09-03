-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

-- Enums
create type product_category as enum ('spice-powder', 'cooking-oil');
create type pack_size_label as enum ('250g', '500g', '1kg', '2kg');
create type stock_state as enum ('processing', 'packing', 'ready');
create type spice_level as enum ('mild', 'medium', 'hot');
create type order_status as enum ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled');
create type order_kind as enum ('subscription', 'one_time');
create type customer_segment as enum ('new', 'regular', 'vip');
create type plan_status as enum ('active', 'paused', 'none');

-- Products
create table products (
  id text primary key,
  name text not null,
  category product_category not null,
  description text not null default '',
  discount_percent int not null default 0,
  spice_level spice_level,
  batch_capacity int not null,
  units_packed_this_batch int not null default 0,
  stock_state stock_state not null default 'processing',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table product_pack_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  size pack_size_label not null,
  price numeric(10,2) not null,
  unique (product_id, size)
);

-- Customers
create table customers (
  id text primary key,
  name text not null,
  phone text not null,
  initials text not null,
  address text not null,
  joined_at date not null default current_date,
  plan_status plan_status not null default 'none',
  segment customer_segment not null default 'new',
  created_at timestamptz not null default now()
);

-- Orders
create table orders (
  id text primary key,
  customer_id text not null references customers(id),
  status order_status not null default 'pending',
  kind order_kind not null default 'one_time',
  placed_at timestamptz not null default now(),
  packed_date date,
  eta timestamptz,
  delivered_at timestamptz,
  address text not null
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id text not null references products(id),
  pack_size pack_size_label not null,
  qty int not null,
  price numeric(10,2) not null
);

create index on order_items (order_id);
create index on order_items (product_id);
create index on orders (customer_id);
create index on orders (placed_at);

-- Derived views (single source of truth for totals — never store computed revenue)
create view orders_with_total as
  select o.*, coalesce(sum(oi.qty * oi.price), 0)::numeric(10,2) as total
  from orders o
  left join order_items oi on oi.order_id = o.id
  group by o.id;

create view customers_with_stats as
  select
    c.*,
    coalesce(count(o.id) filter (where o.status <> 'cancelled'), 0) as total_orders,
    coalesce(sum(ot.total) filter (where o.status <> 'cancelled'), 0)::numeric(10,2) as total_spend,
    max(o.placed_at) as last_order_at
  from customers c
  left join orders o on o.customer_id = c.id
  left join orders_with_total ot on ot.id = o.id
  group by c.id;

create view order_line_revenue as
  select
    o.id as order_id,
    o.placed_at,
    o.status,
    oi.product_id,
    p.name as product_name,
    oi.qty,
    oi.price,
    (oi.qty * oi.price)::numeric(10,2) as line_total
  from orders o
  join order_items oi on oi.order_id = o.id
  join products p on p.id = oi.product_id
  where o.status <> 'cancelled';

create view revenue_by_day as
  select placed_at::date as day, sum(line_total)::numeric(10,2) as revenue
  from order_line_revenue
  group by 1
  order by 1;

create view revenue_by_product as
  select product_id, product_name, sum(qty)::int as units_sold, sum(line_total)::numeric(10,2) as revenue
  from order_line_revenue
  group by product_id, product_name
  order by revenue desc;

create view revenue_by_product_by_day as
  select product_id, product_name, placed_at::date as day, sum(line_total)::numeric(10,2) as revenue
  from order_line_revenue
  group by product_id, product_name, day
  order by product_id, day;

-- RLS: this app has no auth layer yet, so grant full access to the anon/publishable
-- key it will use from the browser. TODO before any real launch: add auth and scope
-- these policies to authenticated admin users only.
alter table products enable row level security;
alter table product_pack_sizes enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "allow all (no auth yet)" on products for all using (true) with check (true);
create policy "allow all (no auth yet)" on product_pack_sizes for all using (true) with check (true);
create policy "allow all (no auth yet)" on customers for all using (true) with check (true);
create policy "allow all (no auth yet)" on orders for all using (true) with check (true);
create policy "allow all (no auth yet)" on order_items for all using (true) with check (true);
;
