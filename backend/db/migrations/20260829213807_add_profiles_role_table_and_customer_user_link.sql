-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-08-29.

-- Standard Supabase pattern: a profiles table mirrors auth.users, holding
-- app-level data (role) that auth.users itself shouldn't carry. RLS is
-- enabled with no policies, same as every other table here — only the Edge
-- Function's service-role client ever touches it, never the browser directly.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Fires for every new auth user regardless of provider (password or Google),
-- so a Google sign-up always lands as 'customer' by default — this is the
-- actual enforcement of "Google can never grant admin access", not a check
-- the API has to remember to make. Not callable directly: revoked below.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: the one existing user (the admin created earlier via the signup
-- endpoint) becomes role='admin'. Safe to run once — this project has no
-- other auth users yet.
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users
on conflict (id) do update set role = 'admin';

-- Links a CRM customer row to the auth account that owns it, so a logged-in
-- customer's storefront orders can be traced back to their own account.
-- Nullable: existing/manually-entered customers have no login and stay null.
alter table public.customers add column user_id uuid unique references auth.users(id);
create index customers_user_id_idx on public.customers(user_id);
;
