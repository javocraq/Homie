export type GuestReview = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: { es: string; en: string };
  source: 'Airbnb';
};

export const guestReviews: GuestReview[] = [
  {
    author: 'Lian',
    rating: 5,
    date: '2026-04-14',
    text: {
      es: 'El departamento es excelente, está limpio y muy bien equipado. El propietario se ocupó de cada detalle y estuvo disponible para cualquier pregunta en todo momento. La hospitalidad fue excelente.',
      en: 'The apartment is excellent — clean and very well equipped. The host took care of every detail and was available for any question at all times. Hospitality was excellent.',
    },
    source: 'Airbnb',
  },
  {
    author: 'Aaron',
    rating: 5,
    date: '2026-04-07',
    text: {
      es: 'Muy cómodo, todo igual a lo que te dicen. La comunicación excelente, me volvería a quedar ahí las veces que pueda y esté en Lima.',
      en: 'Very comfortable, exactly as described. Communication was excellent — I would stay here again every time I\u2019m in Lima.',
    },
    source: 'Airbnb',
  },
  {
    author: 'Andrew',
    rating: 5,
    date: '2026-04-07',
    text: {
      es: '¡Me encantó estar aquí! Excelente lugar, personal excelente, muy cerca del mar y con muchas tiendas geniales justo al lado.',
      en: 'I loved staying here! Great place, great staff, very close to the ocean and lots of cool shops right nearby.',
    },
    source: 'Airbnb',
  },
  {
    author: 'Erika Wan Jung',
    rating: 5,
    date: '2025-07-01',
    text: {
      es: 'Excelente lugar si visitas Lima. El departamento de Fabrizio es chico pero tiene una vista muy linda y super limpio. El edificio tiene seguridad las 24hs y la zona es super segura. Fabrizio siempre estuvo muy atento a nuestras consultas y nos resolvió super rápido. Lo recomiendo 100%.',
      en: 'Excellent place if you\u2019re visiting Lima. Fabrizio\u2019s apartment is small but has a beautiful view and is super clean. The building has 24-hour security and the area is very safe. Fabrizio was always very attentive to our questions and answered super fast. I recommend it 100%.',
    },
    source: 'Airbnb',
  },
  {
    author: 'Antonio',
    rating: 5,
    date: '2026-03-31',
    text: {
      es: 'El departamento es tal cual la descripción, acogedor, ordenado y muy bien equipado. La comunicación con el anfitrión es muy fluida y siempre están disponibles para cualquier consulta. La zona es muy tranquila y con muchas opciones para comer algo o también para hacer compras.',
      en: 'The apartment is exactly as described — cozy, tidy and very well equipped. Communication with the host is smooth and they\u2019re always available for any question. The area is very quiet with plenty of options to eat or shop.',
    },
    source: 'Airbnb',
  },
  {
    author: 'Maria Alejandra',
    rating: 5,
    date: '2025-10-01',
    text: {
      es: 'Mi estadía en el departamento de Fabrizio fue excelente. Desde el primer momento fue muy atento, amable y siempre estuvo disponible para cualquier consulta. El departamento es tal como se muestra en las fotos: cómodo, limpio, con una vista espectacular al mar y bien ubicado. Se nota el cuidado en cada detalle para que uno se sienta como en casa. ¡Recomiendo totalmente hospedarme con él y sin duda volvería a quedarme allí!',
      en: 'My stay at Fabrizio\u2019s apartment was excellent. From the very first moment he was attentive, kind and always available for any question. The apartment is exactly as shown in the photos: comfortable, clean, with a spectacular ocean view and a great location. You can tell every detail is cared for so you feel right at home. I totally recommend staying with him and would definitely stay there again!',
    },
    source: 'Airbnb',
  },
];
