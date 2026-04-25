import React from 'react';
import Seo from '../components/Seo';
import PageShell from '../components/PageShell';
import Breadcrumbs, { breadcrumbJsonLd } from '../components/Breadcrumbs';
import { useLanguage } from '../i18n/LanguageContext';

type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'h3'; text: string };

type Section = { id: string; num: number; title: string; blocks: Block[] };

const sections: Section[] = [
  {
    id: 'definiciones',
    num: 1,
    title: 'Definiciones',
    blocks: [
      { type: 'p', text: 'Para efectos de estos Términos, los siguientes conceptos tendrán el significado que se les asigna a continuación:' },
      {
        type: 'ul',
        items: [
          '**Homie:** empresa administradora de propiedades que presta el Servicio descrito en la Sección 3.',
          '**Sitio:** los dominios homiebnb.com y homiebnb.com, incluyendo todas sus subpáginas, formularios y canales asociados.',
          '**Servicio:** conjunto de servicios descritos en la Sección 3 de estos Términos, incluyendo la administración integral de inmuebles, el hospedaje temporal y los servicios complementarios.',
          '**Propietario u "Owner":** persona natural o jurídica titular de un inmueble (o con autorización expresa del titular) que contrata a Homie para la administración del mismo.',
          '**Huésped o "Guest":** persona natural o jurídica que reserva y ocupa temporalmente un inmueble administrado por Homie.',
          '**Inmueble:** departamento amoblado u otra unidad habitacional entregada por el Propietario a Homie para su administración bajo estos Términos.',
          '**Plataformas OTA:** agencias de viaje en línea y plataformas de alquiler temporal tales como Airbnb, Booking, VRBO y similares, en las que Homie publica los inmuebles.',
          '**Contrato de Administración:** acuerdo escrito suscrito entre Homie y el Propietario por el cual se regula la prestación del Servicio de administración, complementario a estos Términos.',
          '**Reglamento de Hospedaje:** conjunto de reglas aplicables al Huésped durante su estadía, aceptadas al momento de la reserva.',
        ],
      },
    ],
  },
  {
    id: 'condiciones-de-acceso',
    num: 2,
    title: 'Condiciones de acceso al Sitio',
    blocks: [
      { type: 'h3', text: '2.1. Capacidad legal' },
      { type: 'p', text: 'Para acceder al Sitio o contratar el Servicio, debes ser mayor de edad conforme a la legislación peruana (18 años) o contar con autorización válida de tu representante legal. Si contratas en nombre de una persona jurídica, declaras contar con facultades suficientes para obligarla.' },
      { type: 'h3', text: '2.2. Uso permitido' },
      { type: 'p', text: 'El Sitio y el Servicio solo pueden utilizarse para fines lícitos y conforme a estos Términos. Queda expresamente prohibido:' },
      {
        type: 'ul',
        items: [
          'Cargar, transmitir o introducir virus, malware, scripts maliciosos o cualquier código destinado a alterar el funcionamiento del Sitio.',
          'Realizar scraping masivo, ingeniería inversa o intentos de acceso no autorizado a los sistemas de Homie.',
          'Suplantar la identidad de terceros o proporcionar información falsa, inexacta o engañosa.',
          'Utilizar el Sitio para infringir derechos de propiedad intelectual, industrial o de imagen de terceros.',
          'Usar el Servicio para actividades ilegales, incluyendo pero no limitadas a: explotación sexual (con especial énfasis en la prohibición absoluta de cualquier forma de explotación sexual infantil o adolescente, de conformidad con la Ley N.° 28251 y normas conexas), tráfico ilícito, lavado de activos o financiamiento del terrorismo.',
        ],
      },
      { type: 'h3', text: '2.3. Suspensión por incumplimiento' },
      { type: 'p', text: 'Homie podrá suspender o cancelar el acceso al Sitio y/o el Servicio, de forma inmediata y sin derecho a reembolso, ante cualquier incumplimiento de estos Términos, sin perjuicio de las acciones legales que correspondan.' },
    ],
  },
  {
    id: 'descripcion-del-servicio',
    num: 3,
    title: 'Descripción del Servicio',
    blocks: [
      { type: 'p', text: 'Homie es una empresa peruana dedicada a la administración profesional de propiedades amobladas para alquiler de corta estadía, así como a la prestación de servicios de hospedaje temporal. El Servicio se estructura en dos líneas principales:' },
      { type: 'h3', text: '3.1. Servicios al Propietario' },
      { type: 'p', text: 'Bajo la modalidad de mandato con representación, Homie gestiona el inmueble en nombre del Propietario e incluye, de forma enunciativa y no limitativa:' },
      {
        type: 'ul',
        items: [
          'Evaluación previa del inmueble y recomendaciones de amoblado o diseño.',
          'Fotografía profesional y creación u optimización del anuncio en Plataformas OTA.',
          'Gestión multi-plataforma con pricing dinámico.',
          'Atención de consultas, confirmación de reservas, cobros y aplicación de políticas de cancelación.',
          'Coordinación de check-in y check-out, incluida la articulación con la recepción del edificio cuando corresponda.',
          'Servicios operativos: limpieza entre estadías, reposición de lencería hotelera, coordinación de mantenimiento y atención al huésped 24/7.',
          'Registro y reporte de incidencias documentadas con evidencia fotográfica.',
          'Liquidación mensual al Propietario con reporte de ingresos, ocupación y gastos deducibles.',
          'Facturación a huéspedes o empresas cuando así se requiera y sea legalmente viable conforme a la normativa SUNAT.',
        ],
      },
      { type: 'h3', text: '3.2. Servicios al Huésped' },
      { type: 'p', text: 'Homie ofrece alojamiento temporal en inmuebles amoblados y los siguientes servicios complementarios:' },
      {
        type: 'ul',
        items: [
          'Entrega del inmueble con inventario completo (menaje, electrodomésticos, lencería, Wi-Fi, TV, entre otros).',
          'Instrucciones de ingreso mediante chapa digital o coordinación directa con la recepción del edificio.',
          'Soporte al huésped durante la estadía (consultas, emergencias, fallas técnicas).',
          'Guías locales ("Homie Guide"), recomendaciones gastronómicas y alianzas con establecimientos locales.',
          'Servicios opcionales de pago (traslados, tours, limpieza extra, entre otros), sujetos a disponibilidad y tarifa vigente.',
        ],
      },
      { type: 'h3', text: '3.3. Naturaleza jurídica' },
      { type: 'p', text: 'Se deja expresamente establecido que: (i) la relación entre Homie y el Propietario es de administración o mandato con representación, no constituyendo arrendamiento de Homie sobre el inmueble; y (ii) la relación entre Homie y el Huésped es de hospedaje temporal, no constituyendo un contrato de arrendamiento urbano ni generando derechos posesorios sobre el inmueble.' },
    ],
  },
  {
    id: 'condiciones-propietario',
    num: 4,
    title: 'Condiciones aplicables al Propietario',
    blocks: [
      { type: 'h3', text: '4.1. Contratación y vigencia' },
      { type: 'p', text: 'La contratación del Servicio se formaliza mediante la suscripción de un Contrato de Administración, el cual tendrá una duración mínima inicial de tres (3) meses, renovable automáticamente salvo comunicación en contrario por escrito con al menos treinta (30) días calendario de anticipación.' },
      { type: 'p', text: 'El Contrato de Administración se complementa con estos Términos y con el tarifario comercial vigente al momento de la suscripción.' },
      { type: 'h3', text: '4.2. Obligaciones del Propietario' },
      { type: 'p', text: 'El Propietario se obliga a:' },
      {
        type: 'ul',
        items: [
          'Ser titular legítimo del inmueble o contar con autorización expresa, suficiente y vigente del titular para entregarlo en administración.',
          'Proporcionar información veraz, completa y actualizada del inmueble y de su titularidad (título de propiedad, DNI o CE/RUC, permisos municipales aplicables, partida registral, inventario, entre otros).',
          'Entregar el inmueble en las condiciones pactadas: amoblado, con servicios activos (agua, luz, gas, internet) y libre de vicios ocultos que impidan su normal explotación.',
          'Verificar y cumplir con el Reglamento Interno de Propiedad Horizontal del edificio, así como con cualquier restricción vigente respecto del alquiler temporal o de corta estadía dispuesta por la junta de propietarios o por la municipalidad distrital.',
          'Mantener al día los pagos de mantenimiento común, servicios públicos y tributos municipales asociados al inmueble.',
          'Contar, en la medida de lo recomendable, con un seguro vigente del inmueble que cubra daños a terceros.',
          'Respetar la exclusividad comercial durante la vigencia del Contrato de Administración, absteniéndose de publicar el inmueble directamente en Plataformas OTA o contratar con administradores competidores respecto del mismo periodo.',
        ],
      },
      { type: 'h3', text: '4.3. Obligaciones de Homie' },
      { type: 'p', text: 'Homie se obliga a:' },
      {
        type: 'ul',
        items: [
          'Prestar el Servicio con diligencia profesional y conforme a los estándares del mercado de administración de propiedades.',
          'Publicar y promocionar el inmueble en las Plataformas OTA acordadas.',
          'Entregar una liquidación mensual transparente con el detalle de ingresos, ocupación y gastos deducibles.',
          'Guardar confidencialidad respecto de los datos personales, comerciales y financieros del Propietario, conforme a la Política de Privacidad.',
          'Registrar y reportar incidencias relevantes con evidencia fotográfica.',
        ],
      },
      { type: 'h3', text: '4.4. Comisiones y tarifas' },
      { type: 'p', text: 'Homie percibirá una comisión por la administración del inmueble, calculada como porcentaje sobre los ingresos brutos efectivamente generados por el alquiler, conforme al porcentaje pactado en el Contrato de Administración. Adicionalmente, podrán aplicarse tarifas por servicios de puesta en marcha (onboarding), fotografía profesional, instalación de chapa digital, limpieza y otros servicios complementarios, los cuales serán informados previamente al Propietario.' },
      { type: 'p', text: 'Homie podrá modificar sus tarifas dando aviso previo de al menos treinta (30) días calendario. Si el Propietario no acepta las nuevas condiciones, podrá dar por terminado el Contrato de Administración sin penalidad, debiendo honrar las reservas ya confirmadas.' },
      { type: 'h3', text: '4.5. Liquidación y pagos' },
      { type: 'p', text: 'La liquidación al Propietario se realizará mensualmente, dentro de los primeros diez (10) días hábiles del mes siguiente, mediante transferencia bancaria a la cuenta informada por el Propietario. Homie podrá deducir de la liquidación las comisiones pactadas, los gastos operativos autorizados (limpieza, lavandería, mantenimiento menor) y los tributos aplicables.' },
      { type: 'h3', text: '4.6. Responsabilidad por daños al inmueble' },
      { type: 'p', text: 'Homie hará sus mejores esfuerzos para prevenir, documentar y recuperar económicamente los daños causados por el Huésped. Cuando los daños sean atribuibles al Huésped, Homie gestionará el cobro correspondiente ante este o ante la Plataforma OTA que aplique, siguiendo sus procedimientos de reclamo. Homie no responde por el deterioro natural del inmueble ni por daños derivados de defectos preexistentes.' },
      { type: 'h3', text: '4.7. Terminación anticipada' },
      { type: 'p', text: 'Cualquiera de las partes podrá resolver el Contrato de Administración por incumplimiento grave de la otra parte, previa comunicación escrita con un plazo de subsanación de quince (15) días calendario. La terminación anticipada sin causa por parte del Propietario durante el plazo mínimo inicial generará la penalidad pactada en el Contrato de Administración y no eximirá del pago de las obligaciones devengadas.' },
    ],
  },
  {
    id: 'condiciones-huesped',
    num: 5,
    title: 'Condiciones aplicables al Huésped',
    blocks: [
      { type: 'h3', text: '5.1. Reserva y pago' },
      { type: 'p', text: 'La reserva del inmueble se perfecciona al momento de la confirmación por parte de Homie o de la Plataforma OTA correspondiente, y previo pago total o parcial según la política del canal de reserva. Para reservas directas, Homie podrá solicitar un depósito en garantía o bloqueo preventivo de tarjeta por daños.' },
      { type: 'h3', text: '5.2. Reglamento de hospedaje (reglas de la casa)' },
      { type: 'p', text: 'Durante la estadía, el Huésped se obliga a:' },
      {
        type: 'ul',
        items: [
          'Respetar el número máximo de ocupantes declarado en la reserva. El ingreso de personas adicionales no autorizadas dará lugar a un cargo adicional o a la terminación anticipada de la estadía sin reembolso.',
          'Cumplir el Reglamento Interno del edificio, los horarios de silencio y las normas de convivencia.',
          'Abstenerse de organizar fiestas, eventos o reuniones que excedan la ocupación autorizada, así como de generar ruidos molestos.',
          'No fumar dentro del inmueble. El incumplimiento generará un cargo por limpieza profunda de al menos quinientos soles (S/ 500.00) o su equivalente en dólares.',
          'Respetar la política de mascotas indicada en el anuncio del inmueble (permitidas, con restricciones o prohibidas). El ingreso no autorizado de mascotas generará un cargo equivalente a una noche adicional, sin perjuicio de los daños que correspondan.',
          'No subarrendar el inmueble ni ceder su uso a terceros distintos de los ocupantes registrados.',
          'Presentar documento de identidad válido (DNI o pasaporte) y, tratándose de huéspedes extranjeros, los documentos migratorios correspondientes.',
          'Usar los servicios (Wi-Fi, TV, electrodomésticos) de manera responsable y conforme a su destino.',
          'Devolver el inmueble en condiciones razonables de limpieza y con el inventario completo, al término de la estadía.',
        ],
      },
      { type: 'h3', text: '5.3. Check-in y check-out' },
      { type: 'p', text: 'Los horarios estándar son: check-in desde las 15:00 horas y check-out hasta las 11:00 horas, salvo que se haya pactado algo distinto. El late check-out o el early check-in están sujetos a disponibilidad y podrán generar una tarifa adicional.' },
      { type: 'h3', text: '5.4. Responsabilidad por daños y pérdidas' },
      { type: 'p', text: 'El Huésped es responsable económicamente por:' },
      {
        type: 'ul',
        items: [
          'Los daños causados al inmueble, a los bienes muebles, a los equipos o al edificio durante la estadía, ya sean atribuibles a él o a sus acompañantes y visitantes.',
          'La pérdida, deterioro o sustracción injustificada de bienes del inventario, incluida la lencería hotelera (sábanas, toallas, cubrecamas) y elementos decorativos. Cada ítem cuenta con un valor declarado que será cargado al Huésped.',
          'Las multas o sanciones impuestas por la junta de propietarios o la municipalidad como consecuencia de su conducta (fiestas, ruido excesivo, uso de áreas comunes no autorizadas).',
        ],
      },
      { type: 'p', text: 'Homie podrá aplicar el depósito en garantía, cobrar al medio de pago registrado o iniciar el reclamo correspondiente ante la Plataforma OTA, sin perjuicio de las acciones legales que correspondan.' },
      { type: 'h3', text: '5.5. Política de cancelación y reembolso' },
      { type: 'p', text: 'La política de cancelación se rige por el canal de reserva utilizado:' },
      {
        type: 'ul',
        items: [
          'Reservas realizadas a través de Plataformas OTA (Airbnb, Booking y similares): se aplicará la política de cancelación y reembolso publicada en la plataforma correspondiente al momento de la reserva.',
          'Reservas directas con Homie: salvo pacto distinto comunicado al momento de la reserva, aplica la siguiente política: cancelación con más de 30 días de anticipación al check-in otorga reembolso del 100%; entre 30 y 15 días, reembolso del 50%; con menos de 15 días, no habrá reembolso, salvo caso fortuito o fuerza mayor debidamente acreditados.',
        ],
      },
      { type: 'p', text: 'Los gastos administrativos y comisiones de pasarelas de pago no son reembolsables.' },
      { type: 'h3', text: '5.6. Cámaras de seguridad y privacidad' },
      { type: 'p', text: 'El Huésped declara conocer y aceptar que el edificio donde se ubica el inmueble puede contar con cámaras de seguridad en áreas comunes (ingresos, pasillos, estacionamientos). Homie no instala cámaras dentro del inmueble. El tratamiento de las imágenes captadas por el edificio es responsabilidad de la administración del mismo.' },
      { type: 'h3', text: '5.7. Uso de imagen' },
      { type: 'p', text: 'El Huésped podrá publicar o consentir la publicación de imágenes del inmueble con fines promocionales por parte de Homie únicamente mediante autorización expresa. Homie no utilizará imágenes personales del Huésped con fines publicitarios sin su consentimiento.' },
    ],
  },
  {
    id: 'herramientas-terceros',
    num: 6,
    title: 'Herramientas y enlaces de terceros',
    blocks: [
      { type: 'p', text: 'El Sitio y el Servicio se apoyan en herramientas de terceros, entre las que se encuentran (sin que esta lista sea exhaustiva): Airbnb y otras Plataformas OTA, pasarelas de pago (Stripe, Culqi, Niubiz u otras), servicios de mensajería (WhatsApp Business, Meta), plataformas de gestión (Notion, YCloud) y proveedores de infraestructura en la nube. Estas herramientas se prestan "tal cual" y "según disponibilidad"; el uso que el Usuario haga de ellas está sujeto a sus propios términos.' },
      { type: 'p', text: 'Homie no será responsable por interrupciones, errores o daños derivados del uso de herramientas o servicios de terceros, sin perjuicio de las acciones que el Usuario pueda iniciar directamente frente al proveedor correspondiente.' },
    ],
  },
  {
    id: 'propiedad-intelectual',
    num: 7,
    title: 'Propiedad intelectual',
    blocks: [
      { type: 'p', text: 'Todos los contenidos del Sitio (textos, logotipos, marcas, fotografías, videos, diseños, guías, artículos de blog y software) son propiedad de Homie o se utilizan con licencia y están protegidos por las normas de propiedad intelectual aplicables. Queda prohibida su reproducción, distribución, modificación o explotación comercial sin autorización previa y por escrito de Homie.' },
      { type: 'p', text: 'El envío de comentarios, sugerencias o materiales por parte del Usuario no generará obligación de confidencialidad ni contraprestación, salvo pacto en contrario. Homie podrá utilizar dichas contribuciones para mejorar el Servicio.' },
    ],
  },
  {
    id: 'proteccion-datos',
    num: 8,
    title: 'Protección de datos personales',
    blocks: [
      { type: 'p', text: 'El tratamiento de los datos personales recolectados a través del Sitio y del Servicio se rige por la Política de Privacidad de Homie, la cual forma parte integrante de estos Términos. Homie cumple con lo dispuesto en la Ley N.° 29733 – Ley de Protección de Datos Personales, su reglamento y demás normas complementarias.' },
      { type: 'p', text: 'Entre otras, Homie trata datos para las siguientes finalidades: ejecución del Contrato de Administración y del contrato de hospedaje, atención al Usuario, facturación, cumplimiento de obligaciones legales y tributarias, prevención del fraude y, previo consentimiento expreso, envío de comunicaciones comerciales.' },
      { type: 'p', text: 'El Usuario podrá ejercer sus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) conforme al procedimiento descrito en la Política de Privacidad, escribiendo a contacto@homiebnb.com.' },
    ],
  },
  {
    id: 'libro-reclamaciones',
    num: 9,
    title: 'Libro de reclamaciones',
    blocks: [
      { type: 'p', text: 'De conformidad con el Código de Protección y Defensa del Consumidor (Ley N.° 29571), Homie pone a disposición de sus Huéspedes y Propietarios un Libro de Reclamaciones virtual, accesible desde el Sitio. Los reclamos serán atendidos dentro de los plazos legales aplicables.' },
    ],
  },
  {
    id: 'exoneracion-garantias',
    num: 10,
    title: 'Exoneración de garantías y limitación de responsabilidad',
    blocks: [
      { type: 'p', text: 'Homie presta el Servicio con la diligencia profesional exigible a un administrador especializado. No obstante, el Servicio se ofrece "tal cual" y "según disponibilidad", por lo que Homie no garantiza:' },
      {
        type: 'ul',
        items: [
          'Una tasa mínima de ocupación ni un nivel determinado de ingresos para el Propietario.',
          'La continuidad ininterrumpida de las Plataformas OTA, pasarelas de pago o herramientas de terceros.',
          'La ausencia total de errores tipográficos, fotográficos o de precios en el Sitio.',
        ],
      },
      { type: 'p', text: 'En la máxima medida permitida por la ley peruana, Homie no será responsable por daños indirectos, lucro cesante, pérdida de oportunidad, daño moral o daños punitivos derivados del uso del Sitio o del Servicio, salvo en los casos de dolo o culpa grave debidamente acreditados.' },
      { type: 'p', text: 'Si alguna jurisdicción no permite ciertas limitaciones, la responsabilidad de Homie se reducirá al máximo permitido por la ley aplicable. En todo caso, la responsabilidad máxima agregada de Homie frente al Usuario se limita al monto efectivamente pagado por el Usuario a Homie en los seis (6) meses anteriores al hecho generador del reclamo.' },
    ],
  },
  {
    id: 'indemnidad',
    num: 11,
    title: 'Indemnidad',
    blocks: [
      { type: 'p', text: 'El Usuario se compromete a mantener indemne a Homie, sus directores, accionistas, representantes, empleados, proveedores y aliados comerciales frente a cualquier reclamo, demanda, sanción o perjuicio (incluidos honorarios profesionales razonables) que se derive de: (i) el incumplimiento de estos Términos; (ii) la violación de derechos de terceros, incluidos derechos de propiedad intelectual y datos personales; (iii) el uso indebido del Sitio o del Servicio; o (iv) las infracciones cometidas por el Huésped durante su estadía.' },
    ],
  },
  {
    id: 'modificaciones',
    num: 12,
    title: 'Modificaciones al Sitio, al Servicio y a los Términos',
    blocks: [
      { type: 'p', text: 'Homie podrá modificar, suspender o discontinuar total o parcialmente el Sitio y funciones específicas del Servicio en cualquier momento, sin que ello genere responsabilidad alguna, siempre que tal modificación no afecte obligaciones ya devengadas frente al Usuario.' },
      { type: 'p', text: 'Homie podrá actualizar estos Términos en cualquier momento. La versión vigente estará siempre disponible en el Sitio, con indicación de la fecha de última actualización. Los cambios sustanciales serán comunicados por los canales habituales (correo electrónico o WhatsApp). El uso continuado del Sitio o del Servicio luego de la entrada en vigor de los cambios implica la aceptación de los nuevos Términos.' },
    ],
  },
  {
    id: 'comunicaciones',
    num: 13,
    title: 'Comunicaciones y consentimiento',
    blocks: [
      { type: 'p', text: 'El Usuario acepta recibir comunicaciones de Homie relacionadas con la ejecución del Servicio (transaccionales, administrativas y operativas) a través de correo electrónico, WhatsApp y los canales propios de las Plataformas OTA. Las comunicaciones con fines comerciales o promocionales requerirán consentimiento expreso separado y podrán ser revocadas en cualquier momento.' },
      { type: 'p', text: 'El Usuario reconoce que el canal WhatsApp se rige por las políticas de Meta, las cuales restringen el envío de mensajes fuera de la ventana de 24 horas a plantillas previamente aprobadas.' },
    ],
  },
  {
    id: 'errores',
    num: 14,
    title: 'Errores e inexactitudes',
    blocks: [
      { type: 'p', text: 'Homie podrá corregir errores tipográficos, inexactitudes u omisiones en el Sitio o en el Servicio (incluidos precios, disponibilidad y descripciones) en cualquier momento, incluso después de enviar confirmaciones. Ante errores manifiestos, Homie podrá cancelar la reserva afectada y reembolsar lo pagado, sin que ello constituya incumplimiento.' },
    ],
  },
  {
    id: 'fuerza-mayor',
    num: 15,
    title: 'Caso fortuito y fuerza mayor',
    blocks: [
      { type: 'p', text: 'Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando este se deba a caso fortuito o fuerza mayor, tales como (sin limitación): desastres naturales, pandemias, disturbios, actos gubernamentales, cortes generalizados de servicios públicos o ciberataques. La parte afectada deberá comunicar la situación a la otra parte tan pronto como sea razonablemente posible y adoptar las medidas para mitigar sus efectos.' },
    ],
  },
  {
    id: 'cesion',
    num: 16,
    title: 'Cesión',
    blocks: [
      { type: 'p', text: 'El Usuario no podrá ceder, total o parcialmente, los derechos u obligaciones derivados de estos Términos o del Contrato de Administración sin el consentimiento previo y por escrito de Homie. Homie podrá ceder su posición contractual a filiales, sucesoras o adquirentes de su negocio, debiendo comunicarlo al Usuario.' },
    ],
  },
  {
    id: 'divisibilidad',
    num: 17,
    title: 'Divisibilidad',
    blocks: [
      { type: 'p', text: 'Si alguna disposición de estos Términos fuese declarada inválida, nula o inexigible por autoridad competente, las demás disposiciones continuarán plenamente vigentes, y la disposición afectada será sustituida por otra que refleje en la mayor medida posible la intención original de las partes.' },
    ],
  },
  {
    id: 'rescision',
    num: 18,
    title: 'Rescisión',
    blocks: [
      { type: 'p', text: 'Homie podrá dar por terminado el acceso al Sitio y/o el Servicio, de forma inmediata y sin previo aviso, en caso de incumplimiento grave de estos Términos, fraude, uso indebido o cualquier conducta que ponga en riesgo a los Propietarios, Huéspedes o terceros. Las obligaciones devengadas con anterioridad a la terminación (en particular, los pagos pendientes) subsistirán.' },
    ],
  },
  {
    id: 'acuerdo-integro',
    num: 19,
    title: 'Acuerdo íntegro',
    blocks: [
      { type: 'p', text: 'Estos Términos, junto con el Contrato de Administración (cuando aplique), el Reglamento de Hospedaje, la Política de Privacidad, la Política de Cookies y el tarifario vigente, constituyen el acuerdo íntegro entre las partes respecto del Servicio y sustituyen cualquier comunicación, oferta o acuerdo previo sobre la misma materia.' },
    ],
  },
  {
    id: 'ley-aplicable',
    num: 20,
    title: 'Ley aplicable y jurisdicción',
    blocks: [
      { type: 'p', text: 'Estos Términos se rigen por las leyes de la República del Perú. Cualquier controversia que surja en relación con su interpretación, cumplimiento o resolución será sometida, en primer lugar, a negociación directa y de buena fe entre las partes por un plazo máximo de treinta (30) días calendario. De no alcanzarse un acuerdo, la controversia se someterá a la competencia exclusiva de los jueces y tribunales del distrito judicial de Lima Metropolitana, Cercado, salvo que las partes pacten por escrito someterse a arbitraje de derecho administrado por un centro de arbitraje de reconocido prestigio en Lima.' },
    ],
  },
  {
    id: 'contacto',
    num: 21,
    title: 'Contacto',
    blocks: [
      { type: 'p', text: 'Para cualquier consulta, reclamo, ejercicio de derechos ARCO o comunicación relacionada con estos Términos, el Usuario puede escribir a:' },
      {
        type: 'ul',
        items: [
          '**Correo electrónico:** contacto@homiebnb.com',
          '**WhatsApp Business:** el número oficial publicado en homiebnb.com',
          '**Sitio web:** https://homiebnb.com',
        ],
      },
    ],
  },
];

const renderRich = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="text-dark-gray">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const renderBlock = (block: Block, i: number) => {
  if (block.type === 'p') {
    return <p key={i} className="text-dark-gray/75 leading-relaxed mb-4">{renderRich(block.text)}</p>;
  }
  if (block.type === 'ul') {
    return (
      <ul key={i} className="list-disc pl-6 space-y-2 text-dark-gray/75 mb-4">
        {block.items.map((it, idx) => <li key={idx}>{renderRich(it)}</li>)}
      </ul>
    );
  }
  return <h3 key={i} className="text-lg font-semibold text-dark-gray mt-6 mb-2">{block.text}</h3>;
};

const Terminos = () => {
  const { t } = useLanguage();
  const crumbs = [
    { label: t('crumbs.home'), to: '/' },
    { label: t('term.crumb') },
  ];

  return (
    <PageShell tone="light">
      <Seo
        title={t('term.seoTitle')}
        description={t('term.seoDesc')}
        canonical="https://homiebnb.com/terminos"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <Breadcrumbs crumbs={crumbs} />

      <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-dark-gray">Términos y Condiciones de Uso</h1>
      <p className="text-dark-gray/55 mb-8">Homie</p>

      <section className="space-y-4 text-dark-gray/75 leading-relaxed mb-10">
        <p>
          El presente documento contiene los Términos y Condiciones (en adelante, los "Términos") que regulan el acceso y uso del sitio web homiebnb.com y homiebnb.com (en adelante, el "Sitio"), así como la contratación de los servicios de administración profesional de propiedades para alquiler de corta estadía y los servicios de hospedaje ofrecidos por Homie (en adelante, el "Servicio").
        </p>
        <p>
          En todo este documento, los términos "Homie", "nosotros", "nos" y "nuestro" se refieren a Homie, empresa peruana con domicilio en Lima, Perú, que opera bajo las marcas comerciales Homie y Homie BNB. Los términos "tú", "te", "usuario", según corresponda, se refieren a la persona natural o jurídica que accede al Sitio o contrata el Servicio.
        </p>
        <p>
          Al acceder al Sitio, crear una cuenta, enviar una solicitud, firmar un contrato de administración o realizar una reserva, declaras haber leído, entendido y aceptado estos Términos, así como la Política de Privacidad y la Política de Cookies que forman parte integrante de este documento. Si no estás de acuerdo con alguna disposición, te pedimos abstenerte de acceder al Sitio o contratar el Servicio.
        </p>
      </section>

      <nav
        aria-label="Índice de secciones"
        className="mb-12 p-6 rounded-xl bg-[#F7F7F7] border border-dark-gray/[0.08]"
      >
        <h2 className="text-xl font-semibold text-dark-gray mb-4">Índice</h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-none text-dark-gray/75">
          {sections.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="text-key-green font-medium shrink-0">{s.num}.</span>
              <a href={`#${s.id}`} className="hover:text-key-green hover:underline transition-colors">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-dark-gray mb-4">
              <span className="text-key-green mr-2">{s.num}.</span>
              {s.title}
            </h2>
            {s.blocks.map(renderBlock)}
          </section>
        ))}
      </div>

      <p className="text-dark-gray/70 leading-relaxed mt-12 pt-6 border-t border-dark-gray/10">
        Al marcar la casilla de aceptación al reservar, al firmar el Contrato de Administración o al continuar usando el Sitio y el Servicio, el Usuario confirma haber leído, entendido y aceptado estos Términos y Condiciones en su integridad.
      </p>
    </PageShell>
  );
};

export default Terminos;
