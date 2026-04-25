import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export type Crumb = { label: string; to?: string };

const Breadcrumbs: React.FC<{ crumbs: Crumb[] }> = ({ crumbs }) => {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('crumbs.label')} className="text-sm text-light-gray mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.to ? (
              <Link to={c.to} className="hover:text-key-green transition-colors">{c.label}</Link>
            ) : (
              <span aria-current="page" className="text-dark-gray">{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span aria-hidden className="text-dark-gray/30">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: c.to ? `https://homiebnb.com${c.to}` : undefined,
  })),
});
