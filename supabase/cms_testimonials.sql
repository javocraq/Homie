-- ============================================================
-- Homie CMS — Guest testimonials table + seed + RLS
-- Also: extend owner_testimonials RLS for CMS edits
-- Run this ONCE in the Supabase SQL Editor (Project → SQL).
-- ============================================================

-- ── 1. guest_testimonials ──────────────────────────────────────
create table if not exists guest_testimonials (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  country         text        not null default '',
  photo_url       text,
  quote           text        not null,
  rating          smallint    not null default 5 check (rating between 1 and 5),
  stay_district   text,
  published_at    timestamptz,
  display_order   integer     not null default 0,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Add published_at if the table was already created without it
alter table guest_testimonials add column if not exists published_at timestamptz;

create index if not exists guest_testimonials_order_idx
  on guest_testimonials (display_order, created_at desc);

-- ── 2. RLS — guest_testimonials ────────────────────────────────
alter table guest_testimonials enable row level security;

drop policy if exists "guest_testimonials_public_read"  on guest_testimonials;
drop policy if exists "guest_testimonials_auth_insert"  on guest_testimonials;
drop policy if exists "guest_testimonials_auth_update"  on guest_testimonials;
drop policy if exists "guest_testimonials_auth_delete"  on guest_testimonials;

create policy "guest_testimonials_public_read"
on guest_testimonials for select to public
using (is_active = true);

create policy "guest_testimonials_auth_insert"
on guest_testimonials for insert to authenticated
with check (true);

create policy "guest_testimonials_auth_update"
on guest_testimonials for update to authenticated
using (true) with check (true);

create policy "guest_testimonials_auth_delete"
on guest_testimonials for delete to authenticated
using (true);

-- Authenticated editors may also read archived/hidden rows
drop policy if exists "guest_testimonials_auth_read_all" on guest_testimonials;
create policy "guest_testimonials_auth_read_all"
on guest_testimonials for select to authenticated
using (true);

-- ── 3. RLS — owner_testimonials (editor policies) ──────────────
alter table owner_testimonials enable row level security;

drop policy if exists "owner_testimonials_public_read"  on owner_testimonials;
drop policy if exists "owner_testimonials_auth_read_all" on owner_testimonials;
drop policy if exists "owner_testimonials_auth_insert"  on owner_testimonials;
drop policy if exists "owner_testimonials_auth_update"  on owner_testimonials;
drop policy if exists "owner_testimonials_auth_delete"  on owner_testimonials;

create policy "owner_testimonials_public_read"
on owner_testimonials for select to public
using (is_active = true);

create policy "owner_testimonials_auth_read_all"
on owner_testimonials for select to authenticated
using (true);

create policy "owner_testimonials_auth_insert"
on owner_testimonials for insert to authenticated
with check (true);

create policy "owner_testimonials_auth_update"
on owner_testimonials for update to authenticated
using (true) with check (true);

create policy "owner_testimonials_auth_delete"
on owner_testimonials for delete to authenticated
using (true);

-- ── 4. Seed — reseñas actuales del sitio (Airbnb) ──────────────
-- Fuente: src/data/reviews.ts. Se inserta sólo si no existen por
-- (name + published_at) para evitar duplicados en reruns.
insert into guest_testimonials
  (name, country, photo_url, quote, rating, stay_district, published_at, display_order, is_active)
select * from (values
  ('Lian',           '', null,
   'El departamento es excelente, está limpio y muy bien equipado. El propietario se ocupó de cada detalle y estuvo disponible para cualquier pregunta en todo momento. La hospitalidad fue excelente.',
   5::smallint, null, '2026-04-14T00:00:00Z'::timestamptz, 1, true),
  ('Aaron',          '', null,
   'Muy cómodo, todo igual a lo que te dicen. La comunicación excelente, me volvería a quedar ahí las veces que pueda y esté en Lima.',
   5::smallint, null, '2026-04-07T00:00:00Z'::timestamptz, 2, true),
  ('Andrew',         '', null,
   '¡Me encantó estar aquí! Excelente lugar, personal excelente, muy cerca del mar y con muchas tiendas geniales justo al lado.',
   5::smallint, null, '2026-04-07T00:00:00Z'::timestamptz, 3, true),
  ('Erika Wan Jung', '', null,
   'Excelente lugar si visitas Lima. El departamento de Fabrizio es chico pero tiene una vista muy linda y super limpio. El edificio tiene seguridad las 24hs y la zona es super segura. Fabrizio siempre estuvo muy atento a nuestras consultas y nos resolvió super rápido. Lo recomiendo 100%.',
   5::smallint, null, '2025-07-01T00:00:00Z'::timestamptz, 4, true),
  ('Antonio',        '', null,
   'El departamento es tal cual la descripción, acogedor, ordenado y muy bien equipado. La comunicación con el anfitrión es muy fluida y siempre están disponibles para cualquier consulta. La zona es muy tranquila y con muchas opciones para comer algo o también para hacer compras.',
   5::smallint, null, '2026-03-31T00:00:00Z'::timestamptz, 5, true),
  ('Maria Alejandra','', null,
   'Mi estadía en el departamento de Fabrizio fue excelente. Desde el primer momento fue muy atento, amable y siempre estuvo disponible para cualquier consulta. El departamento es tal como se muestra en las fotos: cómodo, limpio, con una vista espectacular al mar y bien ubicado. Se nota el cuidado en cada detalle para que uno se sienta como en casa. ¡Recomiendo totalmente hospedarme con él y sin duda volvería a quedarme allí!',
   5::smallint, null, '2025-10-01T00:00:00Z'::timestamptz, 6, true)
) as v(name, country, photo_url, quote, rating, stay_district, published_at, display_order, is_active)
where not exists (
  select 1 from guest_testimonials g
  where g.name = v.name and g.published_at = v.published_at
);

-- ── 5. Verificación ────────────────────────────────────────────
select 'owner_testimonials' as table, count(*) from owner_testimonials
union all select 'guest_testimonials',   count(*) from guest_testimonials;
