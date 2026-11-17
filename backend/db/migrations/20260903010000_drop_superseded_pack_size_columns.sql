-- PENDING — not yet applied.
--
-- The old pack-size label columns are backfilled, unused by any code and
-- nullable, but still present. Dropping them is irreversible, so it waits
-- for a deliberate go-ahead rather than riding along with the change that
-- made them redundant.

alter table order_items drop column pack_size;
alter table product_pack_sizes drop column size;
alter table product_pack_sizes drop column stock_units;
drop type pack_size_label;
