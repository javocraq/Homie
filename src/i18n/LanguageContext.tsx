import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations, type TranslationKey } from './translations';

export type Language = 'es' | 'en';

type Ctx = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'homie-lang';

const detectInitial = (): Language => {
  if (typeof window === 'undefined') return 'es';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  const browser = window.navigator.language?.toLowerCase() || '';
  return browser.startsWith('en') ? 'en' : 'es';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'es-PE';
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setLangState(next);
  }, []);

  const t = useCallback<Ctx['t']>((key, vars) => {
    const dict = translations[lang] as Record<string, string>;
    const fallback = translations.es as Record<string, string>;
    let value = dict[key] ?? fallback[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
