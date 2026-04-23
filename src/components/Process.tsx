
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

const processList: Array<{ number: string; titleKey: TranslationKey; descKey: TranslationKey }> = [
  { number: '01', titleKey: 'process.01.title', descKey: 'process.01.desc' },
  { number: '02', titleKey: 'process.02.title', descKey: 'process.02.desc' },
  { number: '03', titleKey: 'process.03.title', descKey: 'process.03.desc' },
  { number: '04', titleKey: 'process.04.title', descKey: 'process.04.desc' },
];

const Process = () => {
  const { t } = useLanguage();
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('proceso');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
          setLineWidth(100);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="proceso" className="py-20 md:py-24 bg-white anchor-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-dark-gray">{t('process.heading')}</h2>
          <p className="text-lg md:text-xl text-medium-gray max-w-3xl mx-auto">
            {t('process.subtitle')}
          </p>
        </div>
        
        <div className="relative">
          {/* Animated connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[3px] bg-key-green/30 -translate-y-1/2">
            <div 
              className="h-full bg-key-green transition-all duration-1000 ease-out"
              style={{ width: `${lineWidth}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processList.map((process, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center h-full border border-key-green border-opacity-10 hover:border-opacity-30 transition-all shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-key-green flex items-center justify-center mb-4 text-dark-gray font-semibold relative z-10">
                    {process.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-dark-gray">{t(process.titleKey)}</h3>
                  <p className="text-medium-gray">{t(process.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
