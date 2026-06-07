import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';
import { updateDocumentMeta } from '../lib/documentMeta';

const STORAGE_KEY = 'wc2026-locale';

interface LanguageContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'tr';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    updateDocumentMeta(locale);
  }, [locale]);

  const toggleLocale = () => setLocale((l) => (l === 'tr' ? 'en' : 'tr'));

  const t = (key: TranslationKey) => translations[locale][key];

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
