export type Lang = 'es' | 'en';

type LS = { es: string; en: string };
type LSA = { es: string[]; en: string[] };

export type DistritoContent = {
  slug: string;
  nombre: string;
  titulo: LS;
  metaDescription: LS;
  intro: LS;
  perfilHuesped: LSA;
  fortalezas: LSA;
  retos: LSA;
  tipNocturno: LS;
  cierre: LS;
};

export const distritos: DistritoContent[] = [
  {
    slug: 'miraflores',
    nombre: 'Miraflores',
    titulo: {
      es: 'Administración Airbnb en Miraflores | Homie Perú',
      en: 'Airbnb Management in Miraflores | Homie Peru',
    },
    metaDescription: {
      es: 'Gestión integral de tu Airbnb en Miraflores: pricing dinámico, check-in 24/7 y fotografía profesional. Proyección de ingresos gratis.',
      en: 'End-to-end management for your Airbnb in Miraflores: dynamic pricing, 24/7 check-in and professional photography. Free income projection.',
    },
    intro: {
      es: 'Miraflores concentra la mayor demanda turística de Lima: malecón, Larcomar, Parque Kennedy y la vida gastronómica de la costa verde. Un departamento bien posicionado aquí puede operar prácticamente todo el año con mínima estacionalidad.',
      en: 'Miraflores has Lima\u2019s highest tourist demand: the boardwalk, Larcomar, Parque Kennedy and Costa Verde\u2019s food scene. A well-positioned apartment here can operate year-round with minimal seasonality.',
    },
    perfilHuesped: {
      es: [
        'Turistas internacionales (EE.UU., Europa, Chile, Colombia, México) en estadías de 3 a 7 noches.',
        'Viajeros de negocios que evitan zonas con tráfico pesado por la cercanía al aeropuerto vía Costa Verde.',
        'Nómadas digitales buscando unidades con Wi-Fi de alta velocidad y escritorio.',
      ],
      en: [
        'International tourists (USA, Europe, Chile, Colombia, Mexico) for 3 to 7 nights.',
        'Business travelers avoiding heavy-traffic areas thanks to airport access via Costa Verde.',
        'Digital nomads looking for units with high-speed Wi-Fi and a desk.',
      ],
    },
    fortalezas: {
      es: [
        'Densidad de restaurantes, cafés y puntos de interés — los huéspedes casi no necesitan taxi.',
        'Malecón y Costa Verde como atractivo visual directo para el listing.',
        'Buena conectividad con San Isidro y el aeropuerto por la Vía Expresa.',
      ],
      en: [
        'Dense restaurants, cafés and points of interest — guests barely need taxis.',
        'Malecón and Costa Verde as direct visual hooks for the listing.',
        'Good connectivity with San Isidro and the airport via Vía Expresa.',
      ],
    },
    retos: {
      es: [
        'Competencia alta: más de 4,000 listings activos. La fotografía y la primera foto del listing definen el CTR.',
        'Algunos edificios antiguos no permiten alquiler temporal — validamos reglamento antes de firmar contrato.',
        'Ruido en zonas cercanas a Larcomar y Avenida Larco — elegir ubicación dentro del distrito importa.',
      ],
      en: [
        'High competition: 4,000+ active listings. Photography and the hero shot define CTR.',
        'Some older buildings don\u2019t allow short-term rentals — we validate bylaws before signing.',
        'Noise near Larcomar and Avenida Larco — location within the district matters.',
      ],
    },
    tipNocturno: {
      es: 'Durante Mistura, Lima Fashion Week o verano (enero–marzo) las tarifas se ajustan al alza entre 25% y 60%. Nuestro motor de pricing lo hace automáticamente.',
      en: 'During Mistura, Lima Fashion Week or summer (January–March) rates rise 25–60%. Our pricing engine handles it automatically.',
    },
    cierre: {
      es: 'Si tu propiedad está entre el malecón y la Avenida Benavides, es candidata natural para Airbnb premium. Si está más cerca de Surquillo o Santa Cruz, todavía funciona, pero el ADR (precio promedio por noche) es menor. Te lo decimos con datos reales en la proyección gratuita.',
      en: 'If your property sits between the boardwalk and Avenida Benavides, it\u2019s a natural fit for premium Airbnb. Closer to Surquillo or Santa Cruz still works, but ADR is lower. We show you real data in the free projection.',
    },
  },
  {
    slug: 'barranco',
    nombre: 'Barranco',
    titulo: {
      es: 'Administración Airbnb en Barranco | Homie Perú',
      en: 'Airbnb Management in Barranco | Homie Peru',
    },
    metaDescription: {
      es: 'Administramos tu Airbnb en Barranco con diseño interior, fotografía y atención 24/7. Proyección de ingresos gratuita.',
      en: 'We manage your Barranco Airbnb with interior design, photography and 24/7 support. Free income projection.',
    },
    intro: {
      es: 'Barranco es el distrito bohemio de Lima: arte, murales, bares y una escena gastronómica de autor. Atrae a un huésped específico — creativo, cultural, dispuesto a pagar más por experiencia — y por eso los listings con buen diseño interior superan por amplio margen a la competencia.',
      en: 'Barranco is Lima\u2019s bohemian district: art, murals, bars and an author-led food scene. It attracts a specific guest — creative, cultural, willing to pay for experience — so listings with strong interior design outperform the competition by a wide margin.',
    },
    perfilHuesped: {
      es: [
        'Turistas culturales y foodies (MAC, Dédalo, ruta de bares).',
        'Parejas jóvenes de Europa y Sudamérica en estadías de 4 a 10 noches.',
        'Nómadas digitales con estancias de 1 a 3 meses.',
      ],
      en: [
        'Cultural tourists and foodies (MAC, Dédalo, bar route).',
        'Young couples from Europe and South America staying 4–10 nights.',
        'Digital nomads for 1–3 month stays.',
      ],
    },
    fortalezas: {
      es: [
        'El distrito vende experiencia — los listings con murales, cerámica peruana o muebles vintage rankean mejor.',
        'Menor densidad de listings que Miraflores: menos competencia, ADR similar o mayor.',
        'Ideal para estadías largas (MTR, Monthly-to-Rent), que reducen costos operativos.',
      ],
      en: [
        'The district sells experience — listings with murals, Peruvian ceramics or vintage furniture rank higher.',
        'Lower listing density than Miraflores: less competition, similar or higher ADR.',
        'Ideal for long stays (MTR — Monthly-to-Rent), which cut operating costs.',
      ],
    },
    retos: {
      es: [
        'Ruido los fines de semana cerca del Puente de los Suspiros y Sánchez Carrión — gestionar expectativas del huésped con fotos honestas evita reseñas negativas.',
        'Parqueo limitado: lo convertimos en feature ofreciendo guía de transporte en el listing.',
        'Estacionalidad un poco más marcada que Miraflores — requiere pricing activo fuera de temporada alta.',
      ],
      en: [
        'Weekend noise near Puente de los Suspiros and Sánchez Carrión — managing expectations with honest photos prevents bad reviews.',
        'Limited parking: we turn it into a feature with a transport guide in the listing.',
        'Slightly stronger seasonality than Miraflores — requires active pricing out of peak season.',
      ],
    },
    tipNocturno: {
      es: 'Las propiedades con diseño cuidado pueden cobrar 20–35% más por noche que el promedio del distrito. El retorno de inversión en decoración es de 2 a 4 meses.',
      en: 'Well-designed properties can charge 20–35% more per night than the district average. Decor investment pays back in 2–4 months.',
    },
    cierre: {
      es: 'Si tu propiedad está en Barranco y tiene carácter — terraza, vista, diseño — probablemente está subvaluada como alquiler tradicional. Te mostramos el delta real contra Airbnb bien gestionado.',
      en: 'If your Barranco property has character — terrace, views, design — it\u2019s probably undervalued as a traditional rental. We\u2019ll show you the real delta against well-managed Airbnb.',
    },
  },
  {
    slug: 'san-isidro',
    nombre: 'San Isidro',
    titulo: {
      es: 'Administración Airbnb en San Isidro | Homie Perú',
      en: 'Airbnb Management in San Isidro | Homie Peru',
    },
    metaDescription: {
      es: 'Gestión Airbnb en San Isidro para viajeros ejecutivos: check-in flexible, facturación empresarial y estadías largas.',
      en: 'Airbnb management in San Isidro for business travelers: flexible check-in, corporate invoicing and long stays.',
    },
    intro: {
      es: 'San Isidro es el distrito financiero de Lima y su demanda de alquiler temporal está dominada por viajeros corporativos y ejecutivos en proyectos de 1 a 3 meses. El ADR es alto y la ocupación entre semana suele superar la de los fines de semana — un patrón inverso al de Miraflores.',
      en: 'San Isidro is Lima\u2019s financial district and its short-term rental demand is dominated by corporate travelers and executives on 1–3 month projects. ADR is high and weekday occupancy often beats weekends — the inverse pattern of Miraflores.',
    },
    perfilHuesped: {
      es: [
        'Ejecutivos en asignaciones de 2 a 12 semanas (consultoras, minería, banca).',
        'Viajeros de negocios con presupuesto corporativo y requisitos de facturación.',
        'Familias en tránsito durante mudanzas internacionales.',
      ],
      en: [
        'Executives on 2–12 week assignments (consulting, mining, banking).',
        'Business travelers with corporate budgets and invoicing requirements.',
        'Families in transit during international relocations.',
      ],
    },
    fortalezas: {
      es: [
        'ADR más alto de Lima por huésped corporativo.',
        'Estadías más largas = menos rotación = menos costos de limpieza y check-in.',
        'Demanda sostenida entre semana — no depende de temporada turística.',
      ],
      en: [
        'Highest ADR in Lima thanks to corporate guests.',
        'Longer stays = less turnover = lower cleaning and check-in costs.',
        'Sustained weekday demand — not tied to tourist season.',
      ],
    },
    retos: {
      es: [
        'El huésped corporativo exige estándares hoteleros: sábanas 300 hilos, escritorio ergonómico, Wi-Fi sólido, secadora.',
        'Facturación B2B requiere emitir factura electrónica — lo gestionamos por ti.',
        'Edificios corporativos muchas veces prohíben alquiler temporal: validamos estatuto antes de firmar.',
      ],
      en: [
        'Corporate guests demand hotel standards: 300-thread sheets, ergonomic desk, solid Wi-Fi, dryer.',
        'B2B invoicing requires issuing electronic invoices — we handle it.',
        'Corporate buildings often ban short-term rentals: we validate bylaws before signing.',
      ],
    },
    tipNocturno: {
      es: 'Descuentos semanales y mensuales (>10% y >20%) atraen al perfil ejecutivo y suben la ocupación sin canibalizar margen — porque reducen costos de rotación.',
      en: 'Weekly and monthly discounts (>10% and >20%) attract the executive profile and raise occupancy without eating margin — because they cut turnover costs.',
    },
    cierre: {
      es: 'Si tu departamento está en la zona financiera (Camino Real, Rivera Navarrete, Javier Prado) o cerca del Golf, tiene mercado cautivo para estadías medias. Lo operamos como un "corporate housing" con experiencia Airbnb.',
      en: 'If your apartment is in the financial zone (Camino Real, Rivera Navarrete, Javier Prado) or near the Golf, it has a captive market for medium stays. We run it as corporate housing with an Airbnb experience.',
    },
  },
  {
    slug: 'magdalena-del-mar',
    nombre: 'Magdalena del Mar',
    titulo: {
      es: 'Administración Airbnb en Magdalena del Mar | Homie Perú',
      en: 'Airbnb Management in Magdalena del Mar | Homie Peru',
    },
    metaDescription: {
      es: 'Administración Airbnb en Magdalena del Mar: frente al mar sobre la Costa Verde, alternativa costera a San Isidro. Gestión integral, check-in 24/7 y reportes mensuales.',
      en: 'Airbnb management in Magdalena del Mar: oceanfront on Costa Verde, a coastal alternative to San Isidro. End-to-end management, 24/7 check-in and monthly reports.',
    },
    intro: {
      es: 'Magdalena del Mar combina dos cosas que rara vez coinciden en Lima: frente de mar sobre la Costa Verde y tarifas por noche más accesibles que los distritos vecinos. El corredor de Salaverry, las cuadras cercanas al Malecón Castagnola y los edificios nuevos alrededor del Óvalo Pérez Araníbar son los que mejor convierten en alquiler temporal, especialmente con viajeros de negocios, médicos y familias que buscan alternativa costera a San Isidro.',
      en: 'Magdalena del Mar offers something rare in Lima: a Costa Verde coastline paired with per-night rates more accessible than its neighbors. The Salaverry corridor, blocks near Malecón Castagnola and newer buildings around Óvalo Pérez Araníbar convert best for short-term rental, especially with business, medical and family guests seeking a coastal alternative to San Isidro.',
    },
    perfilHuesped: {
      es: [
        'Viajeros médicos atendidos en clínicas y hospitales cercanos (Clínica Stella Maris, Clínica Delgado, Hospital Militar Central).',
        'Ejecutivos con agenda en San Isidro que buscan una tarifa más accesible sin alejarse del eje empresarial.',
        'Familias en estadías medias que priorizan estar frente al mar y a 15 minutos de Miraflores por la Costa Verde.',
      ],
      en: [
        'Medical travelers treated at nearby clinics and hospitals (Clínica Stella Maris, Clínica Delgado, Hospital Militar Central).',
        'Executives with meetings in San Isidro who want a more accessible rate without leaving the business corridor.',
        'Families on medium stays who value being oceanfront and 15 minutes from Miraflores via Costa Verde.',
      ],
    },
    fortalezas: {
      es: [
        'Frente de mar y Malecón Castagnola: argumento potente de listing con fotografía sobre la Costa Verde.',
        'ADR más bajo que San Isidro pero con acceso equivalente al centro empresarial — muy buen ratio ocupación/precio.',
        'Corredor Salaverry y edificios nuevos alrededor del óvalo ofrecen stock moderno de 1–2 dormitorios, ideal para alquiler temporal.',
      ],
      en: [
        'Oceanfront and Malecón Castagnola: a strong listing angle with Costa Verde photography.',
        'Lower ADR than San Isidro with equivalent commuter access to the business core — excellent occupancy-to-price ratio.',
        'The Salaverry corridor and newer buildings around the roundabout offer modern 1–2 bedroom stock, ideal for short-term rental.',
      ],
    },
    retos: {
      es: [
        'Ruido sobre Costa Verde, Av. Brasil y Av. Salaverry: la selección de piso y orientación determina la reputación del listing.',
        'Distrito heterogéneo — algunas cuadras del centro tradicional rinden menos que los edificios modernos del corredor Salaverry.',
        'Menor densidad turística que Miraflores; la estrategia se apoya en viajero corporativo y médico más que en tráfico Airbnb casual.',
      ],
      en: [
        'Costa Verde and main-avenue noise (Av. Brasil, Av. Salaverry): floor selection and orientation drive listing reputation.',
        'Heterogeneous district — some old-core blocks perform below the modern buildings along Salaverry.',
        'Lower tourist density than Miraflores; the strategy leans on corporate and medical travelers rather than casual Airbnb traffic.',
      ],
    },
    tipNocturno: {
      es: 'Los viajeros médicos suelen reservar por 2–4 semanas: una tarifa semanal con descuento convierte mejor que la noche suelta. Si tu edificio está a ≤10 minutos caminando de una clínica grande, destácalo en el título del listing.',
      en: 'Medical travelers usually book 2–4 weeks: a discounted weekly rate converts better than nightly. If your building is ≤10 minutes walking from a major clinic, highlight it in the listing title.',
    },
    cierre: {
      es: 'Si tu propiedad está en Magdalena del Mar — frente al mar, sobre Salaverry o cerca de clínicas — tenemos un playbook específico para maximizar ocupación corporativa y médica. En la proyección te mostramos las dos canastas de huéspedes.',
      en: 'If your property is in Magdalena del Mar — oceanfront, along Salaverry or near clinics — we have a specific playbook to maximize corporate and medical occupancy. The projection shows both guest baskets.',
    },
  },
];
