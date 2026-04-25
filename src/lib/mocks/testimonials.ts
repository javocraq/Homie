import type { OwnerTestimonialRow, GuestTestimonialRow } from '../../types/blog';

const base = {
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  is_active: true,
};

export const mockOwnerTestimonials: OwnerTestimonialRow[] = [
  {
    ...base,
    id: 't1',
    name: 'Pilar Reyes',
    location: 'Miraflores, Lima',
    photo_url: '/images/testimonials/pilar-reyes.png',
    photo_alt: 'Pilar Reyes, propietaria en Miraflores',
    quote:
      'Mi departamento pasó de estar vacío varios meses al año a tener una ocupación del 92%. Los ingresos superaron mis expectativas y el servicio es impecable.',
    rating: 5,
    occupation_rate: 92,
    display_order: 1,
  },
  {
    ...base,
    id: 't2',
    name: 'Carlos Montalva',
    location: 'San Isidro, Lima',
    photo_url: '/images/testimonials/carlos-montalva.png',
    photo_alt: 'Carlos Montalva, propietario en San Isidro',
    quote:
      'Homie transformó mi experiencia como propietario. Antes me estresaba con cada inquilino, ahora solo reviso el reporte mensual y los ingresos a mi cuenta.',
    rating: 5,
    occupation_rate: null,
    display_order: 2,
  },
  {
    ...base,
    id: 't3',
    name: 'David Bruley',
    location: 'San Isidro, Lima',
    photo_url: '/images/testimonials/david-bruley.png',
    photo_alt: 'David Bruley, propietario en San Isidro',
    quote:
      'En mi anterior administración tenía menos del 50% de ocupación, hoy en día mi apartamento no baja de 80% y el monto que recibo me mantiene muy contento.',
    rating: 5,
    occupation_rate: 80,
    display_order: 3,
  },
  {
    ...base,
    id: 't4',
    name: 'Elvira y Rolando',
    location: 'San Isidro, Lima',
    photo_url: '/images/testimonials/elvira-y-rolando.png',
    photo_alt: 'Elvira y Rolando, propietarios en San Isidro',
    quote:
      'La diferencia en ingresos es notable. Pasé de un alquiler tradicional a ganar un 38% más con Airbnb, sin tener que ocuparme de nada.',
    rating: 5,
    occupation_rate: null,
    display_order: 4,
  },
];

export const mockGuestTestimonials: GuestTestimonialRow[] = [];
