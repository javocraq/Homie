# SEO ACTION PLAN — homiebnb.com

**Baseline:** ≈ 37.5/100 (Poor)
**Objetivo:** ≥ 73/100 (Good)

---

## 🔴 P0 — Aplicados en este PR

| # | Acción | Archivo | Estado |
|---|---|---|---|
| 1 | Reescribir `robots.txt` con `Sitemap:`, AI crawlers, rutas sensibles | `public/robots.txt` | ✅ |
| 2 | Crear `sitemap.xml` con homepage + anchors significativos | `public/sitemap.xml` | ✅ |
| 3 | Crear `llms.txt` para AI search readiness | `public/llms.txt` | ✅ |
| 4 | `lang="es-PE"`, canonical, acortar meta description, limpiar keywords | `index.html` | ✅ |
| 5 | JSON-LD: Organization + LocalBusiness + WebSite(SearchAction) | `index.html` | ✅ |
| 6 | `theme-color`, `og:locale`, `og:site_name` | `index.html` | ✅ |
| 7 | Navbar: `<a href="#...">` con onClick preventDefault + scroll suave | `src/components/Navbar.tsx` | ✅ |
| 8 | Footer: logo con `alt` descriptivo | `src/components/Footer.tsx` | ✅ |

---

## ⚠️ P1 — Ejecutados en esta iteración

| # | Acción | Archivos | Estado |
|---|---|---|---|
| 9 | `gptengineer.js` condicional a `import.meta.env.DEV` (Vite lo elimina en prod) | `index.html` | ✅ |
| 10 | Consolidar 4 gtag + 1 GTM en un único GTM | — | 🟡 **MANUAL** (requiere Google Tag Manager UI) |
| 11 | `react-helmet-async` + componente `<Seo>` + `noindex` en `/gracias` y `/*` | `src/main.tsx`, `src/components/Seo.tsx`, `src/pages/GraciasPage.tsx`, `src/pages/NotFound.tsx` | ✅ |
| 12 | Añadir `width`/`height`, `fetchPriority`, `decoding` y alt rico al Hero | `src/components/Hero.tsx` | ✅ (imagen sigue siendo Unsplash — reemplazar por foto propia es P1.12b manual) |

---

## 🗺️ P2 — Ejecutados en esta iteración

| Área | Estado | Archivos |
|---|---|---|
| **Rutas reales por distrito** (4): Miraflores, Barranco, San Isidro, Magdalena del Mar. Contenido único por distrito (>400 palabras cada uno), schema `Service` con `areaServed` por ciudad, breadcrumbs, CTA al formulario. | ✅ | `src/pages/DistritoPage.tsx`, `src/pages/distritos/*.tsx`, `src/data/distritos.ts` |
| **Blog** (`/blog`) con index + detalle dinámico `/blog/:slug`, schema `Blog` + `BlogPosting`, 1 post real (~800 palabras: *"¿Cuánto gana un Airbnb en Lima?"*). Renderer MD mínimo in-house (no librería extra). | ✅ | `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/data/posts.ts` |
| **Páginas legales/trust**: `/sobre-nosotros` (schema `AboutPage`), `/privacidad` (Ley 29733), `/terminos` | ✅ | `src/pages/SobreNosotros.tsx`, `src/pages/Privacidad.tsx`, `src/pages/Terminos.tsx` |
| **Breadcrumbs reutilizables** con `BreadcrumbList` JSON-LD | ✅ | `src/components/Breadcrumbs.tsx` |
| **`<Seo>`** componente con title/description/canonical/noindex/OG/Twitter/JSON-LD por ruta | ✅ | `src/components/Seo.tsx` |
| **Shell común** (Navbar + main + Footer) para subpáginas | ✅ | `src/components/PageShell.tsx` |
| **Footer** rediseñado con columnas Explora / Distritos / Legal — internal linking masivo | ✅ | `src/components/Footer.tsx` |
| **Sitemap.xml** actualizado con las 10 URLs indexables y `priority`/`changefreq` realistas | ✅ | `public/sitemap.xml` |
| **App routes** con todas las rutas declaradas antes del catch-all | ✅ | `src/App.tsx` |

### Verificación
- `npx tsc --noEmit` → ✅ sin errores
- `npm run build` → ✅ 1710 módulos, 420 KB JS, 67 KB CSS, 5.8 s

---

## 🔴 P2 — Pendiente (requiere intervención manual o dato real)

### a) Prerender / SSG — **NO ejecutado**
**Por qué:** Es un cambio de arquitectura real. Los caminos son:

1. **react-snap / `vite-plugin-prerender-simple`**: ejecuta Puppeteer tras `vite build` y guarda HTML estático por ruta. Drop-in, pero implica: instalar Puppeteer (~150 MB en CI), gestionar hidratación, y validar cada ruta. ~2–4 h de trabajo + QA.
2. **Migrar a `vite-react-ssg`**: requiere reestructurar `main.tsx` en `entry-client.tsx` + `entry-server.tsx`. ~1 día.
3. **Migrar a Astro o Next.js**: reescritura parcial. 3–5 días.

**Recomendación:** opción 1 (react-snap / prerender plugin) como siguiente paso — conservador, sin reescritura, y resuelve el problema crítico de que `GPTBot`/`ClaudeBot`/`PerplexityBot` hoy ven `<div id="root"></div>`. Déjame saber si quieres que lo cablee.

### b) Consolidar GTM — **MANUAL**
Los 4 `gtag.js` actuales (`AW-17204436863`, `G-YRFEXYB52B`, `G-V0ZDRJVDNL`, `G-J5YMJXSCMB`) deberían vivir dentro de GTM (`GTM-5KXGNVML`). Esto se hace en la UI de Google Tag Manager — no es tocable desde código. Una vez estén en GTM, quitamos los 4 scripts sueltos de `index.html`.

### c) Reemplazar hero Unsplash por foto propia — **MANUAL**
La imagen `https://images.unsplash.com/photo-1586023492125-27b2c045efd7` es de un tercero sin control. Ideal: producir foto propia → convertirla a `.webp` + `.avif` → colocarla en `/public/hero.webp`. Yo puedo cambiar el `src` pero necesitas la foto.

### d) Reviews schema con datos reales — **MANUAL**
El skill del auditor explícitamente alerta que schema `Review`/`AggregateRating` con datos inventados es penalizable. Necesita reviews reales de clientes (con nombre y consentimiento) para añadir a `Testimonials.tsx` + su schema.

### e) Contenido de blog adicional — **SEMI-MANUAL**
Hay 1 artículo sembrado. Para llegar a 10–15 artículos keyword-driven que muevan score, lo ideal es:
1. Tú me das 10 temas / queries objetivo.
2. Yo escribo los drafts y los publico en `src/data/posts.ts`.

### f) Dirección física y `LocalBusiness` exacto — **MANUAL**
El JSON-LD de `LocalBusiness` tiene `addressLocality: "Lima"` genérico. Si Homie tiene oficina física con dirección, me la pasas y la pongo en el schema — mejora rankeo local.

---

## Post-implementación — Score estimado

| Categoría | Antes | Después P0 | Después P0+P1+P2 |
|---|---|---|---|
| Technical SEO (25%) | 30 | 80 | 90 |
| Content (20%) | 55 | 55 | 80 |
| On-Page (15%) | 45 | 75 | 85 |
| Schema (15%) | 25 | 85 | 90 |
| Performance (10%) | 40 | 45 | 75 |
| Images (10%) | 35 | 40 | 80 |
| GEO (5%) | 20 | 70 | 85 |
| **Total** | **37.5** | **≈ 66 (Needs Improvement, alto)** | **≈ 85 (Good/Excellent)** |

---

## Verificación post-deploy

1. `curl https://homiebnb.com/robots.txt` → debe listar `Sitemap: https://homiebnb.com/sitemap.xml`
2. `curl https://homiebnb.com/sitemap.xml` → XML válido
3. Google Search Console → *Submit sitemap*
4. Rich Results Test: https://search.google.com/test/rich-results?url=https://homiebnb.com
5. PageSpeed Insights: https://pagespeed.web.dev/analysis?url=https://homiebnb.com
6. Schema validator: https://validator.schema.org/
7. Indexar `llms.txt`: https://homiebnb.com/llms.txt responde 200
