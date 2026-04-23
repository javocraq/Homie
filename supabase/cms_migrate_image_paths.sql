-- ============================================================
-- Homie CMS — Migrar rutas de imágenes /lovable-uploads/... → /images/...
-- Ejecutar UNA VEZ en Supabase SQL Editor después de mover los
-- archivos estáticos a public/images/.
-- Idempotente: safe para reejecutar.
-- ============================================================

-- ── 1. owner_testimonials (UUIDs legados del seed original) ────
UPDATE owner_testimonials SET photo_url = '/images/testimonials/pilar-reyes.png'
WHERE photo_url = '/lovable-uploads/09abe06c-fbe4-4e1b-b6c7-785074339a89.png'
   OR (name = 'Pilar Reyes' AND photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET photo_url = '/images/testimonials/carlos-montalva.png'
WHERE photo_url = '/lovable-uploads/19e931c5-eb99-427e-b087-0cc5cd335abe.png'
   OR (name = 'Carlos Montalva' AND photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET photo_url = '/images/testimonials/david-bruley.png'
WHERE photo_url = '/lovable-uploads/1ebbbff7-47d3-4143-9ef6-82b88329c0c7.png'
   OR (name = 'David Bruley' AND photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET photo_url = '/images/testimonials/elvira-y-rolando.png'
WHERE photo_url = '/lovable-uploads/fbe2a393-c401-4e82-aaee-fd8709ef4014.png'
   OR (name = 'Elvira y Rolando' AND photo_url LIKE '/lovable-uploads/%');

-- ── 1b. owner_testimonials nuevos (sin foto o con NULL) ───────
-- Rellena photo_url/photo_alt de los 5 propietarios agregados
-- por cms_owner_testimonials_add.sql si quedaron sin foto.
UPDATE owner_testimonials SET
  photo_url = '/images/testimonials/juan-garcia.jpeg',
  photo_alt = 'Juan Garcia, propietario'
WHERE name = 'Juan Garcia' AND (photo_url IS NULL OR photo_url = '' OR photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET
  photo_url = '/images/testimonials/cristian-contreras.jpeg',
  photo_alt = 'Cristian Contreras, propietario'
WHERE name = 'Cristian Contreras' AND (photo_url IS NULL OR photo_url = '' OR photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET
  photo_url = '/images/testimonials/bryan-navarro.jpeg',
  photo_alt = 'Bryan Navarro, propietario'
WHERE name = 'Bryan Navarro' AND (photo_url IS NULL OR photo_url = '' OR photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET
  photo_url = '/images/testimonials/martin-savedra.jpeg',
  photo_alt = 'Martin Savedra, propietario'
WHERE name = 'Martin Savedra' AND (photo_url IS NULL OR photo_url = '' OR photo_url LIKE '/lovable-uploads/%');

UPDATE owner_testimonials SET
  photo_url = '/images/testimonials/roy-del-aguila.jpeg',
  photo_alt = 'Roy Del Águila, propietario'
WHERE name = 'Roy Del Águila' AND (photo_url IS NULL OR photo_url = '' OR photo_url LIKE '/lovable-uploads/%');

-- ── 2. blog_authors — avatar del logo Homie ────────────────────
UPDATE blog_authors
   SET avatar_url = '/images/brand/homie-logo.png'
WHERE avatar_url = '/lovable-uploads/0e97e210-63de-4b39-8d4c-a0a7b6b6e724.png';

-- ── 3. blog_posts — cover_image_url que apunten al logo legacy ─
-- (Solo por seguridad; los covers reales están en Supabase Storage.)
UPDATE blog_posts
   SET cover_image_url = '/images/brand/homie-logo.png'
WHERE cover_image_url = '/lovable-uploads/0e97e210-63de-4b39-8d4c-a0a7b6b6e724.png';

-- ── 4. Verificación ────────────────────────────────────────────
SELECT 'owner_testimonials legacy'  AS bucket, count(*) FROM owner_testimonials WHERE photo_url  LIKE '/lovable-uploads/%'
UNION ALL
SELECT 'blog_authors legacy',               count(*) FROM blog_authors        WHERE avatar_url LIKE '/lovable-uploads/%'
UNION ALL
SELECT 'blog_posts legacy',                 count(*) FROM blog_posts          WHERE cover_image_url LIKE '/lovable-uploads/%'
UNION ALL
SELECT 'owner_testimonials sin foto',       count(*) FROM owner_testimonials  WHERE photo_url IS NULL OR photo_url = '';
-- Las cuatro filas deberían dar 0.

-- Listado final con nombre + foto:
SELECT display_order, name, photo_url FROM owner_testimonials ORDER BY display_order ASC;
