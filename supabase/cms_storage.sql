-- ============================================================
-- Homie CMS — Storage bucket + policies for blog images
-- Run this ONCE in the Supabase SQL Editor (Project → SQL).
-- Creates a public bucket `blog-images` used by the CMS editor
-- for cover images and in-content uploads.
-- ============================================================

-- 1. Bucket (public read, authenticated write)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

-- 2. Policies on storage.objects for this bucket
drop policy if exists "blog_images_public_read" on storage.objects;
drop policy if exists "blog_images_auth_insert" on storage.objects;
drop policy if exists "blog_images_auth_update" on storage.objects;
drop policy if exists "blog_images_auth_delete" on storage.objects;

create policy "blog_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

create policy "blog_images_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images');

create policy "blog_images_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'blog-images')
with check (bucket_id = 'blog-images');

create policy "blog_images_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-images');
