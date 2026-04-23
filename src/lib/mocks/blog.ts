import type { BlogAuthor, BlogCategory, BlogPostWithRelations } from '../../types/blog';

const authors: BlogAuthor[] = [
  {
    id: 'a1',
    name: 'Fabrizio Silva',
    slug: 'fabrizio-silva',
    bio: 'Cofundador de Homie. Más de 7 años operando alquileres temporales en Lima Top.',
    avatar_url: '/images/brand/homie-logo.png',
    role: 'Cofundador',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'a2',
    name: 'Equipo Homie',
    slug: 'equipo-homie',
    bio: 'Producción editorial del equipo Homie — investigación de mercado, pricing y operaciones.',
    avatar_url: '/images/brand/homie-logo.png',
    role: 'Editorial',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'a3',
    name: 'Antonio Touzett',
    slug: 'antonio-touzett',
    bio: 'Cofundador de Homie. Especialista en operaciones y experiencia de huéspedes.',
    avatar_url: '/images/brand/homie-logo.png',
    role: 'Cofundador',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'a4',
    name: 'Javier Flores Macías',
    slug: 'javier-flores-macias',
    bio: 'Tech & producto en Homie. Automatización, pricing dinámico y analítica.',
    avatar_url: '/images/brand/homie-logo.png',
    role: 'Tech & Producto',
    created_at: '2025-01-01T00:00:00Z',
  },
];

const categories: BlogCategory[] = [
  { id: 'c1', slug: 'rentabilidad', name: 'Rentabilidad', description: 'ROI, pricing y análisis de ingresos.', created_at: '2025-01-01T00:00:00Z' },
  { id: 'c2', slug: 'mercado', name: 'Mercado', description: 'Tendencias del mercado Airbnb en Lima.', created_at: '2025-01-01T00:00:00Z' },
  { id: 'c3', slug: 'operaciones', name: 'Operaciones', description: 'Gestión diaria, limpieza, check-in.', created_at: '2025-01-01T00:00:00Z' },
  { id: 'c4', slug: 'diseno', name: 'Diseño', description: 'Interiorismo y fotografía.', created_at: '2025-01-01T00:00:00Z' },
];

const byAuthor = (id: string) => authors.find((a) => a.id === id)!;
const byCategory = (id: string) => categories.find((c) => c.id === id)!;

const base = {
  status: 'published' as const,
  meta_title: null,
  meta_description: null,
  og_image_url: null,
  views_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const raw = [
  {
    id: 'p1',
    slug: 'cuanto-gana-un-airbnb-en-lima',
    title: '¿Cuánto gana realmente un Airbnb en Lima en 2026?',
    excerpt:
      'Análisis con datos reales de ocupación, tarifa promedio y comisiones en Miraflores, Barranco y San Isidro. Números que un propietario puede esperar hoy.',
    cover_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    cover_image_alt: 'Departamento moderno en Lima visto desde el balcón',
    author_id: 'a1',
    category_id: 'c1',
    tags: ['lima', 'rentabilidad', 'airbnb'],
    reading_time_minutes: 8,
    published_at: '2026-04-10T10:00:00Z',
    content: `La pregunta que todo propietario hace en la primera llamada con Homie es la misma: **¿cuánto voy a ganar?** La respuesta honesta depende de tres variables — ubicación, tamaño y estado de la propiedad — pero los rangos son sorprendentemente consistentes entre distritos de Lima Top.

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

¿Quieres un número concreto para *tu* propiedad? Pide tu proyección gratis y te mandamos un estimado en 24 horas.`,
  },
  {
    id: 'p2',
    slug: 'pricing-dinamico-airbnb-lima',
    title: 'Pricing dinámico: cómo subir 18% tus ingresos sin tocar nada más',
    excerpt:
      'Ajustar tarifas por día, temporada y evento es el palanca de rentabilidad más subestimada. Cómo lo hacemos, con ejemplos reales.',
    cover_image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    cover_image_alt: 'Dashboard de métricas y gráficos',
    author_id: 'a1',
    category_id: 'c1',
    tags: ['pricing', 'ingresos', 'estrategia'],
    reading_time_minutes: 6,
    published_at: '2026-03-28T10:00:00Z',
    content: `La mayoría de propietarios en Lima fijan una tarifa en octubre y no la tocan hasta el año siguiente. Eso deja **entre 12% y 22% de ingresos** sobre la mesa cada año.

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

Un departamento en Miraflores que facturaba USD 2,100 mensuales con tarifa fija pasó a **USD 2,480 con pricing dinámico** — mismo depa, mismo huésped target, sólo ajuste de precio. 18% más, sin inversión.`,
  },
  {
    id: 'p3',
    slug: 'fotografia-profesional-airbnb',
    title: 'Por qué la fotografía profesional es la inversión con mejor ROI',
    excerpt:
      'Un listing con fotos profesionales convierte 3x más. Por qué el upgrade paga su costo en las primeras 2 semanas.',
    cover_image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
    cover_image_alt: 'Cámara profesional sobre una mesa de trabajo',
    author_id: 'a2',
    category_id: 'c4',
    tags: ['fotografia', 'conversion', 'listing'],
    reading_time_minutes: 5,
    published_at: '2026-03-14T10:00:00Z',
    content: `Airbnb es un producto visual. El 87% de los huéspedes decide si hace click basándose **únicamente en la foto de portada**. Ahorrar en fotografía es ahorrar en el 80% del embudo.

## Qué separa una foto buena de una pro

- **Iluminación natural pareja** — sesiones a mediodía con difusores.
- **Ángulo bajo-medio** — entre 120–140 cm del suelo.
- **Staging:** cama tendida impecable, toallas enrolladas, luces encendidas, cortinas abiertas.
- **Edición:** balance de blancos consistente en todas las fotos.

## El número que importa

Un sesión profesional cuesta entre **USD 180 y USD 320**. Un depa que factura USD 2,400/mes recupera ese costo en **menos de 2 semanas** si convierte 1 reserva extra al mes.`,
  },
  {
    id: 'p4',
    slug: 'check-in-automatizado-vs-manual',
    title: 'Check-in automatizado vs manual: cuál conviene en Lima',
    excerpt:
      'Cerraduras inteligentes, lockboxes o anfitrión en vivo — qué funciona mejor según el tipo de propiedad y huésped.',
    cover_image_url: 'https://images.unsplash.com/photo-1507090960745-b32f65d3113a?w=1200&q=80',
    cover_image_alt: 'Cerradura inteligente con teclado numérico',
    author_id: 'a1',
    category_id: 'c3',
    tags: ['operaciones', 'check-in', 'automatizacion'],
    reading_time_minutes: 7,
    published_at: '2026-02-20T10:00:00Z',
    content: `Ahorrar 45 minutos por check-in suena marginal hasta que tienes 20 reservas al mes. Eso son **15 horas** que alguien estaba pagándose — o dejando de hacer otras cosas.

## Las 3 opciones principales

1. **Anfitrión en vivo** — máxima calidez, máximo costo, imprescindible para propiedades de lujo.
2. **Lockbox** — barato y confiable. Perfecto para edificios sin portería.
3. **Cerradura inteligente** — el sweet spot: código único por reserva, auditoría, zero contacto.

## Cuándo elegir cuál

- **Departamento en edificio con portería**: anfitrión en vivo + saludo de bienvenida.
- **Casa aislada o edificio sin portería**: cerradura inteligente TTLock o Yale.
- **Propiedad de lujo (USD 200+/noche)**: siempre anfitrión.`,
  },
  {
    id: 'p5',
    slug: 'regulaciones-airbnb-lima-2026',
    title: 'Regulaciones de alquileres temporales en Lima: estado en 2026',
    excerpt:
      'Qué dice la municipalidad de Miraflores, San Isidro y Barranco sobre Airbnb. Lo que un propietario debe saber hoy.',
    cover_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    cover_image_alt: 'Profesional revisando documentos legales',
    author_id: 'a2',
    category_id: 'c2',
    tags: ['regulacion', 'legal', 'municipalidad'],
    reading_time_minutes: 6,
    published_at: '2026-02-05T10:00:00Z',
    content: `A diferencia de otras ciudades (Barcelona, Nueva York), **Lima no tiene hoy una regulación nacional específica para alquileres temporales**. Eso no significa tierra de nadie — hay reglas municipales y tributarias que aplican.

## Lo que sí existe

- **Licencia de funcionamiento municipal** — si la actividad es formal y a escala comercial.
- **Impuesto a la Renta** — los ingresos por Airbnb tributan como primera o tercera categoría según la estructura.
- **Reglamento interno del edificio** — varios edificios en Miraflores/Barranco lo prohíben explícitamente; revísalo antes de invertir en amoblado.

## Qué viene

Hay proyectos de ley en debate desde 2024. Ninguno aprobado aún, pero la tendencia regional (Buenos Aires, Santiago) es regulación + impuesto específico. Recomendación: formalizar desde ya.`,
  },
  {
    id: 'p6',
    slug: 'interiorismo-airbnb-que-funciona',
    title: 'Interiorismo para Airbnb: qué funciona y qué es moda pasajera',
    excerpt:
      'Estilos que convierten huéspedes, qué evitar, y cómo diseñar para fotos tanto como para estancia real.',
    cover_image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    cover_image_alt: 'Sala moderna estilo industrial con luz cálida',
    author_id: 'a2',
    category_id: 'c4',
    tags: ['diseno', 'interiorismo', 'estilo'],
    reading_time_minutes: 9,
    published_at: '2026-01-22T10:00:00Z',
    content: `El objetivo del interiorismo para Airbnb no es "tu casa ideal" — es **que la foto de portada haga click y la estancia genere una reseña de 5 estrellas**. No siempre son lo mismo.

## Los estilos que consistentemente convierten

1. **Industrial moderno** — ladrillo visto, metal negro, madera clara. Fotografía espectacular.
2. **Escandinavo minimalista** — blanco, madera blonda, textiles beige. Lectura "premium" internacional.
3. **Japandi** — cruce de los dos anteriores. Muy fuerte en 2025-2026.

## Lo que la foto vende pero la estancia odia

- Sofás bajos estilo "lounge" — incómodos para huéspedes de 4+ noches.
- Camas sin cabecera — fotogénicas, terribles para leer/descansar.
- Iluminación puramente indirecta — bonita, pero leer un libro es imposible.

## La regla de oro

Diseña para **7 noches de estancia, no para 2**. Las reseñas las escriben quienes se quedan, no quienes miran fotos.`,
  },
  {
    id: 'p7',
    slug: 'gastos-ocultos-airbnb-propietario',
    title: '7 gastos "ocultos" que todo propietario Airbnb subestima',
    excerpt:
      'Desde la reposición de sábanas hasta el desgaste del sofá. Los costos que no aparecen en ninguna proyección pero tienen impacto real.',
    cover_image_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&q=80',
    cover_image_alt: 'Calculadora y documentos financieros sobre un escritorio',
    author_id: 'a1',
    category_id: 'c1',
    tags: ['costos', 'finanzas', 'propietario'],
    reading_time_minutes: 7,
    published_at: '2026-01-08T10:00:00Z',
    content: `Las proyecciones de ingresos suelen mostrar un número optimista. Lo que nunca se cuenta:

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

**Total promedio oculto: USD 1,500–2,800 / año.** No es una razón para no hacerlo — es una razón para proyectar honestamente.`,
  },
  {
    id: 'p8',
    slug: 'superhost-como-conseguirlo-mantenerlo',
    title: 'Superhost: cómo conseguirlo y no perderlo nunca más',
    excerpt:
      'Los cuatro umbrales que Airbnb revisa cada 3 meses, y cómo optimizar cada uno sin sacrificar cordura.',
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    cover_image_alt: 'Trofeo simbólico sobre un escritorio bien iluminado',
    author_id: 'a1',
    category_id: 'c3',
    tags: ['superhost', 'reputacion', 'airbnb'],
    reading_time_minutes: 5,
    published_at: '2025-12-15T10:00:00Z',
    content: `Superhost es el badge que Airbnb otorga a anfitriones que cumplen cuatro criterios durante el último año:

1. **Rating ≥ 4.8**
2. **10 estadías o 3 reservas con 100 noches**
3. **Tasa de respuesta ≥ 90%**
4. **Tasa de cancelación < 1%**

## El que más cuesta: rating 4.8

Un 4 en cualquier reseña te baja el promedio rápido. La diferencia entre 4.8 y 4.7 en un listing de Miraflores son ~3 reservas menos al mes.

## Los que se pierden por descuido

- **Respuesta < 1 hora** siempre, incluso a las 3 AM. Usa plantillas.
- **Cancelaciones**: evítalas incluso cuando parezca que no pasa nada — te cuesta el badge.`,
  },
  {
    id: 'p9',
    slug: 'vender-vs-airbnb-propiedad-lima',
    title: 'Vender la propiedad o ponerla en Airbnb: el cálculo de 2026',
    excerpt:
      'Matemática simple para decidir entre capital de venta invertido y renta mensual. Con un ejemplo real de Miraflores.',
    cover_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    cover_image_alt: 'Cartel de se vende sobre un edificio',
    author_id: 'a1',
    category_id: 'c2',
    tags: ['inversion', 'estrategia', 'finanzas'],
    reading_time_minutes: 8,
    published_at: '2025-11-30T10:00:00Z',
    content: `Propietarios con un depa en Miraflores me preguntan seguido: *"¿vendo y meto la plata en otra cosa, o lo pongo en Airbnb?"*. Los números ayudan.

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

Si tienes una oportunidad de inversión con retorno > 12%, la matemática cambia.`,
  },
];

export const mockPosts: BlogPostWithRelations[] = raw.map((r) => ({
  ...base,
  ...r,
  author: byAuthor(r.author_id),
  category: byCategory(r.category_id),
}));

export const mockCategories = categories;
export const mockAuthors = authors;
