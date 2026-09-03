-- Ista Spices — baseline schema for the public schema.
--
-- Reconstructed from the live database on 2026-09-03 by introspecting the
-- catalogue, because the schema predates this folder and was applied by hand.
-- It is a snapshot to read and to rebuild from, not a migration to re-run
-- against the existing database.
--
-- Everything after this file lives in db/migrations, one file per change.

create type customer_segment as enum ('new', 'regular', 'vip');

create type inventory_item_type as enum ('raw_material', 'b2b');

create type item_origin as enum ('manufactured', 'purchased');

create type order_kind as enum ('subscription', 'one_time');

create type order_status as enum ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled');

create type pack_size_label as enum ('250g', '500g', '1kg', '2kg');

create type plan_status as enum ('active', 'paused', 'none');

create type product_category as enum ('spice-powder', 'cooking-oil');

create type spice_level as enum ('mild', 'medium', 'hot');

create type stock_movement_kind as enum ('receipt', 'sale', 'consumption', 'production', 'adjustment');

create table customers (
  id text not null,
  name text not null,
  phone text,
  initials text not null,
  address text,
  joined_at date default CURRENT_DATE not null,
  plan_status plan_status default 'none'::plan_status not null,
  segment customer_segment default 'new'::customer_segment not null,
  created_at timestamp with time zone default now() not null,
  user_id uuid,
  email text,
  updated_at timestamp with time zone default now() not null,
  avatar_url text
);

create table inventory_items (
  id text not null,
  type inventory_item_type not null,
  name text not null,
  description text,
  unit text not null,
  quantity_on_hand numeric default 0 not null,
  low_stock_threshold numeric default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  image_url text,
  updated_at timestamp with time zone default now() not null
);

create table item_categories (
  code text not null,
  label text not null,
  hint text not null,
  sort_order integer default 0 not null
);

create table order_items (
  id uuid default gen_random_uuid() not null,
  order_id text not null,
  product_id text not null,
  pack_size pack_size_label,
  qty integer not null,
  price numeric(10,2) not null,
  pack_qty numeric(12,3) not null,
  pack_unit text not null
);

create table order_status_events (
  id bigint not null,
  order_id text not null,
  from_status order_status,
  to_status order_status not null,
  changed_at timestamp with time zone default now() not null,
  changed_by uuid
);

create table orders (
  id text not null,
  customer_id text not null,
  status order_status default 'pending'::order_status not null,
  kind order_kind default 'one_time'::order_kind not null,
  placed_at timestamp with time zone default now() not null,
  packed_date date,
  eta timestamp with time zone,
  delivered_at timestamp with time zone,
  address text not null,
  updated_at timestamp with time zone default now() not null
);

create table product_pack_sizes (
  id uuid default gen_random_uuid() not null,
  product_id text not null,
  size pack_size_label,
  price numeric(10,2) not null,
  stock_units numeric default 1,
  pack_qty numeric(12,3) not null
);

create table products (
  id text not null,
  name text not null,
  category product_category,
  description text default ''::text not null,
  discount_percent integer default 0 not null,
  spice_level spice_level,
  batch_capacity integer,
  units_packed_this_batch integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  image_url text,
  updated_at timestamp with time zone default now() not null,
  origin item_origin not null,
  is_sellable boolean default true not null,
  is_consumable boolean default false not null,
  stock_unit text default 'packs'::text not null,
  low_stock_threshold numeric default 0 not null,
  sales_unit text,
  sales_to_stock_factor numeric default 1 not null,
  item_category text generated always as (
CASE
    WHEN (origin = 'manufactured'::item_origin) THEN 'manufacturing'::text
    WHEN is_consumable THEN 'raw_material'::text
    ELSE 'b2b'::text
END) stored
);

create table profiles (
  id uuid not null,
  email text not null,
  role text default 'customer'::text not null,
  created_at timestamp with time zone default now() not null
);

create table stock_movements (
  id bigint not null,
  item_id text not null,
  kind stock_movement_kind not null,
  qty numeric not null,
  unit_cost numeric,
  occurred_at timestamp with time zone default now() not null,
  order_id text,
  note text,
  created_at timestamp with time zone default now() not null,
  batch_no text
);

create table units_of_measure (
  code text not null,
  name text not null,
  dimension text not null,
  base_factor numeric not null,
  sort_order integer default 0 not null
);

alter table customers add constraint customers_user_id_key UNIQUE (user_id);

alter table customers add constraint customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

alter table customers add constraint customers_pkey PRIMARY KEY (id);

alter table inventory_items add constraint inventory_items_pkey PRIMARY KEY (id);

alter table inventory_items add constraint inventory_items_threshold_non_negative CHECK ((low_stock_threshold >= (0)::numeric));

alter table inventory_items add constraint inventory_items_qty_non_negative CHECK ((quantity_on_hand >= (0)::numeric));

alter table item_categories add constraint item_categories_pkey PRIMARY KEY (code);

alter table order_items add constraint order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

alter table order_items add constraint order_items_pkey PRIMARY KEY (id);

alter table order_items add constraint order_items_qty_positive CHECK ((qty > 0));

alter table order_items add constraint order_items_price_non_negative CHECK ((price >= (0)::numeric));

alter table order_items add constraint order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

alter table order_items add constraint order_items_pack_unit_fkey FOREIGN KEY (pack_unit) REFERENCES units_of_measure(code);

alter table order_items add constraint order_items_order_product_pack_key UNIQUE (order_id, product_id, pack_qty);

alter table order_items add constraint order_items_pack_qty_positive CHECK ((pack_qty > (0)::numeric));

alter table order_status_events add constraint order_status_events_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);

alter table order_status_events add constraint order_status_events_pkey PRIMARY KEY (id);

alter table order_status_events add constraint order_status_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

alter table orders add constraint orders_pkey PRIMARY KEY (id);

alter table orders add constraint orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);

alter table product_pack_sizes add constraint product_pack_sizes_product_id_pack_qty_key UNIQUE (product_id, pack_qty);

alter table product_pack_sizes add constraint product_pack_sizes_pkey PRIMARY KEY (id);

alter table product_pack_sizes add constraint product_pack_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

alter table product_pack_sizes add constraint product_pack_sizes_stock_units_positive CHECK ((stock_units > (0)::numeric));

alter table product_pack_sizes add constraint product_pack_sizes_pack_qty_positive CHECK ((pack_qty > (0)::numeric));

alter table product_pack_sizes add constraint product_pack_sizes_price_non_negative CHECK ((price >= (0)::numeric));

alter table products add constraint products_sales_factor_positive CHECK ((sales_to_stock_factor > (0)::numeric));

alter table products add constraint products_batch_capacity_positive CHECK ((batch_capacity > 0));

alter table products add constraint products_units_packed_non_negative CHECK ((units_packed_this_batch >= 0));

alter table products add constraint products_units_within_capacity CHECK ((units_packed_this_batch <= batch_capacity));

alter table products add constraint products_batch_capacity_manufactured_only CHECK (((batch_capacity IS NULL) OR (origin = 'manufactured'::item_origin)));

alter table products add constraint products_category_sellable_only CHECK (((category IS NULL) OR is_sellable));

alter table products add constraint products_low_stock_threshold_non_negative CHECK ((low_stock_threshold >= (0)::numeric));

alter table products add constraint products_discount_range CHECK (((discount_percent >= 0) AND (discount_percent <= 100)));

alter table products add constraint products_sales_unit_required_when_sellable CHECK (((NOT is_sellable) OR (sales_unit IS NOT NULL)));

alter table products add constraint products_stock_unit_fkey FOREIGN KEY (stock_unit) REFERENCES units_of_measure(code);

alter table products add constraint products_sales_unit_fkey FOREIGN KEY (sales_unit) REFERENCES units_of_measure(code);

alter table products add constraint products_item_category_fkey FOREIGN KEY (item_category) REFERENCES item_categories(code);

alter table products add constraint products_pkey PRIMARY KEY (id);

alter table profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table profiles add constraint profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'customer'::text])));

alter table profiles add constraint profiles_pkey PRIMARY KEY (id);

alter table stock_movements add constraint stock_movements_qty_non_zero CHECK ((qty <> (0)::numeric));

alter table stock_movements add constraint stock_movements_unit_cost_non_negative CHECK (((unit_cost IS NULL) OR (unit_cost >= (0)::numeric)));

alter table stock_movements add constraint stock_movements_direction CHECK ((((kind = ANY (ARRAY['receipt'::stock_movement_kind, 'production'::stock_movement_kind])) AND (qty > (0)::numeric)) OR ((kind = ANY (ARRAY['sale'::stock_movement_kind, 'consumption'::stock_movement_kind])) AND (qty < (0)::numeric)) OR (kind = 'adjustment'::stock_movement_kind)));

alter table stock_movements add constraint stock_movements_receipt_has_cost CHECK (((kind <> 'receipt'::stock_movement_kind) OR (unit_cost IS NOT NULL)));

alter table stock_movements add constraint stock_movements_pkey PRIMARY KEY (id);

alter table stock_movements add constraint stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES products(id);

alter table stock_movements add constraint stock_movements_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

alter table units_of_measure add constraint units_of_measure_base_factor_check CHECK ((base_factor > (0)::numeric));

alter table units_of_measure add constraint units_of_measure_pkey PRIMARY KEY (code);

alter table units_of_measure add constraint units_of_measure_dimension_check CHECK ((dimension = ANY (ARRAY['weight'::text, 'volume'::text, 'count'::text])));

CREATE INDEX customers_name_trgm_idx ON public.customers USING gin (name gin_trgm_ops);

CREATE INDEX customers_user_id_idx ON public.customers USING btree (user_id);

CREATE INDEX customers_phone_trgm_idx ON public.customers USING gin (phone gin_trgm_ops);

CREATE UNIQUE INDEX customers_email_unique_idx ON public.customers USING btree (lower(email)) WHERE (email IS NOT NULL);

CREATE INDEX inventory_items_type_active_idx ON public.inventory_items USING btree (type, is_active);

CREATE INDEX inventory_items_name_trgm_idx ON public.inventory_items USING gin (name gin_trgm_ops);

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);

CREATE INDEX order_status_events_order_id_idx ON public.order_status_events USING btree (order_id, changed_at);

CREATE INDEX orders_placed_at_idx ON public.orders USING btree (placed_at);

CREATE INDEX orders_id_trgm_idx ON public.orders USING gin (id gin_trgm_ops);

CREATE INDEX orders_status_placed_at_idx ON public.orders USING btree (status, placed_at DESC);

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);

CREATE INDEX products_item_category_active_idx ON public.products USING btree (item_category, is_active);

CREATE INDEX products_is_active_idx ON public.products USING btree (is_active);

CREATE INDEX products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);

CREATE UNIQUE INDEX products_active_name_unique_idx ON public.products USING btree (lower(name)) WHERE is_active;

CREATE UNIQUE INDEX stock_movements_one_sale_per_order_line ON public.stock_movements USING btree (order_id, item_id) WHERE (kind = 'sale'::stock_movement_kind);

CREATE UNIQUE INDEX stock_movements_batch_no_key ON public.stock_movements USING btree (batch_no) WHERE (batch_no IS NOT NULL);

CREATE INDEX stock_movements_item_idx ON public.stock_movements USING btree (item_id, occurred_at);

CREATE INDEX stock_movements_order_idx ON public.stock_movements USING btree (order_id) WHERE (order_id IS NOT NULL);

create view customers_with_stats as  SELECT c.id,
    c.name,
    c.phone,
    c.email,
    c.initials,
    c.address,
    c.joined_at,
    c.plan_status,
    c.segment,
    c.created_at,
    COALESCE(count(o.id) FILTER (WHERE o.status <> 'cancelled'::order_status), 0::bigint) AS total_orders,
    COALESCE(sum(ot.total) FILTER (WHERE o.status <> 'cancelled'::order_status), 0::numeric)::numeric(10,2) AS total_spend,
    max(o.placed_at) AS last_order_at,
    max(o.placed_at) >= (now() - '90 days'::interval) AS is_active,
    c.updated_at,
    c.avatar_url,
    c.user_id
   FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     LEFT JOIN orders_with_total ot ON ot.id = o.id
  GROUP BY c.id;

create view dashboard_kpis as  SELECT COALESCE(sum(total) FILTER (WHERE status <> 'cancelled'::order_status), 0::numeric)::numeric(12,2) AS total_revenue,
    COALESCE(sum(total) FILTER (WHERE status <> 'cancelled'::order_status AND date_trunc('month'::text, (placed_at AT TIME ZONE 'Asia/Kolkata'::text)) = date_trunc('month'::text, (now() AT TIME ZONE 'Asia/Kolkata'::text))), 0::numeric)::numeric(12,2) AS month_revenue,
    count(*) FILTER (WHERE status = 'pending'::order_status)::integer AS pending_orders,
    count(*) FILTER (WHERE status = ANY (ARRAY['processing'::order_status, 'packed'::order_status, 'shipped'::order_status]))::integer AS active_orders
   FROM orders_with_total t;

create view dashboard_today as  SELECT count(*)::integer AS total_orders,
    count(*) FILTER (WHERE status = 'pending'::order_status)::integer AS pending,
    count(*) FILTER (WHERE status = 'processing'::order_status)::integer AS processing,
    count(*) FILTER (WHERE status = 'packed'::order_status)::integer AS packed,
    count(*) FILTER (WHERE status = 'delivered'::order_status)::integer AS delivered
   FROM orders_with_total
  WHERE (placed_at AT TIME ZONE 'Asia/Kolkata'::text)::date = (now() AT TIME ZONE 'Asia/Kolkata'::text)::date;

create view item_stock as  WITH last_receipt AS (
         SELECT DISTINCT ON (stock_movements.item_id) stock_movements.item_id,
            stock_movements.unit_cost,
            stock_movements.occurred_at,
            stock_movements.batch_no
           FROM stock_movements
          WHERE stock_movements.kind = 'receipt'::stock_movement_kind
          ORDER BY stock_movements.item_id, stock_movements.occurred_at DESC, stock_movements.id DESC
        ), costed AS (
         SELECT stock_movements.item_id,
            sum(stock_movements.qty * stock_movements.unit_cost) AS purchase_spend,
            sum(stock_movements.qty) AS purchased_qty
           FROM stock_movements
          WHERE stock_movements.kind = 'receipt'::stock_movement_kind
          GROUP BY stock_movements.item_id
        )
 SELECT p.id AS item_id,
    p.name,
    p.origin,
    p.is_sellable,
    p.is_consumable,
    p.stock_unit,
    p.sales_unit,
    p.sales_to_stock_factor,
    p.low_stock_threshold,
    COALESCE(sum(m.qty), 0::numeric)::numeric(12,3) AS quantity_on_hand,
    (c.purchase_spend / NULLIF(c.purchased_qty, 0::numeric))::numeric(12,2) AS avg_unit_cost,
    (COALESCE(sum(m.qty), 0::numeric) * (c.purchase_spend / NULLIF(c.purchased_qty, 0::numeric)))::numeric(12,2) AS stock_value,
    COALESCE(sum(m.qty), 0::numeric) <= p.low_stock_threshold AS is_low_stock,
    lr.unit_cost::numeric(12,2) AS last_purchase_cost,
    lr.occurred_at AS last_purchased_at,
    lr.batch_no AS last_batch_no
   FROM products p
     LEFT JOIN stock_movements m ON m.item_id = p.id
     LEFT JOIN last_receipt lr ON lr.item_id = p.id
     LEFT JOIN costed c ON c.item_id = p.id
  WHERE p.is_active
  GROUP BY p.id, lr.unit_cost, lr.occurred_at, lr.batch_no, c.purchase_spend, c.purchased_qty;

create view order_line_revenue as  SELECT o.id AS order_id,
    o.placed_at,
    o.status,
    oi.product_id,
    p.name AS product_name,
    oi.qty,
    oi.price,
    (oi.qty::numeric * oi.price)::numeric(10,2) AS line_total
   FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
  WHERE o.status <> 'cancelled'::order_status;

create view order_status_counts as  SELECT status,
    count(*)::integer AS count
   FROM orders
  GROUP BY status;

create view orders_with_total as  SELECT o.id,
    o.customer_id,
    o.status,
    o.kind,
    o.placed_at,
    o.packed_date,
    o.eta,
    o.delivered_at,
    o.address,
    COALESCE(sum(oi.qty::numeric * oi.price), 0::numeric)::numeric(10,2) AS total
   FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id;

create view revenue_by_day as  SELECT placed_at::date AS day,
    sum(line_total)::numeric(10,2) AS revenue
   FROM order_line_revenue
  GROUP BY (placed_at::date)
  ORDER BY (placed_at::date);

create view revenue_by_product as  SELECT product_id,
    product_name,
    sum(qty)::integer AS units_sold,
    sum(line_total)::numeric(10,2) AS revenue
   FROM order_line_revenue
  GROUP BY product_id, product_name
  ORDER BY (sum(line_total)::numeric(10,2)) DESC;

create view revenue_by_product_by_day as  SELECT product_id,
    product_name,
    placed_at::date AS day,
    sum(line_total)::numeric(10,2) AS revenue
   FROM order_line_revenue
  GROUP BY product_id, product_name, (placed_at::date)
  ORDER BY product_id, (placed_at::date);

CREATE OR REPLACE FUNCTION public.assign_batch_no()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Only stock arriving forms a batch. Sales and consumption draw from
  -- the pooled balance, which is what weighted-average costing means.
  if new.kind = 'receipt' and new.batch_no is null then
    new.batch_no :=
      'BN-'
      || to_char(coalesce(new.occurred_at, now()) at time zone 'Asia/Kolkata', 'YYYYMMDD')
      || '-'
      || lpad(nextval('stock_batch_no_seq')::text, 4, '0');
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.despatch_order_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.status in ('shipped','delivered')
     and (tg_op='INSERT' or old.status is distinct from new.status)
     and (tg_op='INSERT' or old.status not in ('shipped','delivered'))
  then
    insert into stock_movements (item_id, kind, qty, order_id, note)
    select oi.product_id, 'sale',
           /* The line snapshots the pack quantity in the selling unit, so the
              draw-down is that times the item's selling-to-stock factor. */
           -sum(oi.qty * oi.pack_qty * p.sales_to_stock_factor),
           new.id, 'Despatched with order ' || new.id
      from order_items oi join products p on p.id = oi.product_id
     where oi.order_id = new.id group by oi.product_id
    on conflict (order_id, item_id) where kind = 'sale' do nothing;
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;

CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
  v_avatar text;
  v_customer_id text;
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;

  if new.raw_app_meta_data->>'provider' = 'google' then
    v_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email);
    v_avatar := coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');

    update public.customers
    set user_id = new.id,
        avatar_url = coalesce(avatar_url, v_avatar)
    where lower(email) = lower(new.email) and user_id is null;

    if not found then
      v_customer_id := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
      insert into public.customers (id, user_id, name, email, avatar_url, initials)
      values (
        v_customer_id, new.id, v_name, new.email, v_avatar,
        upper(left(coalesce(v_name, 'C'), 2))
      )
      on conflict (user_id) do nothing;
    end if;
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if tg_op = 'INSERT' then
    insert into order_status_events (order_id, from_status, to_status)
    values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into order_status_events (order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;

CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;

CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;

CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;

CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;

CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER inventory_items_set_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_log_status_insert AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

CREATE TRIGGER orders_log_status_update AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

CREATE TRIGGER orders_despatch_stock_insert AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION despatch_order_stock();

CREATE TRIGGER orders_despatch_stock_update AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION despatch_order_stock();

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER stock_movements_assign_batch_no BEFORE INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION assign_batch_no();

alter table customers enable row level security;

alter table inventory_items enable row level security;

alter table item_categories enable row level security;

alter table order_items enable row level security;

alter table order_status_events enable row level security;

alter table orders enable row level security;

alter table product_pack_sizes enable row level security;

alter table products enable row level security;

alter table profiles enable row level security;

alter table stock_movements enable row level security;

alter table units_of_measure enable row level security;
