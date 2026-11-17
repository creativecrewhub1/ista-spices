-- customers_email_unique_idx already enforces one row per email. The
-- signup trigger's plain INSERT didn't account for that: if a walk-in
-- customer already exists with the email someone later signs into Google
-- with, the INSERT would violate that unique index and fail — which,
-- inside a trigger on auth.users, aborts the entire signup. Fixed by
-- linking the existing walk-in row instead of inserting a duplicate.
--
-- Verified 2026-09-03: before this fix, a walk-in customer entered by an
-- admin followed by a Google signup with the same email would fail the
-- signup outright (unique constraint violation inside the trigger). After
-- this fix, the existing row is linked (its name/phone/address are kept —
-- only user_id and a missing avatar_url are filled in) and the signup
-- succeeds.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_avatar text;
  v_customer_id text;
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;

  if new.raw_app_meta_data->>'provider' = 'google' then
    v_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email);
    v_avatar := coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');

    update public.customers
    set user_id = new.id,
        avatar_url = coalesce(avatar_url, v_avatar)
    where lower(email) = lower(new.email) and user_id is null;

    if not found then
      v_customer_id := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
      insert into public.customers (id, user_id, name, email, avatar_url, initials)
      values (
        v_customer_id, new.id, v_name, new.email, v_avatar,
        upper(left(coalesce(v_name, 'C'), 2))
      )
      on conflict (user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;
