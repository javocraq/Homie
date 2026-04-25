-- ============================================================
-- Homie CMS — Hero carousel images (up to 5 slides editables)
-- Ejecutar UNA VEZ en Supabase SQL Editor (Project → SQL).
-- Crea la tabla hero_images, RLS (lectura pública, escritura
-- solo authenticated) e idempotente.
-- El bucket `blog-images` ya existe (ver cms_storage.sql); las
-- imágenes del hero se guardan en la carpeta `hero/`.
-- ============================================================

-- 1. Tabla
create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_alt text,
  display_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_images_order_idx
  on public.hero_images (display_order asc);

-- 2. Trigger para actualizar updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hero_images_set_updated_at on public.hero_images;
create trigger hero_images_set_updated_at
  before update on public.hero_images
  for each row execute function public.set_updated_at();

-- 3. RLS
alter table public.hero_images enable row level security;

drop policy if exists "hero_images_public_read" on public.hero_images;
drop policy if exists "hero_images_auth_insert" on public.hero_images;
drop policy if exists "hero_images_auth_update" on public.hero_images;
drop policy if exists "hero_images_auth_delete" on public.hero_images;

create policy "hero_images_public_read"
on public.hero_images for select
to public
using (true);

create policy "hero_images_auth_insert"
on public.hero_images for insert
to authenticated
with check (true);

create policy "hero_images_auth_update"
on public.hero_images for update
to authenticated
using (true)
with check (true);

create policy "hero_images_auth_delete"
on public.hero_images for delete
to authenticated
using (true);

-- 4. Storage bucket (idempotente — crea `blog-images` si aún no existe)
-- Las imágenes del hero se guardan en la carpeta `hero/` dentro del mismo
-- bucket usado por el blog y los testimonios.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

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

-- 5. Verificación
select id, image_url, display_order, is_active
from public.hero_images
order by display_order asc;
