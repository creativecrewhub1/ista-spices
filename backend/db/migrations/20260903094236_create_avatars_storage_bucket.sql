-- Public read (so <img> tags hit the CDN URL directly, no auth round trip)
-- but writes only ever happen through the Edge Function's service-role
-- client — the anon key has no upload path into this bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 3145728, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
