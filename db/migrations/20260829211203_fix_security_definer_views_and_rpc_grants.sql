-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

-- Views were created without security_invoker, so PostgREST callers using only
-- the public anon key could read them directly, bypassing RLS on the
-- underlying tables entirely. Switching to security_invoker makes each view
-- run with the querying role's own privileges, so RLS (deny-all, no policies)
-- applies to anon/authenticated the same way it already does for the base
-- tables. The edge function's service_role client is unaffected: service_role
-- bypasses RLS regardless of this setting.
alter view public.customers_with_stats set (security_invoker = on);
alter view public.orders_with_total set (security_invoker = on);
alter view public.order_line_revenue set (security_invoker = on);
alter view public.revenue_by_day set (security_invoker = on);
alter view public.revenue_by_product set (security_invoker = on);
alter view public.revenue_by_product_by_day set (security_invoker = on);

-- rls_auto_enable() is a SECURITY DEFINER function with no reference anywhere
-- in the app codebase, yet was publicly callable via /rest/v1/rpc/rls_auto_enable
-- by both anon and authenticated. Revoking removes that unused attack surface
-- without dropping the function itself.
revoke execute on function public.rls_auto_enable() from anon, authenticated;
;
