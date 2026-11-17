-- Two things, both about bought-in stock.
--
-- 1. Repairing units this project got wrong.
--
-- An earlier migration was flattened onto one line by the CLI and its WHERE
-- clause was lost, setting every product to litres. Only the manufactured
-- rows were repaired at the time; raw materials and B2B goods were left
-- measuring soap bars and peppercorns in litres.
--
-- The original units are not recoverable — these items were created during
-- the period this folder does not cover — so they are set by what each item
-- plainly is. Quantities are untouched: 300 was always 300 bars, it was only
-- ever labelled wrong.

update products set stock_unit = 'kg', sales_unit = null, sales_to_stock_factor = 1
 where item_category = 'raw_material' and is_active and stock_unit = 'l';

-- Nothing sells a raw material, so it carries no selling unit at all.
update products set sales_unit = null where item_category = 'raw_material' and sales_unit is not null;

update products set stock_unit = 'pcs', sales_unit = 'pcs', sales_to_stock_factor = 1
 where item_category = 'b2b' and is_active and name ilike '%soap%';

update products set stock_unit = 'kg', sales_unit = 'kg', sales_to_stock_factor = 1
 where item_category = 'b2b' and is_active and stock_unit = 'l';

-- 2. B2B goods can be priced.
--
-- No schema change is needed. A B2B item is bought and resold as it is, so
-- what it sells for is a quantity of its selling unit and an amount — the
-- same shape product_pack_sizes already holds for a manufactured pack. The
-- table never restricted itself to manufactured goods; only the API did.
--
-- Reusing it means the storefront catalogue, the cart, checkout, order lines
-- and the despatch draw-down all price a B2B good with no special case. The
-- alternative, a scalar selling_price column on products, would have meant a
-- second pricing shape for every one of those to understand.
