-- Who changed an item, when, and what it was before.
--
-- products already carried created_at/updated_at but nothing else: no author
-- on either, no version, and no history at all — the previous value of a
-- field was simply gone once it was overwritten.
--
-- The log is written by triggers rather than by the API. A repository method
-- can be bypassed by the next one somebody writes; a trigger cannot, so the
-- trail is complete regardless of which code path made the change.

alter table products
  add column created_by uuid references profiles(id),
  add column updated_by uuid references profiles(id),
  add column version integer not null default 1;

create table item_audit_log (
  id bigint generated always as identity primary key,
  item_id text not null references products(id) on delete cascade,
  version integer not null,
  action text not null check (action in ('created', 'updated', 'removed', 'restored')),
  changed_at timestamptz not null default now(),
  changed_by uuid references profiles(id),
  changes jsonb not null
);

create index item_audit_log_item_time_idx on item_audit_log (item_id, changed_at desc, id desc);
alter table item_audit_log enable row level security;

-- Names were stored as typed. A trailing space is invisible in the form but
-- makes the name a different string to everything that compares it.
update products set name = btrim(name) where name <> btrim(name);

-- An image is a base64 blob of a few hundred KB. Recording that it changed is
-- the point; carrying both copies into the log is not.
create or replace function public.audit_shorten(value jsonb) returns jsonb
language sql immutable as $fn$
  select case
    when value is null then null
    when jsonb_typeof(value) = 'string' and length(value #>> '{}') > 120
      then to_jsonb('(' || length(value #>> '{}') || ' characters)')
    else value
  end
$fn$;

create or replace function public.audit_diff(before jsonb, after jsonb, skip text[])
returns jsonb language plpgsql immutable as $fn$
declare
  result jsonb := '{}'::jsonb;
  key text;
  was jsonb;
  now_value jsonb;
begin
  for key in select * from jsonb_object_keys(after) loop
    if key = any(skip) then continue; end if;
    was := before -> key;
    now_value := after -> key;
    /* On a creation `before` is empty, so an absent key and a column that is
       genuinely null would otherwise read as a change from nothing to null. */
    if was is null and jsonb_typeof(now_value) = 'null' then continue; end if;
    if was is distinct from now_value then
      result := result || jsonb_build_object(key, jsonb_build_object(
        'from', public.audit_shorten(was),
        'to', public.audit_shorten(now_value)));
    end if;
  end loop;
  return result;
end $fn$;

create or replace function public.products_touch() returns trigger
language plpgsql as $fn$
begin
  /* item_category is generated, so it is still null on NEW at BEFORE time and
     would read as a change on every write. The AFTER trigger, where it has
     been computed, does compare it. */
  if public.audit_diff(to_jsonb(old), to_jsonb(new),
                       array['updated_at', 'version', 'item_category']) <> '{}'::jsonb then
    new.updated_at := now();
    new.version := old.version + 1;
  else
    /* products_set_updated_at has already stamped now() by this point.
       A write that changed nothing did not update the row. */
    new.updated_at := old.updated_at;
  end if;
  return new;
end $fn$;

create or replace function public.products_audit() returns trigger
language plpgsql as $fn$
declare
  diff jsonb;
  what text;
  ignored text[] := array['updated_at', 'version', 'created_by', 'updated_by'];
begin
  if tg_op = 'INSERT' then
    insert into item_audit_log (item_id, version, action, changed_by, changes)
    values (new.id, new.version, 'created', new.created_by,
            public.audit_diff('{}'::jsonb, to_jsonb(new), ignored));
    return new;
  end if;

  /* created_by and updated_by are left out of the diff: every entry already
     names who made the change, so repeating it as a field is noise. */
  diff := public.audit_diff(to_jsonb(old), to_jsonb(new), ignored);
  if diff = '{}'::jsonb then
    return new;
  end if;

  /* Leaving and returning to the catalogue are their own events, not edits. */
  what := case
    when old.is_active and not new.is_active then 'removed'
    when not old.is_active and new.is_active then 'restored'
    else 'updated'
  end;

  insert into item_audit_log (item_id, version, action, changed_by, changes)
  values (new.id, new.version, what, new.updated_by, diff);
  return new;
end $fn$;

-- Pack sizes live in their own table, so a trigger on products would never
-- see a price change. They log against the item they belong to.
create or replace function public.pack_sizes_audit() returns trigger
language plpgsql as $fn$
declare
  pid text;
  who uuid;
  ver integer;
  label text;
  diff jsonb;
begin
  if tg_op = 'DELETE' then pid := old.product_id; else pid := new.product_id; end if;

  /* A hard-deleted product takes its pack rows with it; there is nothing left
     to attach the entry to. */
  select p.updated_by, p.version into who, ver from products p where p.id = pid;
  if not found then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  if tg_op = 'INSERT' then
    label := 'pack_' || new.pack_qty::text;
    diff := jsonb_build_object(label, jsonb_build_object('from', null, 'to', new.price));
  elsif tg_op = 'DELETE' then
    label := 'pack_' || old.pack_qty::text;
    diff := jsonb_build_object(label, jsonb_build_object('from', old.price, 'to', null));
  else
    if old.price is not distinct from new.price and old.pack_qty is not distinct from new.pack_qty then
      return new;
    end if;
    label := 'pack_' || new.pack_qty::text;
    diff := jsonb_build_object(label, jsonb_build_object('from', old.price, 'to', new.price));
  end if;

  insert into item_audit_log (item_id, version, action, changed_by, changes)
  values (pid, ver, 'updated', who, diff);

  if tg_op = 'DELETE' then return old; else return new; end if;
end $fn$;

create trigger products_touch_before before update on products
  for each row execute function public.products_touch();

create trigger products_audit_after after insert or update on products
  for each row execute function public.products_audit();

create trigger pack_sizes_audit_after after insert or update or delete on product_pack_sizes
  for each row execute function public.pack_sizes_audit();
