
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useLanguage } from '../i18n/LanguageContext';

const GraciasPage = () => {
  const { t } = useLanguage();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial-gradient p-4">
      <Seo
        title={t('gracias.seoTitle')}
        description={t('gracias.seoDesc')}
        canonical="https://homiebnb.com/gracias"
        noindex
      />
      <div className="text-center max-w-xl bg-dark-gray bg-opacity-90 p-8 md:p-12 rounded-xl border border-key-green border-opacity-20 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-key-green bg-opacity-10 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-key-green">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
          {t('gracias.title')}
        </h1>

        <p className="text-lg text-gray-300 mb-8">
          {t('gracias.body')}
        </p>

        <p className="text-md text-gray-400 mb-8">
          {t('gracias.whatsappPrompt')} <a href="https://wa.me/51912407529" className="text-key-green hover:underline">+51 912 407 529</a>
        </p>

        <Link to="/" className="btn-primary">
          {t('gracias.back')}
        </Link>
      </div>
    </div>
  );
};

export default GraciasPage;
