# FULL SEO AUDIT REPORT — homiebnb.com

**Fecha:** 2026-04-21
**Tipo:** Single-page full audit (LLM-first, evidencia sobre código fuente)
**Alcance:** https://homiebnb.com (landing única + `/gracias` + `*` NotFound)
**Stack detectado:** Vite + React SPA + react-router, Google Tag Manager + múltiples gtag.

> **Environment limitations:** Los scripts de verificación de red del skill fallaron por DNS bloqueado en el sandbox (`homiebnb.com` no resoluble). El análisis se realizó LLM-first sobre el código fuente en `index.html`, `public/robots.txt` y `src/**` — que es la fuente de la que se despliega el sitio, por lo que los hallazgos son de confianza **Confirmada** en cuanto al código embarcado, y **Probable** (Likely) para métricas runtime (Core Web Vitals, índice real de Google, backlinks).

---

## Score Global

| Categoría | Peso | Score actual | Weighted |
|---|---|---|---|
| Technical SEO | 25% | 30 | 7.5 |
| Content Quality | 20% | 55 | 11.0 |
| On-Page SEO | 15% | 45 | 6.75 |
| Schema / Structured Data | 15% | 25 | 3.75 |
| Performance (CWV, hypothesis) | 10% | 40 | 4.0 |
| Image Optimization | 10% | 35 | 3.5 |
| AI Search Readiness (GEO) | 5% | 20 | 1.0 |
| **Total** | — | — | **≈ 37.5 / 100** (Poor) |

El "6/100" reportado por la herramienta externa del usuario probablemente usa otra escala (o solo auditó robots + schema + sitemap, que efectivamente están casi vacíos). En escala 1–100 estándar, **el sitio está en banda "Poor" (30–49)**. Objetivo tras Action Plan: **≥ 73 (Good)**.

---

## Hallazgos por categoría

### 1. Technical SEO — 🔴 Crítico

| # | Finding | Evidence | Impact | Severity |
|---|---|---|---|---|
| T1 | `robots.txt` no referencia un `Sitemap:` | `public/robots.txt` líneas 1-14 — solo User-agent rules, sin `Sitemap:` | Google/Bing pierden la ruta canónica para descubrir URLs | 🔴 |
| T2 | **No existe `sitemap.xml`** | `ls public/` no devuelve ningún sitemap | Impide crawling eficiente y priorización por `lastmod`/`priority` | 🔴 |
| T3 | Falta **gestión de AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bytespider) | `robots.txt` no los menciona | El sitio no tiene política declarada → algunos bots asumen `disallow` por defecto, otros rastrean sin control | ⚠️ |
| T4 | **No hay `canonical`** | `index.html` head no tiene `<link rel="canonical">` | Riesgo de contenido duplicado al indexar `homiebnb.com`, `www.homiebnb.com`, params UTM | 🔴 |
| T5 | **SPA sin rutas reales** | `App.tsx` solo `/` y `/gracias`. Todas las secciones son anchors (`#ventajas`, `#proceso`, `#faq`) | Google indexa una sola URL; pierdes oportunidad de rankear por "administración Airbnb Miraflores", "Barranco", "proceso Airbnb", etc. | ⚠️ |
| T6 | `lang="es"` en lugar de `lang="es-PE"` | `index.html:3` | Pérdida de señal geográfica para SERP en Perú | ⚠️ |
| T7 | No hay `<meta name="robots">` explícito | index.html | Funciona (default `index,follow`) pero `/gracias` DEBE ser `noindex` y no lo es | 🔴 |
| T8 | **No hay `llms.txt`** | `ls public/` | Nulo AI Search Readiness (ChatGPT Search, Perplexity, Claude) | ⚠️ |

### 2. On-Page SEO — ⚠️ Warning

| # | Finding | Evidence | Impact | Severity |
|---|---|---|---|---|
| O1 | `meta description` mide **236 caracteres** (límite ~155–160) | `index.html:8` | Google trunca la description en SERP; mensaje de valor cortado | 🔴 |
| O2 | `meta keywords` con **keyword stuffing** | `index.html:10` — 36 frases, mezcla ES/EN | Señal de spam, cero valor SEO (Google ignora keywords desde 2009) | ⚠️ |
| O3 | Logo del navbar usa `<a href="#">` | `Navbar.tsx:38` | Recarga la página al click; mal UX; link roto para crawlers | ⚠️ |
| O4 | Navegación interna usa `<button onClick=scrollToSection>` en vez de `<a href="#ventajas">` | `Navbar.tsx:45-59` | Crawlers no siguen JS-only nav → los anchors no se indexan como puntos de entrada | ⚠️ |
| O5 | H1 único ✅ | `Hero.tsx:26` | Correcto | ✅ |
| O6 | Jerarquía H1 → H2 → H3 correcta | Index.tsx structure | Correcto | ✅ |
| O7 | Title 48 chars ✅ | `index.html:7` | Dentro del límite óptimo 50-60 | ✅ |

### 3. Schema / Structured Data — 🔴 Crítico

| # | Finding | Evidence | Impact | Severity |
|---|---|---|---|---|
| S1 | Solo existe un bloque `Service` mínimo | `index.html:83-98` | Pierdes rich results potenciales | 🔴 |
| S2 | Falta **Organization** con `logo`, `sameAs` (Instagram, TikTok, WhatsApp), `contactPoint` | No existe | Knowledge Panel de marca imposible | 🔴 |
| S3 | Falta **LocalBusiness** con `address`, `areaServed`, `telephone`, `priceRange` | No existe | Pierdes local pack en Lima | 🔴 |
| S4 | Falta **WebSite** con `SearchAction` | No existe | Sin sitelinks searchbox | ⚠️ |
| S5 | `FAQPage` **NO debe añadirse** — restringido a gov/health desde ago-2023 | — | No recomendar | ℹ️ |
| S6 | Falta **BreadcrumbList** (aunque sea trivial por ser landing) | — | Baja prioridad | ℹ️ |

### 4. Performance — ⚠️ Hypothesis

| # | Finding | Evidence | Impact | Severity |
|---|---|---|---|---|
| P1 | **4 `gtag.js` + 1 GTM** cargando en `<head>` | `index.html:35-81` (AW-17204436863, G-YRFEXYB52B, G-V0ZDRJVDNL, G-J5YMJXSCMB + GTM-5KXGNVML) | Cada uno es un request + ejecución JS; daña LCP/INP en móvil | ⚠️ |
| P2 | Imagen Hero externa `images.unsplash.com` sin `width`/`height` | `Hero.tsx:14-18` | CLS alto + dependencia de CDN tercero | ⚠️ |
| P3 | `gptengineer.js` (Lovable) en prod | `index.html:101` | 0-value en prod, solo dev | ⚠️ |
| P4 | No hay `<link rel="preload">` para imagen hero ni fuentes críticas | index.html | LCP peor del posible | ⚠️ |

### 5. Image Optimization — ⚠️ Warning

| # | Finding | Evidence | Severity |
|---|---|---|---|
| I1 | Hero no tiene `width`/`height` atributos | `Hero.tsx:13-18` | ⚠️ |
| I2 | `alt="Apartamento Premium Estilo Industrial"` — genérico, no vinculado a la marca | `Hero.tsx:15` | ⚠️ |
| I3 | Logo en footer tiene `alt="Homie Logo"` — muy genérico | `Footer.tsx:11` | ℹ️ |
| I4 | Imágenes `.png` no servidas como `.webp`/`.avif` | `public/images/**/*.png` | ⚠️ |

### 6. AI Search Readiness (GEO) — 🔴

| # | Finding | Severity |
|---|---|---|
| G1 | No existe `llms.txt` | ⚠️ |
| G2 | No hay política explícita para GPTBot/ClaudeBot/Perplexity en robots.txt | ⚠️ |
| G3 | Faltan bloques de `Q&A` semánticos — las FAQ están en componente React pero no en HTML estático (SPA) → los crawlers AI ven página vacía | 🔴 |

### 7. Content & E-E-A-T — ⚠️

- Copy claro, propuesta de valor fuerte (+30% ingresos, ≥90% ocupación).
- **Falta página "Sobre nosotros" / equipo** (E-E-A-T: Experience, Expertise).
- **Falta blog** → ninguna oportunidad de capturar queries informacionales ("cómo administrar un Airbnb en Lima", "rentabilidad Airbnb Miraflores").
- **Falta Testimonials con Review schema** estructurado.
- Sin página de privacidad/términos → señal negativa de trust.

---

## Resumen de prioridades

**Impacto alto × Esfuerzo bajo (hacer YA):**
1. Reescribir `robots.txt` con política AI crawlers + `Sitemap:`
2. Crear `sitemap.xml`
3. Crear `llms.txt`
4. Canonical + `lang="es-PE"` + acortar meta description + quitar keywords stuffing
5. Añadir JSON-LD `Organization` + `LocalBusiness` + `WebSite` (SearchAction)

**Impacto alto × Esfuerzo medio:**
6. Navbar: convertir botones a `<a href="#...">` con `onClick` para preservar scroll suave
7. Eliminar `gptengineer.js` de producción (mantener solo en dev)
8. Consolidar gtag vía GTM (mover los 3 GA + 1 Ads a tags dentro de GTM)
9. Añadir `width/height` a hero + servir en `.webp`

**Impacto medio × Esfuerzo alto (roadmap):**
10. SSR/prerender (Vite SSG, astro, o next.js migration) para que el HTML estático contenga FAQ/testimonios — crítico para AI search
11. Rutas reales por distrito: `/administracion-airbnb-miraflores`, `/barranco`, `/san-isidro`
12. Blog en `/blog` con 10-20 artículos keyword-driven
13. Páginas `/sobre-nosotros`, `/privacidad`, `/terminos`
