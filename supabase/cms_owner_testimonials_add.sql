-- ============================================================
-- Homie CMS — Agregar 5 nuevos testimonios de propietarios
-- Ejecutar UNA VEZ en Supabase SQL Editor (Project → SQL).
-- Idempotente: usa WHERE NOT EXISTS por nombre para evitar duplicados.
-- ============================================================

-- Punto de partida: continúa desde el mayor display_order existente.
-- Los nuevos reciben orden consecutivo en el orden dado por el cliente.
WITH base AS (
  SELECT COALESCE(MAX(display_order), 0) AS max_order FROM owner_testimonials
),
nuevos(name, location, photo_url, photo_alt, quote, idx) AS (
  VALUES
  (
    'Juan Garcia',
    '',
    '/images/testimonials/juan-garcia.jpeg',
    'Juan Garcia, propietario',
    '¡Homie es lo máximo! Me ayudaron con todo, desde la limpieza hasta que los huéspedes estuvieran súper cómodos. Mis reservas han subido y todo es mucho más fácil. ¡Totalmente recomendados!',
    1
  ),
  (
    'Cristian Contreras',
    '',
    '/images/testimonials/cristian-contreras.jpeg',
    'Cristian Contreras, propietario',
    'No sé qué haría sin Homie. Ellos se encargan de todo mientras yo me relajo. Los huéspedes siempre quedan contentos, y eso se nota en las reservas repetidas. ¡Súper recomendados para cualquiera que quiera hacer más fácil su vida como anfitrión!',
    2
  ),
  (
    'Bryan Navarro',
    '',
    '/images/testimonials/bryan-navarro.jpeg',
    'Bryan Navarro, propietario',
    'Con Homie, mi propiedad está en las mejores manos. Son muy atentos, siempre solucionan cualquier cosa y gracias a ellos, mis huéspedes están felices y siempre vuelven. ¡El mejor equipo para manejar mi alquiler!',
    3
  ),
  (
    'Martin Savedra',
    '',
    '/images/testimonials/martin-savedra.jpeg',
    'Martin Savedra, propietario',
    '¡Me encantó trabajar con Homie! Son súper profesionales, pero también súper cercanos. Siempre están ahí para ayudar, y mis huéspedes se van encantados. Si buscas alguien que se ocupe de todo, Homie es la opción.',
    4
  ),
  (
    'Roy Del Águila',
    '',
    '/images/testimonials/roy-del-aguila.jpeg',
    'Roy Del Águila, propietario',
    'Homie ha hecho que administrar mi propiedad sea pan comido. Se encargan de todo, desde la limpieza hasta la atención al cliente, y mis ingresos han aumentado. Todo lo que tenía que hacer antes ahora lo hacen ellos, y los huéspedes siempre lo agradecen. ¡Gracias por todo!',
    5
  )
)
INSERT INTO owner_testimonials (
  name, location, photo_url, photo_alt, quote,
  rating, occupation_rate, display_order, is_active
)
SELECT
  n.name,
  n.location,
  n.photo_url,
  n.photo_alt,
  n.quote,
  5::smallint,                           -- rating
  NULL,                                  -- occupation_rate
  (b.max_order + n.idx),                 -- display_order consecutivo
  true                                   -- is_active
FROM nuevos n, base b
WHERE NOT EXISTS (
  SELECT 1 FROM owner_testimonials o WHERE o.name = n.name
);

-- Verificación
SELECT id, name, display_order, is_active, left(quote, 60) || '…' AS quote_preview
FROM owner_testimonials
ORDER BY display_order ASC;
