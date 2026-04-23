
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactModal } from './ContactModalProvider';

const Hero = () => {
  const { t } = useLanguage();
  const { open: openContactModal } = useContactModal();

  return (
    <section className="relative min-h-screen flex items-center py-24 bg-radial-gradient overflow-hidden">
      {/* BG Video would be here in a production environment - using image placeholder for now */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-gray/55 to-dark-gray/55"></div>
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=70"
          alt={t('hero.imageAlt')}
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Key glow effect - enhanced */}
      <div className="absolute right-1/3 top-1/2 w-[300px] h-[300px] bg-key-green rounded-full blur-[50px] opacity-25"></div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.35] tracking-[-0.02em] mb-7">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            {t('hero.tagline')}
          </p>
          <button
            onClick={openContactModal}
            className="btn-primary text-lg"
          >
            {t('hero.cta')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
