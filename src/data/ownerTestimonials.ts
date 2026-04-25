export type OwnerTestimonial = {
  name: string;
  location: { es: string; en: string };
  quote: { es: string; en: string };
  rating: 1 | 2 | 3 | 4 | 5;
  image: string;
};

export const ownerTestimonials: OwnerTestimonial[] = [
  {
    name: 'Pilar Reyes',
    location: { es: 'Miraflores, Lima', en: 'Miraflores, Lima' },
    quote: {
      es: 'Mi departamento pasó de estar vacío varios meses al año a tener una ocupación del 92%. Los ingresos superaron mis expectativas y el servicio es impecable.',
      en: 'My apartment went from sitting empty several months a year to 92% occupancy. Income exceeded my expectations and the service is flawless.',
    },
    rating: 5,
    image: '/images/testimonials/pilar-reyes.png',
  },
  {
    name: 'Carlos Montalva',
    location: { es: 'San Isidro, Lima', en: 'San Isidro, Lima' },
    quote: {
      es: 'Homie transformó mi experiencia como propietario. Antes me estresaba con cada inquilino, ahora solo reviso el reporte mensual y los ingresos a mi cuenta.',
      en: 'Homie transformed my experience as an owner. I used to stress with every tenant — now I just review the monthly report and the income hitting my account.',
    },
    rating: 5,
    image: '/images/testimonials/carlos-montalva.png',
  },
  {
    name: 'David Bruley',
    location: { es: 'San Isidro, Lima', en: 'San Isidro, Lima' },
    quote: {
      es: 'En mi anterior administración tenía menos del 50% de ocupación, hoy en día mi apartamento no baja de 80% y el monto que recibo me mantiene muy contento.',
      en: 'With my previous manager I had under 50% occupancy. Today my apartment never drops below 80% and the amount I receive keeps me very happy.',
    },
    rating: 5,
    image: '/images/testimonials/david-bruley.png',
  },
  {
    name: 'Elvira y Rolando',
    location: { es: 'San Isidro, Lima', en: 'San Isidro, Lima' },
    quote: {
      es: 'La diferencia en ingresos es notable. Pasé de un alquiler tradicional a ganar un 38% más con Airbnb, sin tener que ocuparme de nada.',
      en: 'The income difference is striking. I went from a traditional rental to earning 38% more with Airbnb — without having to deal with anything.',
    },
    rating: 5,
    image: '/images/testimonials/elvira-y-rolando.png',
  },
];
