import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguagePicker } from './LanguagePicker';

interface TopBarProps {
  onResetAll: () => void;
}

export function TopBar({ onResetAll }: TopBarProps) {
  const { t } = useLanguage();

  function handleResetAll() {
    if (window.confirm(t('resetAllConfirm'))) onResetAll();
  }

  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <span className="top-bar-mark">{t('navBrand')}</span>
        <div className="top-bar-actions">
          <LanguagePicker />
          <motion.button
            type="button"
            className="btn-text btn-text-muted"
            onClick={handleResetAll}
            whileTap={{ scale: 0.97 }}
          >
            {t('resetAll')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
