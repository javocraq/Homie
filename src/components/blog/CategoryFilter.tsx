import React from 'react';
import type { BlogCategory } from '../../types/blog';
import { useLanguage } from '../../i18n/LanguageContext';

type Props = {
  categories: BlogCategory[];
  active: string;
  onChange: (slug: string) => void;
};

const CategoryFilter: React.FC<Props> = ({ categories, active, onChange }) => {
  const { t } = useLanguage();
  const pill =
    'inline-flex items-center px-4 py-1.5 rounded-full text-[12.5px] font-medium tracking-[0.01em] whitespace-nowrap transition-colors duration-200 border';

  const all = [{ slug: 'all', name: t('blog.filter.all') }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <div
      role="tablist"
      aria-label={t('blog.filter.label')}
      className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none"
    >
      {all.map((c) => {
        const isActive = active === c.slug;
        return (
          <button
            key={c.slug}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.slug)}
            className={[
              pill,
              isActive
                ? 'bg-key-green text-dark-gray border-key-green'
                : 'bg-transparent text-medium-gray border-dark-gray/[0.12] hover:text-dark-gray hover:border-dark-gray/[0.3]',
            ].join(' ')}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
