-- A price can say what quantity it is for.
--
-- Pears are bought by the box and sold by the piece, and the shop wants three
-- prices: one piece, a pack of six, a box of twenty. The quantities already
-- expressed that — 1, 6, 20 pieces — but read back as bare numbers, so the
-- row that is "a box" looked like any other quantity.
--
-- packaging names it. The quantity stays in the item's sales unit and remains
-- the only thing the arithmetic uses, so naming a row changes the label and
-- nothing else: despatch still draws qty * pack_qty * sales_to_stock_factor.

alter table product_pack_sizes add column packaging text references units_of_measure(code);

comment on column product_pack_sizes.packaging is
  'Optional name for how this quantity is sold: a piece, a pack, a box. The quantity itself stays in the item sales_unit.';
