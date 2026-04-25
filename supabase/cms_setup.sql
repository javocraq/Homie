-- ============================================================================
-- Homie CMS — políticas RLS para escritura autenticada
-- Ejecutar en Supabase Studio → SQL Editor.
--
-- IMPORTANTE: el usuario admin NO se crea aquí.
-- Créalo en Supabase Dashboard → Authentication → Users → "Add user" → "Create new user":
--    Email:    contacto@homiebnb.com
--    Password: (la que quieras, ej. Homie2026!CMS)
--    ✅ Auto Confirm User (OBLIGATORIO, si no, no podrá iniciar sesión)
-- ============================================================================

ALTER TABLE public.blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- blog_posts ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "blog_posts admin select"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts admin insert"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts admin update"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts admin delete"  ON public.blog_posts;

CREATE POLICY "blog_posts admin select"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_posts admin insert"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "blog_posts admin update"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "blog_posts admin delete"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- blog_authors ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "blog_authors admin select" ON public.blog_authors;
DROP POLICY IF EXISTS "blog_authors admin write"  ON public.blog_authors;

CREATE POLICY "blog_authors admin select"
  ON public.blog_authors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_authors admin write"
  ON public.blog_authors FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- blog_categories ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "blog_categories admin select" ON public.blog_categories;
DROP POLICY IF EXISTS "blog_categories admin write"  ON public.blog_categories;

CREATE POLICY "blog_categories admin select"
  ON public.blog_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_categories admin write"
  ON public.blog_categories FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- Verificar
SELECT
  (SELECT count(*) FROM public.blog_posts)      AS posts,
  (SELECT count(*) FROM public.blog_authors)    AS autores,
  (SELECT count(*) FROM public.blog_categories) AS categorias;
