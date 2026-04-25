-- ============================================================
-- Homie CMS — rename Fabrizio + add Antonio Touzett & Javier Flores
-- Safe to run multiple times (idempotent via ON CONFLICT / UPDATE guards).
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Renombrar Fabrizio Noriega → Fabrizio Silva
update blog_authors
set slug = 'fabrizio-silva',
    name = 'Fabrizio Silva'
where slug = 'fabrizio-noriega';

-- Por si ya existe con otro slug pero con el nombre antiguo
update blog_authors
set name = 'Fabrizio Silva'
where name = 'Fabrizio Noriega';

-- 2. Nuevos autores
insert into blog_authors (id, slug, name, bio, avatar_url, role)
values
  (
    'a3d1c6f2-5e74-4f58-9a1d-2b8c1f9e6d10',
    'antonio-touzett',
    'Antonio Touzett',
    'Cofundador de Homie. Especialista en operaciones y experiencia de huéspedes.',
    '/images/brand/homie-logo.png',
    'Cofundador'
  ),
  (
    'c8e7d34a-91fb-4a2e-8c6b-7d04a2e1b3f5',
    'javier-flores-macias',
    'Javier Flores Macías',
    'Tech & producto en Homie. Automatización, pricing dinámico y analítica.',
    '/images/brand/homie-logo.png',
    'Tech & Producto'
  )
on conflict (slug) do update
  set name = excluded.name,
      bio = excluded.bio,
      avatar_url = excluded.avatar_url,
      role = excluded.role;

-- 3. Verificación
select name, slug, role from blog_authors order by name;
