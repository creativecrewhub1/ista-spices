-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

-- All data access now goes through the "api" Edge Function using the
-- service_role key, which bypasses RLS by design. The frontend no longer
-- talks to Postgres directly, so these open "allow all" policies are no
-- longer needed — drop them so anon/authenticated have zero access.
drop policy "allow all (no auth yet)" on products;
drop policy "allow all (no auth yet)" on product_pack_sizes;
drop policy "allow all (no auth yet)" on customers;
drop policy "allow all (no auth yet)" on orders;
drop policy "allow all (no auth yet)" on order_items;
;
