-- customers_with_stats didn't expose avatar_url, updated_at, or user_id, so
-- there was no way to query it for "my profile" (a self-service lookup by
-- user_id) or to know when a customer's own edits last changed. New columns
-- must be appended at the end of the select list — Postgres refuses
-- CREATE OR REPLACE VIEW if it would reposition or rename an existing
-- output column, even when the underlying names match.

create or replace view customers_with_stats as
select
  c.id,
  c.name,
  c.phone,
  c.email,
  c.initials,
  c.address,
  c.joined_at,
  c.plan_status,
  c.segment,
  c.created_at,
  coalesce(count(o.id) filter (where o.status <> 'cancelled'), 0) as total_orders,
  coalesce(sum(ot.total) filter (where o.status <> 'cancelled'), 0)::numeric(10,2) as total_spend,
  max(o.placed_at) as last_order_at,
  max(o.placed_at) >= (now() - interval '90 days') as is_active,
  c.updated_at,
  c.avatar_url,
  c.user_id
from customers c
left join orders o on o.customer_id = c.id
left join orders_with_total ot on ot.id = o.id
group by c.id;
