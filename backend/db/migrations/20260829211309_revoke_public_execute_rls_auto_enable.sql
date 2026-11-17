-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

-- The earlier revoke targeted anon/authenticated directly, but EXECUTE was
-- actually granted to the PUBLIC pseudo-role (Postgres's default for new
-- functions), which anon/authenticated inherit through regardless. Revoking
-- from PUBLIC is what actually removes anon/authenticated's ability to call
-- this SECURITY DEFINER function over RPC.
revoke execute on function public.rls_auto_enable() from public;
;
