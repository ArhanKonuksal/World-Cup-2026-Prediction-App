import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import type { Locale } from '../i18n/translations';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
];

export function LanguagePicker() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="lang-picker" role="group" aria-label={t('languageLabel')}>
      {LOCALES.map(({ code, label }) => {
        const active = locale === code;
        return (
          <motion.button
            key={code}
            type="button"
            className={`lang-picker-btn ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            aria-label={code === 'tr' ? t('langTr') : t('langEn')}
            onClick={() => setLocale(code)}
            whileTap={{ scale: 0.97 }}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
