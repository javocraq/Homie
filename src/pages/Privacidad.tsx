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
    id: 'responsable',
    num: 1,
    title: 'Responsable del tratamiento',
    blocks: [
      { type: 'p', text: 'El responsable del tratamiento de los datos personales recolectados a través del Sitio y del Servicio es **Homie**, empresa peruana con domicilio en Lima, Perú, que opera bajo las marcas comerciales Homie y Homie BNB a través del dominio https://homiebnb.com (en adelante, "Homie", "nosotros").' },
      { type: 'p', text: 'La presente Política de Privacidad (la "Política") forma parte integrante de los Términos y Condiciones y describe cómo recolectamos, usamos, almacenamos y protegemos los datos personales de Propietarios, Huéspedes y visitantes del Sitio, de conformidad con la Ley N.° 29733 – Ley de Protección de Datos Personales, su Reglamento (D.S. N.° 003-2013-JUS) y demás normas complementarias de la República del Perú.' },
    ],
  },
  {
    id: 'definiciones',
    num: 2,
    title: 'Definiciones',
    blocks: [
      { type: 'p', text: 'Los términos con mayúscula inicial utilizados en esta Política tendrán el significado que se les asigna en los Términos y Condiciones, disponibles en https://homiebnb.com/terminos. De forma adicional:' },
      {
        type: 'ul',
        items: [
          '**Datos personales:** toda información sobre una persona natural que la identifica o la hace identificable (DNI, correo, teléfono, dirección, imagen, entre otros).',
          '**Titular:** persona natural a quien corresponden los datos personales tratados.',
          '**Tratamiento:** cualquier operación realizada sobre datos personales (recolección, registro, almacenamiento, uso, transferencia, supresión, entre otras).',
          '**Banco de datos personales:** conjunto organizado de datos personales que son objeto de tratamiento, automatizado o no, por parte de Homie.',
        ],
      },
    ],
  },
  {
    id: 'datos-recolectamos',
    num: 3,
    title: 'Datos que recolectamos',
    blocks: [
      { type: 'p', text: 'Homie recolecta datos personales directamente del Usuario, a través del Sitio, de las Plataformas OTA, de canales de mensajería y de los contratos suscritos. Según el tipo de Usuario, los datos pueden incluir:' },
      { type: 'h3', text: '3.1. Visitantes del Sitio' },
      {
        type: 'ul',
        items: [
          'Nombre, correo electrónico y teléfono enviados a través del formulario de contacto.',
          'Ubicación, tipo de propiedad, número de habitaciones, metraje, capacidad y demás datos declarados al solicitar una proyección de ingresos.',
          'Mensajes, consultas o comentarios que el Usuario decida compartir con Homie.',
          'Datos de navegación recolectados automáticamente: dirección IP, tipo de dispositivo, sistema operativo, navegador, páginas visitadas y origen del tráfico (vía cookies y herramientas analíticas).',
        ],
      },
      { type: 'h3', text: '3.2. Propietarios' },
      {
        type: 'ul',
        items: [
          'Nombre completo, documento de identidad (DNI, CE o pasaporte) o RUC, domicilio y datos de contacto.',
          'Información del inmueble: dirección, partida registral, título de propiedad o autorización del titular, inventario, fotografías y servicios asociados.',
          'Datos bancarios y financieros necesarios para la liquidación mensual y facturación.',
          'Correspondencia, reportes y documentos intercambiados durante la relación contractual.',
        ],
      },
      { type: 'h3', text: '3.3. Huéspedes' },
      {
        type: 'ul',
        items: [
          'Nombre completo, documento de identidad (DNI o pasaporte) y, tratándose de huéspedes extranjeros, datos migratorios aplicables.',
          'Correo electrónico, teléfono y datos de contacto de emergencia.',
          'Datos de la reserva: fechas, número de ocupantes, canal de reserva y preferencias declaradas.',
          'Información de pago gestionada por las pasarelas autorizadas (Homie no almacena en sus servidores los datos completos de tarjeta).',
        ],
      },
      { type: 'p', text: 'Homie no solicita datos sensibles (salud, origen racial, creencias, orientación sexual) salvo que sean estrictamente necesarios para la ejecución del Servicio, caso en el cual se requerirá consentimiento expreso del Titular.' },
    ],
  },
  {
    id: 'finalidades',
    num: 4,
    title: 'Finalidades del tratamiento',
    blocks: [
      { type: 'p', text: 'Los datos personales serán tratados por Homie para las siguientes finalidades:' },
      {
        type: 'ul',
        items: [
          'Responder consultas, elaborar proyecciones de ingresos y gestionar el proceso comercial previo a la contratación.',
          'Ejecutar el Contrato de Administración con el Propietario y el contrato de hospedaje con el Huésped, incluyendo la publicación del inmueble, la gestión de reservas y la atención 24/7.',
          'Procesar pagos, liquidaciones mensuales y emitir comprobantes conforme a la normativa SUNAT.',
          'Cumplir obligaciones legales, tributarias, contables y regulatorias.',
          'Prevenir el fraude, el lavado de activos y otras actividades ilícitas, y garantizar la seguridad del Sitio y del Servicio.',
          'Atender reclamos a través del Libro de Reclamaciones virtual y procedimientos conexos.',
          'Mejorar el Sitio, el Servicio y la experiencia del Usuario mediante análisis estadístico y métricas de uso.',
          'Previo consentimiento expreso, enviar comunicaciones comerciales, promociones, novedades y contenido relacionado con la administración de inmuebles.',
        ],
      },
    ],
  },
  {
    id: 'base-legal',
    num: 5,
    title: 'Base legal del tratamiento',
    blocks: [
      { type: 'p', text: 'El tratamiento de los datos personales se sustenta en alguna de las siguientes bases legales, según corresponda:' },
      {
        type: 'ul',
        items: [
          '**Consentimiento libre, previo, expreso, inequívoco e informado** otorgado por el Titular al completar formularios, marcar casillas de aceptación o aceptar comunicaciones comerciales.',
          '**Ejecución contractual:** tratamiento necesario para la celebración y cumplimiento del Contrato de Administración, el contrato de hospedaje o cualquier acuerdo suscrito con el Usuario.',
          '**Cumplimiento de obligaciones legales** de naturaleza tributaria, contable, regulatoria o judicial.',
          '**Interés legítimo** de Homie para garantizar la seguridad del Sitio, prevenir el fraude y mejorar el Servicio, siempre que no prevalezcan los derechos fundamentales del Titular.',
        ],
      },
    ],
  },
  {
    id: 'destinatarios',
    num: 6,
    title: 'Destinatarios y transferencias a terceros',
    blocks: [
      { type: 'p', text: 'Homie podrá compartir datos personales únicamente cuando sea necesario para la prestación del Servicio o por mandato legal, con los siguientes destinatarios:' },
      {
        type: 'ul',
        items: [
          '**Plataformas OTA** (Airbnb, Booking, VRBO y similares), para publicar anuncios, gestionar reservas, cobros y políticas de cancelación.',
          '**Pasarelas de pago** (Stripe, Culqi, Niubiz u otras), que procesan los pagos de huéspedes y las transferencias a propietarios conforme a sus propios términos y estándares PCI-DSS.',
          '**Servicios de mensajería** (WhatsApp Business, Meta), utilizados para la comunicación operativa y, previo consentimiento, comercial.',
          '**Plataformas internas de gestión** (Notion, YCloud u otras), empleadas para la administración del Servicio.',
          '**Proveedores de infraestructura en la nube, correo y analítica** (Google Analytics, Google Ads, Google Tag Manager, hosting y similares).',
          '**Autoridades competentes**, cuando medie requerimiento legal, judicial o administrativo válido.',
          '**Asesores legales, contables o auditores** que intervengan en el cumplimiento de obligaciones de Homie, bajo deber de confidencialidad.',
        ],
      },
      { type: 'p', text: 'Homie exige a sus proveedores la adopción de medidas técnicas y organizativas adecuadas para proteger los datos personales que les sean comunicados, en línea con la Ley N.° 29733.' },
    ],
  },
  {
    id: 'transferencias-internacionales',
    num: 7,
    title: 'Transferencias internacionales de datos',
    blocks: [
      { type: 'p', text: 'Algunos de los proveedores y Plataformas OTA con los que trabaja Homie están domiciliados fuera del Perú (por ejemplo, Estados Unidos, Irlanda o países de la Unión Europea). En consecuencia, los datos personales podrán ser objeto de transferencia internacional.' },
      { type: 'p', text: 'Homie adopta las garantías exigidas por la legislación peruana para dichas transferencias, incluyendo cláusulas contractuales de protección, evaluación del nivel de protección del país receptor y, cuando corresponda, el consentimiento expreso del Titular.' },
    ],
  },
  {
    id: 'conservacion',
    num: 8,
    title: 'Conservación de los datos',
    blocks: [
      { type: 'p', text: 'Homie conservará los datos personales únicamente durante el tiempo necesario para cumplir con las finalidades indicadas en esta Política y con las obligaciones legales que correspondan. De forma referencial:' },
      {
        type: 'ul',
        items: [
          'Datos de Propietarios y Huéspedes: durante la vigencia del Contrato de Administración o de la estadía y, posteriormente, por el plazo de prescripción de las acciones contractuales y tributarias aplicables.',
          'Datos de facturación y contables: por el plazo mínimo exigido por la normativa tributaria y contable del Perú.',
          'Datos de navegación y cookies: por el plazo indicado en la Sección 11 o hasta que el Usuario revoque su consentimiento.',
          'Datos utilizados con fines comerciales: hasta que el Titular revoque su consentimiento.',
        ],
      },
      { type: 'p', text: 'Transcurrido el plazo de conservación, los datos serán bloqueados y posteriormente suprimidos de forma segura, salvo que su conservación sea exigida por ley.' },
    ],
  },
  {
    id: 'seguridad',
    num: 9,
    title: 'Seguridad de la información',
    blocks: [
      { type: 'p', text: 'Homie implementa medidas técnicas, organizativas y legales razonables para proteger los datos personales frente a accesos no autorizados, pérdida, alteración o tratamiento indebido. Entre ellas, cifrado en tránsito (HTTPS/TLS), controles de acceso basados en roles, copias de respaldo, uso de proveedores con certificaciones de seguridad reconocidas y capacitación del personal con deber de confidencialidad.' },
      { type: 'p', text: 'No obstante, ninguna medida de seguridad es infalible. En caso de producirse un incidente de seguridad con impacto en datos personales, Homie actuará conforme al procedimiento de notificación previsto en la normativa aplicable.' },
    ],
  },
  {
    id: 'derechos-arco',
    num: 10,
    title: 'Derechos del Titular (ARCO)',
    blocks: [
      { type: 'p', text: 'De conformidad con la Ley N.° 29733 y su Reglamento, el Titular podrá ejercer en cualquier momento los siguientes derechos:' },
      {
        type: 'ul',
        items: [
          '**Acceso:** conocer qué datos personales trata Homie y las condiciones del tratamiento.',
          '**Rectificación:** solicitar la corrección de datos inexactos, incompletos o desactualizados.',
          '**Cancelación (supresión):** solicitar la eliminación de datos cuando el tratamiento ya no sea necesario o haya dejado de ser lícito.',
          '**Oposición:** oponerse al tratamiento por motivos legítimos, en los supuestos previstos por la ley.',
          '**Revocación del consentimiento:** retirar, en cualquier momento, el consentimiento otorgado, sin efectos retroactivos.',
          '**Información:** ser informado sobre las finalidades, destinatarios y plazos de conservación.',
        ],
      },
      { type: 'p', text: 'Para ejercer estos derechos, el Titular puede escribir a **contacto@homiebnb.com** adjuntando copia de su documento de identidad y una descripción clara de la solicitud. Homie atenderá la solicitud dentro de los plazos legales (20 días hábiles para acceso, 10 días hábiles para rectificación, cancelación y oposición, prorrogables conforme a ley).' },
      { type: 'p', text: 'Si el Titular considera que su solicitud no fue atendida adecuadamente, podrá acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos del Perú.' },
    ],
  },
  {
    id: 'cookies',
    num: 11,
    title: 'Cookies y tecnologías similares',
    blocks: [
      { type: 'p', text: 'El Sitio utiliza cookies propias y de terceros para mejorar la experiencia de navegación, analizar el uso del Sitio y, previo consentimiento, medir la efectividad de campañas publicitarias. Las principales categorías son:' },
      {
        type: 'ul',
        items: [
          '**Cookies técnicas o estrictamente necesarias:** imprescindibles para el funcionamiento del Sitio. No requieren consentimiento.',
          '**Cookies de preferencias:** almacenan elecciones del Usuario como el idioma (español / inglés) para personalizar la experiencia.',
          '**Cookies analíticas:** utilizadas por Google Analytics y Google Tag Manager para medir audiencia y mejorar el Sitio.',
          '**Cookies publicitarias:** utilizadas por Google Ads y similares para medir conversiones y mostrar publicidad relevante, sujeto a consentimiento del Usuario.',
        ],
      },
      { type: 'p', text: 'El Usuario puede configurar, aceptar o rechazar las cookies desde las opciones de su navegador. La desactivación de ciertas cookies puede afectar el correcto funcionamiento del Sitio.' },
    ],
  },
  {
    id: 'menores',
    num: 12,
    title: 'Menores de edad',
    blocks: [
      { type: 'p', text: 'El Sitio y el Servicio están dirigidos a personas mayores de 18 años. Homie no recolecta intencionalmente datos personales de menores de edad sin el consentimiento previo, expreso e informado de sus padres o representantes legales. Si se detecta que un menor ha proporcionado datos sin dicha autorización, los datos serán eliminados a la brevedad.' },
    ],
  },
  {
    id: 'modificaciones',
    num: 13,
    title: 'Modificaciones a la Política',
    blocks: [
      { type: 'p', text: 'Homie podrá actualizar la presente Política en cualquier momento para reflejar cambios normativos, operativos o tecnológicos. La versión vigente estará siempre disponible en https://homiebnb.com/privacidad. Los cambios sustanciales serán comunicados por los canales habituales (correo electrónico o WhatsApp). El uso continuado del Sitio o del Servicio luego de la entrada en vigor de los cambios implica la aceptación de la Política actualizada.' },
    ],
  },
  {
    id: 'contacto',
    num: 14,
    title: 'Contacto',
    blocks: [
      { type: 'p', text: 'Para cualquier consulta, reclamo o para ejercer los derechos ARCO, el Titular puede contactar a Homie a través de:' },
      {
        type: 'ul',
        items: [
          '**Correo electrónico:** contacto@homiebnb.com',
          '**WhatsApp Business:** el número oficial publicado en https://homiebnb.com',
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

const Privacidad = () => {
  const { t } = useLanguage();
  const crumbs = [
    { label: t('crumbs.home'), to: '/' },
    { label: t('priv.crumb') },
  ];

  return (
    <PageShell tone="light">
      <Seo
        title={t('priv.seoTitle')}
        description={t('priv.seoDesc')}
        canonical="https://homiebnb.com/privacidad"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <Breadcrumbs crumbs={crumbs} />

      <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-dark-gray">Política de Privacidad</h1>
      <p className="text-dark-gray/55 mb-8">Homie</p>

      <section className="space-y-4 text-dark-gray/75 leading-relaxed mb-10">
        <p>
          La presente Política de Privacidad (la "Política") describe cómo Homie recolecta, utiliza, almacena, comparte y protege los datos personales de quienes acceden al sitio web https://homiebnb.com (el "Sitio") o contratan los servicios de administración de propiedades y hospedaje ofrecidos por Homie (el "Servicio").
        </p>
        <p>
          Esta Política forma parte integrante de los Términos y Condiciones disponibles en https://homiebnb.com/terminos. Al acceder al Sitio, completar un formulario, reservar un inmueble o suscribir un Contrato de Administración, el Usuario declara haber leído y aceptado esta Política.
        </p>
        <p>
          Homie cumple con la Ley N.° 29733 – Ley de Protección de Datos Personales del Perú, su Reglamento (D.S. N.° 003-2013-JUS) y demás normas complementarias en materia de protección de datos personales.
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
        Al marcar la casilla de aceptación al reservar, al firmar el Contrato de Administración o al continuar usando el Sitio y el Servicio, el Usuario confirma haber leído, entendido y aceptado esta Política de Privacidad en su integridad.
      </p>
    </PageShell>
  );
};

export default Privacidad;
