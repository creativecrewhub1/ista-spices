-- Two things the customer list claimed to know and did not.
--
-- is_active was computed in customers_with_stats as "ordered within the last
-- 90 days". Nobody chose 90 days; it decided who counted as an active
-- customer on a rule the shop never set, and the Active/Inactive tabs
-- filtered on it as though it were a fact.
--
-- VIP was a value of the segment column with nothing behind it. No rule
-- promoted anyone to it, so the one customer marked VIP was marked by hand
-- at seed time. New and Regular stay, and are equally undecided, but they at
-- least remain as somewhere to put a rule when there is one.
--
-- Nothing measured is lost: total_orders, total_spend and last_order_at are
-- all still there, and they are the figures these two were pretending to
-- summarise.

-- The one VIP becomes Regular. There is no rule to re-derive it from.
update customers set segment = 'regular' where segment = 'vip';

-- Postgres cannot drop a value from an enum, so the type is rebuilt. The
-- view reads the column, so it stands aside and is recreated below.
drop view customers_with_stats;

alter table customers alter column segment drop default;
create type customer_segment_new as enum ('new', 'regular');
alter table customers
  alter column segment type customer_segment_new using segment::text::customer_segment_new;
drop type customer_segment;
alter type customer_segment_new rename to customer_segment;
alter table customers alter column segment set default 'new'::customer_segment;

create view customers_with_stats as
select c.id,
  c.name,
  c.phone,
  c.email,
  c.initials,
  c.address,
  c.joined_at,
  c.plan_status,
  c.segment,
  c.created_at,
  coalesce(count(o.id) filter (where o.status <> 'cancelled'::order_status), 0::bigint) as total_orders,
  coalesce(sum(ot.total) filter (where o.status <> 'cancelled'::order_status), 0::numeric)::numeric(10,2) as total_spend,
  max(o.placed_at) as last_order_at,
  -- is_active was here. See the note at the top of this file.
  c.updated_at,
  c.avatar_url,
  c.user_id
 from customers c
   left join orders o on o.customer_id = c.id
   left join orders_with_total ot on ot.id = o.id
 group by c.id;
