-- Soft delete was a single boolean: is_active said an item had been removed
-- but not when, or by whom. A removal is an action someone took and should
-- be answerable for.
--
-- is_active stays as the flag every read and the partial unique index filter
-- on. The check constraint keeps the two from drifting apart, so a row can
-- never claim to be live while carrying a removal date.

alter table products
  add column deleted_at timestamptz,
  add column deleted_by uuid references profiles(id);

-- Existing removals have no record of when they happened; updated_at is the
-- closest honest approximation.
update products set deleted_at = updated_at where not is_active and deleted_at is null;

alter table products add constraint products_removal_is_consistent
  check ((is_active and deleted_at is null) or (not is_active and deleted_at is not null));
