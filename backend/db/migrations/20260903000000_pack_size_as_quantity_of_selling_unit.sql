-- A pack size is a quantity of the item's selling unit, not a label off a
-- shared enum. "250g" cannot describe an oil sold in litres, and a fixed
-- four-value enum cannot describe a catalogue that grows.
--
-- Applied against the linked project on 2026-09-03. The three DROP COLUMN
-- statements at the end are left commented out: the columns are backfilled,
-- unused and nullable, and dropping them needs a deliberate go-ahead.

-- 1. Manufactured goods measure themselves in a real unit. Several were left
--    on the 'pack' default, which cannot express a pack size at all.
update products set stock_unit = 'kg', sales_unit = 'kg', sales_to_stock_factor = 1
 where item_category = 'manufacturing' and strpos(lower(name), 'oil') = 0;

update products set stock_unit = 'l', sales_unit = 'l', sales_to_stock_factor = 1
 where item_category = 'manufacturing' and strpos(lower(name), 'oil') > 0;

-- Coconut oil is bought by weight and sold by volume.
update products set stock_unit = 'kg', sales_unit = 'l', sales_to_stock_factor = 1
 where id = 'p-9';

-- 2. The pack quantity, expressed in that selling unit.
alter table product_pack_sizes add column pack_qty numeric(12,3);
update product_pack_sizes set pack_qty = case size::text
  when '250g' then 0.25 when '500g' then 0.5 when '1kg' then 1 when '2kg' then 2 end;
alter table product_pack_sizes
  alter column pack_qty set not null,
  add constraint product_pack_sizes_pack_qty_positive check (pack_qty > 0);

-- 3. An order line snapshots what was sold, so history survives a pack size
--    being repriced or withdrawn. That is also why the FK to the live
--    catalogue below is dropped rather than repointed.
alter table order_items add column pack_qty numeric(12,3), add column pack_unit text;
update order_items oi set pack_qty = case oi.pack_size::text
    when '250g' then 0.25 when '500g' then 0.5 when '1kg' then 1 when '2kg' then 2 end,
  pack_unit = p.sales_unit
  from products p where p.id = oi.product_id;
alter table order_items
  alter column pack_qty set not null,
  alter column pack_unit set not null,
  add constraint order_items_pack_qty_positive check (pack_qty > 0),
  add constraint order_items_pack_unit_fkey foreign key (pack_unit) references units_of_measure(code);

-- 4. Despatch draws down from the line's own snapshot, so it no longer needs
--    to look the pack up in the catalogue at all.
create or replace function public.despatch_order_stock() returns trigger language plpgsql as $fn$
begin
  if new.status in ('shipped','delivered')
     and (tg_op='INSERT' or old.status is distinct from new.status)
     and (tg_op='INSERT' or old.status not in ('shipped','delivered'))
  then
    insert into stock_movements (item_id, kind, qty, order_id, note)
    select oi.product_id, 'sale',
           -sum(oi.qty * oi.pack_qty * p.sales_to_stock_factor),
           new.id, 'Despatched with order ' || new.id
      from order_items oi join products p on p.id = oi.product_id
     where oi.order_id = new.id group by oi.product_id
    on conflict (order_id, item_id) where kind = 'sale' do nothing;
  end if;
  return new;
end $fn$;

-- 5. Identity moves from the label to the quantity.
alter table order_items drop constraint order_items_product_pack_size_fkey;
alter table order_items drop constraint order_items_order_product_size_key;
alter table order_items add constraint order_items_order_product_pack_key
  unique (order_id, product_id, pack_qty);
alter table product_pack_sizes drop constraint product_pack_sizes_product_id_size_key;
alter table product_pack_sizes add constraint product_pack_sizes_product_id_pack_qty_key
  unique (product_id, pack_qty);

-- 6. The old labels are dead but retained; nullable so a free-form quantity
--    such as 0.1 l, which has no enum label, can still be written.
alter table order_items alter column pack_size drop not null;
alter table product_pack_sizes
  alter column size drop not null,
  alter column stock_units drop not null;

-- Pending sign-off:
-- alter table order_items drop column pack_size;
-- alter table product_pack_sizes drop column size;
-- alter table product_pack_sizes drop column stock_units;
-- drop type pack_size_label;
