
import React from 'react';
import ContactForm from './ContactForm';
import { useLanguage } from '../i18n/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  return (
    <section id="contacto" className="py-20 md:py-24 bg-[#1E1E1E] anchor-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">{t('contact.heading')}</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
