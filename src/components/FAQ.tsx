
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

const faqList: Array<{ qKey: TranslationKey; aKey: TranslationKey }> = [
  { qKey: 'faq.q1.q', aKey: 'faq.q1.a' },
  { qKey: 'faq.q2.q', aKey: 'faq.q2.a' },
  { qKey: 'faq.q3.q', aKey: 'faq.q3.a' },
  { qKey: 'faq.q4.q', aKey: 'faq.q4.a' },
  { qKey: 'faq.q5.q', aKey: 'faq.q5.a' },
  { qKey: 'faq.q6.q', aKey: 'faq.q6.a' },
];

const FAQ = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-24 bg-[#FFFFFF] anchor-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-dark-gray">{t('faq.heading')}</h2>
          <p className="text-lg md:text-xl text-medium-gray max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqList.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full text-left p-5 rounded-lg flex justify-between items-center transition-colors border ${
                  activeIndex === index
                    ? 'bg-key-green/10 border-key-green/30'
                    : 'bg-[#F7F7F7] border-dark-gray/[0.08] hover:bg-[#F0F0F0]'
                }`}
              >
                <span className="font-medium text-dark-gray">{t(faq.qKey)}</span>
                {activeIndex === index ? (
                  <ChevronUp className="text-key-green" size={20} />
                ) : (
                  <ChevronDown className="text-key-green" size={20} />
                )}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-5 text-dark-gray/75 bg-[#F7F7F7] rounded-b-lg">
                  {t(faq.aKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
