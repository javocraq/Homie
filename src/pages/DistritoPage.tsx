import React from 'react';
import Seo from '../components/Seo';
import PageShell from '../components/PageShell';
import Breadcrumbs, { breadcrumbJsonLd } from '../components/Breadcrumbs';
import type { DistritoContent } from '../data/distritos';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactModal } from '../components/ContactModalProvider';

const DistritoPage: React.FC<{ data: DistritoContent }> = ({ data }) => {
  const { lang, t } = useLanguage();
  const { open: openContactModal } = useContactModal();
  const url = `https://homiebnb.com/administracion-airbnb-${data.slug}`;
  const crumbs = [
    { label: t('crumbs.home'), to: '/' },
    { label: t('distrito.crumb'), to: '/' },
    { label: data.nombre },
  ];

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `${t('distrito.h1Prefix')} ${data.nombre}`,
    name: `${t('distrito.h1Prefix')} ${data.nombre} — Homie`,
    description: data.metaDescription[lang],
    provider: { '@id': 'https://homiebnb.com/#organization' },
    areaServed: {
      '@type': 'City',
      name: data.nombre,
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Lima, Perú' },
    },
    url,
  };

  return (
    <PageShell tone="light">
      <Seo
        title={data.titulo[lang]}
        description={data.metaDescription[lang]}
        canonical={url}
        jsonLd={[serviceJsonLd, breadcrumbJsonLd(crumbs)]}
      />
      <Breadcrumbs crumbs={crumbs} />

      <article>
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-dark-gray">
          {t('distrito.h1Prefix')} {data.nombre}
        </h1>

        <p className="text-lg text-dark-gray/75 leading-relaxed mb-8">{data.intro[lang]}</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-dark-gray">{t('distrito.h.guest')} {data.nombre}</h2>
          <ul className="list-disc pl-6 space-y-2 text-dark-gray/75">
            {data.perfilHuesped[lang].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-dark-gray">{t('distrito.h.strengths')} {data.nombre}</h2>
          <ul className="list-disc pl-6 space-y-2 text-dark-gray/75">
            {data.fortalezas[lang].map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-dark-gray">{t('distrito.h.challenges')}</h2>
          <ul className="list-disc pl-6 space-y-2 text-dark-gray/75">
            {data.retos[lang].map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>

        <section className="mb-10 p-6 bg-[#F7F7F7] border border-dark-gray/[0.08] rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-dark-gray">{t('distrito.h.tip')}</h2>
          <p className="text-dark-gray/75">{data.tipNocturno[lang]}</p>
        </section>

        <section className="mb-10">
          <p className="text-dark-gray/75 leading-relaxed">{data.cierre[lang]}</p>
        </section>

        <div className="mt-10">
          <button type="button" onClick={openContactModal} className="btn-primary">
            {t('distrito.cta')} {data.nombre}
          </button>
        </div>
      </article>
    </PageShell>
  );
};

export default DistritoPage;
