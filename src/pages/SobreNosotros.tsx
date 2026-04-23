import React from 'react';
import Seo from '../components/Seo';
import PageShell from '../components/PageShell';
import Breadcrumbs, { breadcrumbJsonLd } from '../components/Breadcrumbs';
import { useLanguage } from '../i18n/LanguageContext';

const renderWithBold = (s: string) => {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
  );
};

const SobreNosotros = () => {
  const { t } = useLanguage();
  const crumbs = [
    { label: t('crumbs.home'), to: '/' },
    { label: t('sobre.crumb') },
  ];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: 'https://homiebnb.com/sobre-nosotros',
    name: 'Sobre Homie Perú',
    mainEntity: { '@id': 'https://homiebnb.com/#organization' },
  };

  return (
    <PageShell>
      <Seo
        title={t('sobre.seoTitle')}
        description={t('sobre.seoDesc')}
        canonical="https://homiebnb.com/sobre-nosotros"
        jsonLd={[aboutJsonLd, breadcrumbJsonLd(crumbs)]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">{t('sobre.title')}</h1>

      <section className="space-y-6 text-gray-200 leading-relaxed">
        <p className="text-lg">{renderWithBold(t('sobre.intro'))}</p>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-white">{t('sobre.why.h')}</h2>
          <p>{t('sobre.why.p')}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-white">{t('sobre.how.h')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{renderWithBold(t('sobre.how.1'))}</li>
            <li>{renderWithBold(t('sobre.how.2'))}</li>
            <li>{renderWithBold(t('sobre.how.3'))}</li>
            <li>{renderWithBold(t('sobre.how.4'))}</li>
            <li>{renderWithBold(t('sobre.how.5'))}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-white">{t('sobre.numbers.h')}</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('sobre.numbers.1')}</li>
            <li>{t('sobre.numbers.2')}</li>
            <li>{t('sobre.numbers.3')}</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
};

export default SobreNosotros;
