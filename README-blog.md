# Blog + Supabase — guía operativa

Este documento cubre:

1. Arquitectura: cómo se conectan blog y testimonios al backend.
2. Cómo **crear un nuevo post** desde Supabase Studio.
3. Cómo añadir un autor, categoría o testimonio.
4. Campos derivados (tiempo de lectura) y convenciones.
5. Fallback de mock data cuando `.env` no está seteado.
6. Sitemap dinámico.
7. Propuesta (no implementada) de prerender para crawlers de IA.

---

## 1. Arquitectura

```
src/
├── lib/
│   ├── supabase.ts              ← cliente (anon key) o null si faltan env vars
│   ├── mocks/
│   │   ├── blog.ts              ← mock data para dev sin Supabase
│   │   └── testimonials.ts
│   └── queries/
│       ├── blog.ts              ← getPublishedPosts / getPostBySlug / getRelatedPosts / getAllCategories / getAllSlugs
│       └── testimonials.ts      ← getActiveOwnerTestimonials / getActiveGuestTestimonials
├── types/blog.ts                ← tipos TS espejo del schema
├── components/blog/             ← PostCard, PostCardSkeleton, CategoryFilter
├── pages/Blog.tsx               ← listado con filtro + load-more (useInfiniteQuery)
└── pages/BlogPost.tsx           ← detalle con markdown + author bio + related + CTA
```

Las queries son agnósticas: si `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no están en `.env`, devuelven los mocks. Si están, van a Supabase.

`src/data/posts.ts` fue eliminado (quedó obsoleto tras la migración).

`src/data/ownerTestimonials.ts` **se conserva** porque `GuestReviews.tsx` aún lo usa para calcular el `AggregateRating` del LocalBusiness (esa migración se hará en un pase posterior).

---

## 2. Crear un post nuevo (Supabase Studio)

Requiere tener las tablas `blog_categories`, `blog_authors`, `blog_posts` ya creadas (ver Parte 3.2 del brief).

Flujo manual recomendado:

1. **Asegúrate que el autor exista.** Tabla `blog_authors`. Si no, crea uno (sección 3 más abajo).
2. **Asegúrate que la categoría exista.** Tabla `blog_categories`. Si no, crea una.
3. Entra a **Table Editor → `blog_posts` → Insert row** y completa:
   - `slug` — kebab-case, único, sin acentos ni espacios (ej. `como-subir-tarifa-airbnb-lima`).
   - `title` — título editorial.
   - `excerpt` — 1–2 oraciones (máx. ~200 caracteres), se usa en tarjetas y meta description por defecto.
   - `content` — Markdown. Soporta GFM: tablas, listas, `**bold**`, `##` headings, `> blockquotes`, código inline/bloques. Ver sección 4 para ejemplos.
   - `cover_image_url` — URL pública (Unsplash, Storage de Supabase o `/images/...`).
   - `cover_image_alt` — texto descriptivo para accesibilidad y SEO.
   - `author_id` — FK a `blog_authors.id`.
   - `category_id` — FK a `blog_categories.id`.
   - `tags` — array de strings. Ej: `{"pricing","ingresos","estrategia"}`.
   - `reading_time_minutes` — entero. Ver sección 4.
   - `status` — `draft` mientras editas, `published` cuando está listo. Solo los `published` aparecen en el sitio.
   - `published_at` — timestamp ISO. Usa la fecha real de publicación (no de creación).
   - `meta_title` / `meta_description` — opcionales; si están vacíos, se usan `title` y `excerpt`.
   - `og_image_url` — opcional; si está vacío se usa `cover_image_url` para Open Graph.
4. **Guarda.** El post aparece en `/blog` inmediatamente (React Query refresca al montar). Los crawlers necesitan que corras `npm run build` para que `sitemap.xml` se regenere con el nuevo slug.

### Consejos de contenido

- Títulos entre 45 y 65 caracteres rankean mejor.
- El `excerpt` debe tener un gancho claro: no duplicar el título, dar una promesa concreta.
- Usa `##` para secciones principales y `###` para sub-secciones. Evita `#` (el H1 lo pone la página automáticamente).
- Mete al menos una **tabla**, una **lista numerada** y una **cita** por post — estructura rica sube el dwell time.

---

## 3. Añadir autor / categoría / testimonio

### Autor (`blog_authors`)

| Campo | Ejemplo |
|---|---|
| `name` | `Fabrizio Noriega` |
| `slug` | `fabrizio-noriega` |
| `bio` | Dos oraciones sobre experiencia relevante. |
| `avatar_url` | URL pública (cuadrada, mínimo 400×400 px). |
| `role` | `Cofundador`, `Asesora de pricing`, etc. |

### Categoría (`blog_categories`)

| Campo | Ejemplo |
|---|---|
| `slug` | `rentabilidad` (kebab-case, único) |
| `name` | `Rentabilidad` |
| `description` | Opcional; una oración descriptiva. |

Al crear una categoría nueva, aparece automáticamente como pill en el filtro del listado.

### Testimonio de propietario (`owner_testimonials`)

| Campo | Notas |
|---|---|
| `name` | `Pilar Reyes` |
| `location` | `Miraflores, Lima` (texto libre, aparece bajo el nombre). |
| `photo_url` | Cuadrada, mínimo 200×200 px. |
| `photo_alt` | Obligatorio para accesibilidad. |
| `quote` | 1–3 oraciones. Palabras propias del propietario (no parafraseo). |
| `rating` | 1–5, entero. |
| `occupation_rate` | Entero 0–100, opcional. |
| `display_order` | Entero, ascendente. Controla el orden del carrusel. |
| `is_active` | `true` para mostrarlo. `false` lo oculta sin borrar. |

Si no hay testimonios con `is_active = true`, la sección completa del carrusel se oculta.

### Testimonio de huésped (`guest_testimonials`)

Estructura lista en Supabase pero aún no consumida por el frontend (pendiente — la sección `GuestReviews.tsx` sigue leyendo desde `src/data/reviews.ts`). Cuando se migre, bastará cambiar la fuente de datos al helper `getActiveGuestTestimonials()` que ya existe en `src/lib/queries/testimonials.ts`.

---

## 4. Campos derivados y convenciones

### `reading_time_minutes`

Calcula con la fórmula estándar: **palabras / 225 → redondear hacia arriba, mínimo 2**.

Snippet rápido en consola del navegador sobre el texto Markdown:

```js
Math.max(2, Math.ceil(content.trim().split(/\s+/).length / 225))
```

Lo insertas manualmente en el campo. No lo calculamos en runtime para evitar recomputar en cada render.

### `slug`

- Kebab-case, solo ASCII (sin acentos), sin números al inicio.
- Único por tabla (`blog_posts.slug` tiene índice único).
- Una vez publicado, **no lo cambies** — rompe enlaces y SEO. Si necesitas corregirlo, añade un redirect en `vercel.json`/`_redirects`.

### `published_at`

Fecha editorial, no técnica. El orden del listado es `published_at DESC`. Si antedatas un post, queda al final.

### `status`

- `draft` — no aparece en el sitio, no aparece en el sitemap.
- `published` — aparece.
- `archived` — no aparece, pero el slug se conserva para no romper enlaces externos si cambias de opinión.

---

## 5. Fallback a mock data

Si ejecutas el proyecto sin `.env`, las queries retornan fixtures de `src/lib/mocks/*.ts`:

- **Blog:** 9 posts con distintas categorías y autores.
- **Testimonios de propietarios:** los 4 existentes.
- **Testimonios de huéspedes:** vacío (la tabla está pensada para poblarse más tarde).

En dev verás en consola:

```
[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — falling back to mock data.
```

Para conectarte a Supabase en local:

```bash
cp .env.example .env
# edita .env con las credenciales reales del proyecto
npm run dev
```

---

## 6. Sitemap dinámico

`scripts/generate-sitemap.mjs` corre como `prebuild`:

- Emite los URLs estáticos (home, distritos, legal, `/blog`).
- Hace un `SELECT slug, updated_at FROM blog_posts WHERE status = 'published'` y añade un `<url>` por post.
- Si las env vars no están, loguea un warning y emite solo los estáticos — nunca falla el build.

Para regenerar manualmente:

```bash
npm run sitemap
```

El resultado queda en `public/sitemap.xml`.

**Nota:** el sitemap es una *snapshot* al momento del build. Si publicas un post nuevo desde Supabase Studio, redeploya para que aparezca (o ejecuta `npm run sitemap` en tu host).

---

## 7. Prerender para crawlers de IA — propuesta (no implementada)

### El problema

GPTBot, ClaudeBot, PerplexityBot y Bytespider **no ejecutan JavaScript**. Al visitar `/blog/cuanto-gana-un-airbnb-en-lima` reciben el `<div id="root"></div>` vacío — cero contenido indexable para AI search. Googlebot/Bingbot sí renderizan JS, así que la SEO clásica funciona; el problema es específico de AI.

### Opciones evaluadas

| Opción | Esfuerzo | Trade-offs |
|---|---|---|
| `vite-plugin-prerender-simple` | 2–4 h | Usa Puppeteer headless post-`vite build`. Drop-in. **Requiere lista explícita de rutas** → integrar con `getAllSlugs()`. |
| `react-snap` | 2–4 h | Crawlea el build de producción y descubre rutas vía links. Menos control, más mágico. Ocasionales issues con async data. |
| `vite-react-ssg` | ~1 día | Full SSG: reestructura `main.tsx` en `entry-client.tsx` + `entry-server.tsx`. Mejor producto final, más esfuerzo. |

### Plan recomendado (cuando se implemente)

**Stack:** `vite-plugin-prerender-simple` + script que exporte los slugs de Supabase a la lista de rutas.

**Secuencia:**

1. `npm i -D vite-plugin-prerender-simple puppeteer`
2. En `scripts/export-routes.mjs`: ejecutar `getAllSlugs()` → escribir `dist-prerender/routes.json` con `["/", "/blog", "/blog/slug-1", ...]` + todas las estáticas.
3. En `vite.config.ts`: plugin leyendo `routes.json`, esperando a que `useQuery` resuelva (`wait: 2500ms` o `readyEvent` custom).
4. En `scripts/generate-sitemap.mjs`: mismo SELECT ya expuesto → reutilizable.
5. En `package.json`:
   ```json
   "build": "node scripts/export-routes.mjs && vite build"
   ```
6. Validar con `curl https://homiebnb.com/blog/test-post` post-deploy — debe devolver HTML con el título, el contenido y el JSON-LD completos, no un shell vacío.

**Trampas conocidas:**

- Imágenes de Unsplash como `cover_image_url` pueden bloquear Puppeteer si tardan — configurar timeouts generosos o precargar con timeout.
- Meta tags dinámicos de `react-helmet-async` se escriben después del primer render. El plugin debe esperar la ventana de hidratación inicial (`wait: 1500–2500ms` suele alcanzar).
- Rutas con `?query=...` (filtro de blog) no deben prerenderearse — solo rutas canónicas.

**Señal de éxito:** `view-source:` en Firefox muestra el cuerpo del post renderizado antes de cualquier JS, y `curl -A "GPTBot"` devuelve el mismo HTML.

---

## TL;DR para el editor

1. Entra a Supabase Studio → `blog_posts` → Insert row.
2. Completa los campos (slug único, `status = published`).
3. Redeploya en Vercel/Netlify para que el sitemap se regenere.
4. El post aparece en `/blog` y en `/blog/<slug>`.

Para migrar testimonios o cambiar contenido editorial: mismo flujo en las tablas correspondientes. No toques código.
