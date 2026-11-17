-- A Google login previously created only a `profiles` row — no `customers`
-- row existed until the customer's first checkout, so a logged-in-but-never-
-- ordered customer was invisible in the admin Customers page. This makes
-- Google signup create a `customers` row immediately, using whatever Google
-- provides (name, photo, email); phone/address are relaxed to nullable since
-- Google never supplies them — checkout already validates both are present
-- before it ever writes them, so that requirement is unaffected.
--
-- The password-based admin signup must never get an auto-created customer
-- row, so the trigger branches on the auth provider (`google` vs `email`)
-- rather than anything decided at profile-creation time.

alter table public.customers
  alter column phone drop not null,
  alter column address drop not null,
  add column avatar_url text;

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
    v_customer_id := 'c-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

    insert into public.customers (id, user_id, name, email, avatar_url, initials)
    values (
      v_customer_id, new.id, v_name, new.email, v_avatar,
      upper(left(coalesce(v_name, 'C'), 2))
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
