-- Recovered from the remote migration history on 2026-09-03.
-- Applied 2026-09-01.

-- Products and inventory items each get a single display image. Nullable: a
-- catalogue entry is valid before its photo exists, and the frontend falls back
-- to a painted spice-colour tile whenever this is null.
alter table public.products add column if not exists image_url text;
alter table public.inventory_items add column if not exists image_url text;

comment on column public.products.image_url is
  'Display image. Either an app-relative path (/images/products/x.jpg) or an absolute URL.';
comment on column public.inventory_items.image_url is
  'Display image. Either an app-relative path (/images/products/x.jpg) or an absolute URL.';
;
