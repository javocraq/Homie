-- ============================================================================
-- Homie — seed data for blog + owner testimonials
-- Safe to run multiple times (idempotent via ON CONFLICT).
-- Paste into Supabase Studio → SQL Editor → Run.
-- ============================================================================

-- ─── Authors (cofundadores + equipo) ───────────────────────────────────────
-- (Equipo Homie already exists with id e1c71d85-02c5-4b72-bdea-128f1cdb6117)

INSERT INTO blog_authors (id, slug, name, bio, avatar_url, role)
VALUES
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'fabrizio-silva',
    'Fabrizio Silva',
    'Cofundador de Homie. Más de 7 años operando alquileres temporales en Lima Top.',
    '/images/brand/homie-logo.png',
    'Cofundador'
  ),
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
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      bio = EXCLUDED.bio,
      avatar_url = EXCLUDED.avatar_url,
      role = EXCLUDED.role;

-- ─── Rename legacy "fabrizio-noriega" slug if exists ──────────────────────
UPDATE blog_authors
SET slug = 'fabrizio-silva',
    name = 'Fabrizio Silva'
WHERE slug = 'fabrizio-noriega';

-- ─── Avatar for Equipo Homie (existing author) ─────────────────────────────

UPDATE blog_authors
SET avatar_url = '/images/brand/homie-logo.png'
WHERE slug = 'equipo-homie' AND avatar_url IS NULL;

-- ─── Blog posts (9) ─────────────────────────────────────────────────────────
-- author_id:   Fabrizio     = b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e
--              Equipo Homie = e1c71d85-02c5-4b72-bdea-128f1cdb6117
-- category_id: propietarios     = 6e84f0b6-558c-4d9d-97e0-f955907890c5
--              gestion-airbnb   = 5a8d4c8a-4694-4ac3-9045-c2c4929ec24f
--              lima-y-distritos = c1e13ee8-ddcc-4284-96f0-dd309155b45d

INSERT INTO blog_posts (
  slug, title, excerpt, content, cover_image_url, cover_image_alt,
  author_id, category_id, tags, reading_time_minutes, status, published_at
) VALUES
-- p1
(
  'cuanto-gana-un-airbnb-en-lima',
  '¿Cuánto gana realmente un Airbnb en Lima en 2026?',
  'Análisis con datos reales de ocupación, tarifa promedio y comisiones en Miraflores, Barranco y San Isidro. Números que un propietario puede esperar hoy.',
  $md$La pregunta que todo propietario hace en la primera llamada con Homie es la misma: **¿cuánto voy a ganar?** La respuesta honesta depende de tres variables — ubicación, tamaño y estado de la propiedad — pero los rangos son sorprendentemente consistentes entre distritos de Lima Top.

## El rango real por distrito

| Distrito | Tarifa promedio / noche | Ocupación típica | Ingreso bruto mensual |
|---|---|---|---|
| Miraflores | USD 85–120 | 85–92% | USD 2,200–3,000 |
| Barranco | USD 75–110 | 80–88% | USD 1,900–2,700 |
| San Isidro | USD 90–130 | 78–85% | USD 2,100–2,900 |
| Magdalena del Mar | USD 55–80 | 72–82% | USD 1,300–1,800 |

> Estos números asumen un departamento de 60–80 m², 2 dormitorios, amoblado a nivel medio-alto y con fotografía profesional.

## Qué se descuenta del bruto

Del ingreso bruto hay que restar:

1. **Comisión de Airbnb/Booking** — ~15% promedio combinado.
2. **Limpieza entre huéspedes** — se cobra al huésped, no impacta al propietario.
3. **Servicios (luz, agua, internet, cable)** — S/. 350–500 mensuales típicamente.
4. **Suministros** (papel, jabones, café, amenities) — S/. 120–180.
5. **Comisión de administración** de la operadora — varía.

## El número al bolsillo

Una vez descontados todos los gastos, un departamento bien ubicado de 2 dormitorios en Miraflores suele dejarle al propietario **entre USD 1,400 y USD 1,900 netos mensuales** — un 30–45% más que un alquiler tradicional a largo plazo en la misma zona.

## Qué hace la diferencia

- **Pricing dinámico:** ajustar tarifas semanalmente puede sumar 15–20% al ingreso anual.
- **Fotografía profesional:** listings con fotos pro convierten hasta 3x más.
- **Respuesta rápida al huésped:** Airbnb premia tiempos < 10 minutos con mejor posicionamiento.
- **Superhost:** mantener el badge te da visibilidad adicional y confianza.

¿Quieres un número concreto para *tu* propiedad? Pide tu proyección gratis y te mandamos un estimado en 24 horas.$md$,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'Departamento moderno en Lima visto desde el balcón',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '6e84f0b6-558c-4d9d-97e0-f955907890c5',
  ARRAY['lima','rentabilidad','airbnb'],
  8,
  'published',
  '2026-04-10T10:00:00Z'
),
-- p2
(
  'pricing-dinamico-airbnb-lima',
  'Pricing dinámico: cómo subir 18% tus ingresos sin tocar nada más',
  'Ajustar tarifas por día, temporada y evento es la palanca de rentabilidad más subestimada. Cómo lo hacemos, con ejemplos reales.',
  $md$La mayoría de propietarios en Lima fijan una tarifa en octubre y no la tocan hasta el año siguiente. Eso deja **entre 12% y 22% de ingresos** sobre la mesa cada año.

## Por qué el pricing estático pierde plata

Airbnb es un marketplace con demanda volátil. La tarifa óptima cambia por:

- **Día de la semana** — jueves-domingo pagan 20–30% más.
- **Temporada** — enero-marzo y julio empujan tarifas altas.
- **Eventos** — Mistura, partidos internacionales, conciertos.
- **Competencia** — si 3 departamentos parecidos bajan, tú también deberías (por un tiempo).

## El framework que usamos

1. **Tarifa base** — anclada al promedio del distrito para el tamaño del depa.
2. **Multiplicadores de demanda** — +15% viernes, +25% sábado.
3. **Last-minute discounts** — si 3 días antes aún hay disponibilidad, -12%.
4. **Lead-time premium** — reservas con 60+ días, +8%.

## Ejemplo real

Un departamento en Miraflores que facturaba USD 2,100 mensuales con tarifa fija pasó a **USD 2,480 con pricing dinámico** — mismo depa, mismo huésped target, sólo ajuste de precio. 18% más, sin inversión.$md$,
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  'Dashboard de métricas y gráficos',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '6e84f0b6-558c-4d9d-97e0-f955907890c5',
  ARRAY['pricing','ingresos','estrategia'],
  6,
  'published',
  '2026-03-28T10:00:00Z'
),
-- p3
(
  'fotografia-profesional-airbnb',
  'Por qué la fotografía profesional es la inversión con mejor ROI',
  'Un listing con fotos profesionales convierte 3x más. Por qué el upgrade paga su costo en las primeras 2 semanas.',
  $md$Airbnb es un producto visual. El 87% de los huéspedes decide si hace click basándose **únicamente en la foto de portada**. Ahorrar en fotografía es ahorrar en el 80% del embudo.

## Qué separa una foto buena de una pro

- **Iluminación natural pareja** — sesiones a mediodía con difusores.
- **Ángulo bajo-medio** — entre 120–140 cm del suelo.
- **Staging:** cama tendida impecable, toallas enrolladas, luces encendidas, cortinas abiertas.
- **Edición:** balance de blancos consistente en todas las fotos.

## El número que importa

Una sesión profesional cuesta entre **USD 180 y USD 320**. Un depa que factura USD 2,400/mes recupera ese costo en **menos de 2 semanas** si convierte 1 reserva extra al mes.$md$,
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
  'Cámara profesional sobre una mesa de trabajo',
  'e1c71d85-02c5-4b72-bdea-128f1cdb6117',
  '5a8d4c8a-4694-4ac3-9045-c2c4929ec24f',
  ARRAY['fotografia','conversion','listing'],
  5,
  'published',
  '2026-03-14T10:00:00Z'
),
-- p4
(
  'check-in-automatizado-vs-manual',
  'Check-in automatizado vs manual: cuál conviene en Lima',
  'Cerraduras inteligentes, lockboxes o anfitrión en vivo — qué funciona mejor según el tipo de propiedad y huésped.',
  $md$Ahorrar 45 minutos por check-in suena marginal hasta que tienes 20 reservas al mes. Eso son **15 horas** que alguien estaba pagándose — o dejando de hacer otras cosas.

## Las 3 opciones principales

1. **Anfitrión en vivo** — máxima calidez, máximo costo, imprescindible para propiedades de lujo.
2. **Lockbox** — barato y confiable. Perfecto para edificios sin portería.
3. **Cerradura inteligente** — el sweet spot: código único por reserva, auditoría, zero contacto.

## Cuándo elegir cuál

- **Departamento en edificio con portería**: anfitrión en vivo + saludo de bienvenida.
- **Casa aislada o edificio sin portería**: cerradura inteligente TTLock o Yale.
- **Propiedad de lujo (USD 200+/noche)**: siempre anfitrión.$md$,
  'https://images.unsplash.com/photo-1507090960745-b32f65d3113a?w=1200&q=80',
  'Cerradura inteligente con teclado numérico',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '5a8d4c8a-4694-4ac3-9045-c2c4929ec24f',
  ARRAY['operaciones','check-in','automatizacion'],
  7,
  'published',
  '2026-02-20T10:00:00Z'
),
-- p5
(
  'regulaciones-airbnb-lima-2026',
  'Regulaciones de alquileres temporales en Lima: estado en 2026',
  'Qué dice la municipalidad de Miraflores, San Isidro y Barranco sobre Airbnb. Lo que un propietario debe saber hoy.',
  $md$A diferencia de otras ciudades (Barcelona, Nueva York), **Lima no tiene hoy una regulación nacional específica para alquileres temporales**. Eso no significa tierra de nadie — hay reglas municipales y tributarias que aplican.

## Lo que sí existe

- **Licencia de funcionamiento municipal** — si la actividad es formal y a escala comercial.
- **Impuesto a la Renta** — los ingresos por Airbnb tributan como primera o tercera categoría según la estructura.
- **Reglamento interno del edificio** — varios edificios en Miraflores/Barranco lo prohíben explícitamente; revísalo antes de invertir en amoblado.

## Qué viene

Hay proyectos de ley en debate desde 2024. Ninguno aprobado aún, pero la tendencia regional (Buenos Aires, Santiago) es regulación + impuesto específico. Recomendación: formalizar desde ya.$md$,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
  'Profesional revisando documentos legales',
  'e1c71d85-02c5-4b72-bdea-128f1cdb6117',
  'c1e13ee8-ddcc-4284-96f0-dd309155b45d',
  ARRAY['regulacion','legal','municipalidad'],
  6,
  'published',
  '2026-02-05T10:00:00Z'
),
-- p6
(
  'interiorismo-airbnb-que-funciona',
  'Interiorismo para Airbnb: qué funciona y qué es moda pasajera',
  'Estilos que convierten huéspedes, qué evitar, y cómo diseñar para fotos tanto como para estancia real.',
  $md$El objetivo del interiorismo para Airbnb no es "tu casa ideal" — es **que la foto de portada haga click y la estancia genere una reseña de 5 estrellas**. No siempre son lo mismo.

## Los estilos que consistentemente convierten

1. **Industrial moderno** — ladrillo visto, metal negro, madera clara. Fotografía espectacular.
2. **Escandinavo minimalista** — blanco, madera blonda, textiles beige. Lectura "premium" internacional.
3. **Japandi** — cruce de los dos anteriores. Muy fuerte en 2025-2026.

## Lo que la foto vende pero la estancia odia

- Sofás bajos estilo "lounge" — incómodos para huéspedes de 4+ noches.
- Camas sin cabecera — fotogénicas, terribles para leer/descansar.
- Iluminación puramente indirecta — bonita, pero leer un libro es imposible.

## La regla de oro

Diseña para **7 noches de estancia, no para 2**. Las reseñas las escriben quienes se quedan, no quienes miran fotos.$md$,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  'Sala moderna estilo industrial con luz cálida',
  'e1c71d85-02c5-4b72-bdea-128f1cdb6117',
  '5a8d4c8a-4694-4ac3-9045-c2c4929ec24f',
  ARRAY['diseno','interiorismo','estilo'],
  9,
  'published',
  '2026-01-22T10:00:00Z'
),
-- p7
(
  'gastos-ocultos-airbnb-propietario',
  '7 gastos "ocultos" que todo propietario Airbnb subestima',
  'Desde la reposición de sábanas hasta el desgaste del sofá. Los costos que no aparecen en ninguna proyección pero tienen impacto real.',
  $md$Las proyecciones de ingresos suelen mostrar un número optimista. Lo que nunca se cuenta:

## 1. Desgaste acelerado

Un sofá "de uso normal" dura 8–10 años. En Airbnb, 3–4. Planifica reposición cada 4 años.

## 2. Reposición de blancos

Sábanas, toallas, edredones. Rotación típica: 30% anual. USD 180–280/año.

## 3. Amenities que desaparecen

Decoración, libros, utensilios "bonitos". No es robo — es rotación. USD 200/año.

## 4. Mantenimiento correctivo

Grifo que gotea, calefón, aire acondicionado. USD 400–700/año.

## 5. Mejoras competitivas

Cada 2–3 años toca repintar, cambiar cortinas, renovar cocina. Entre USD 600 y USD 2,000.

## 6. Periodos sin reserva post-daño

Si un huésped daña algo mayor, el depa sale del mercado 3–10 días mientras se repara.

## 7. Impuestos y formalización

Contabilidad, impuestos, comprobantes. USD 400–800 anuales si lo manejas bien.

**Total promedio oculto: USD 1,500–2,800 / año.** No es una razón para no hacerlo — es una razón para proyectar honestamente.$md$,
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&q=80',
  'Calculadora y documentos financieros sobre un escritorio',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '6e84f0b6-558c-4d9d-97e0-f955907890c5',
  ARRAY['costos','finanzas','propietario'],
  7,
  'published',
  '2026-01-08T10:00:00Z'
),
-- p8
(
  'superhost-como-conseguirlo-mantenerlo',
  'Superhost: cómo conseguirlo y no perderlo nunca más',
  'Los cuatro umbrales que Airbnb revisa cada 3 meses, y cómo optimizar cada uno sin sacrificar cordura.',
  $md$Superhost es el badge que Airbnb otorga a anfitriones que cumplen cuatro criterios durante el último año:

1. **Rating ≥ 4.8**
2. **10 estadías o 3 reservas con 100 noches**
3. **Tasa de respuesta ≥ 90%**
4. **Tasa de cancelación < 1%**

## El que más cuesta: rating 4.8

Un 4 en cualquier reseña te baja el promedio rápido. La diferencia entre 4.8 y 4.7 en un listing de Miraflores son ~3 reservas menos al mes.

## Los que se pierden por descuido

- **Respuesta < 1 hora** siempre, incluso a las 3 AM. Usa plantillas.
- **Cancelaciones**: evítalas incluso cuando parezca que no pasa nada — te cuesta el badge.$md$,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  'Trofeo simbólico sobre un escritorio bien iluminado',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '5a8d4c8a-4694-4ac3-9045-c2c4929ec24f',
  ARRAY['superhost','reputacion','airbnb'],
  5,
  'published',
  '2025-12-15T10:00:00Z'
),
-- p9
(
  'vender-vs-airbnb-propiedad-lima',
  'Vender la propiedad o ponerla en Airbnb: el cálculo de 2026',
  'Matemática simple para decidir entre capital de venta invertido y renta mensual. Con un ejemplo real de Miraflores.',
  $md$Propietarios con un depa en Miraflores me preguntan seguido: *"¿vendo y meto la plata en otra cosa, o lo pongo en Airbnb?"*. Los números ayudan.

## Ejemplo: depa 70 m², Miraflores

- **Precio de venta estimado:** USD 220,000
- **Renta Airbnb neta estimada:** USD 1,650/mes → USD 19,800/año
- **ROI bruto:** 9%

## Alternativas a invertir el capital

| Instrumento | Rentabilidad esperada |
|---|---|
| Bonos soberanos PEN 10Y | ~6% |
| S&P 500 (histórico) | ~9% |
| Alquiler tradicional mismo depa | ~5.5% |
| **Airbnb profesional** | **~9%** |

## La variable que decide

Si el depa ya está pagado y no tienes mejor uso para el capital, Airbnb rinde parecido al S&P con la ventaja de que **puedes usarlo tú mismo** y tiene valorización del activo subyacente.

Si tienes una oportunidad de inversión con retorno > 12%, la matemática cambia.$md$,
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  'Cartel de se vende sobre un edificio',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '6e84f0b6-558c-4d9d-97e0-f955907890c5',
  ARRAY['inversion','estrategia','finanzas'],
  8,
  'published',
  '2025-11-30T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      cover_image_url = EXCLUDED.cover_image_url,
      cover_image_alt = EXCLUDED.cover_image_alt,
      author_id = EXCLUDED.author_id,
      category_id = EXCLUDED.category_id,
      tags = EXCLUDED.tags,
      reading_time_minutes = EXCLUDED.reading_time_minutes,
      status = EXCLUDED.status,
      published_at = EXCLUDED.published_at,
      updated_at = now();

-- ─── Owner testimonials (4) ─────────────────────────────────────────────────

INSERT INTO owner_testimonials (
  id, name, location, photo_url, photo_alt, quote,
  rating, occupation_rate, display_order, is_active
) VALUES
(
  '11111111-1111-4111-8111-111111111111',
  'Pilar Reyes', 'Miraflores, Lima',
  '/images/testimonials/pilar-reyes.png',
  'Pilar Reyes, propietaria en Miraflores',
  'Mi departamento pasó de estar vacío varios meses al año a tener una ocupación del 92%. Los ingresos superaron mis expectativas y el servicio es impecable.',
  5, 92, 1, true
),
(
  '22222222-2222-4222-8222-222222222222',
  'Carlos Montalva', 'San Isidro, Lima',
  '/images/testimonials/carlos-montalva.png',
  'Carlos Montalva, propietario en San Isidro',
  'Homie transformó mi experiencia como propietario. Antes me estresaba con cada inquilino, ahora solo reviso el reporte mensual y los ingresos a mi cuenta.',
  5, NULL, 2, true
),
(
  '33333333-3333-4333-8333-333333333333',
  'David Bruley', 'San Isidro, Lima',
  '/images/testimonials/david-bruley.png',
  'David Bruley, propietario en San Isidro',
  'En mi anterior administración tenía menos del 50% de ocupación, hoy en día mi apartamento no baja de 80% y el monto que recibo me mantiene muy contento.',
  5, 80, 3, true
),
(
  '44444444-4444-4444-8444-444444444444',
  'Elvira y Rolando', 'San Isidro, Lima',
  '/images/testimonials/elvira-y-rolando.png',
  'Elvira y Rolando, propietarios en San Isidro',
  'La diferencia en ingresos es notable. Pasé de un alquiler tradicional a ganar un 38% más con Airbnb, sin tener que ocuparme de nada.',
  5, NULL, 4, true
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      location = EXCLUDED.location,
      photo_url = EXCLUDED.photo_url,
      photo_alt = EXCLUDED.photo_alt,
      quote = EXCLUDED.quote,
      rating = EXCLUDED.rating,
      occupation_rate = EXCLUDED.occupation_rate,
      display_order = EXCLUDED.display_order,
      is_active = EXCLUDED.is_active,
      updated_at = now();

-- ─── Verificación ──────────────────────────────────────────────────────────
SELECT 'authors'      AS table, count(*) FROM blog_authors
UNION ALL SELECT 'posts',               count(*) FROM blog_posts  WHERE status = 'published'
UNION ALL SELECT 'owner_testimonials',  count(*) FROM owner_testimonials WHERE is_active
UNION ALL SELECT 'categories',          count(*) FROM blog_categories;
