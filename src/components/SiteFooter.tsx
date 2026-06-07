import { useLanguage } from '../i18n/LanguageContext';

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-main">
          <div className="footer-line" aria-hidden />
          <p className="footer-name">{t('footer')}</p>
          <p className="footer-meta">
            {t('eyebrow')} · {t('footerTool')}
          </p>
          <p className="footer-disclaimer">{t('footerDisclaimer')}</p>
          <p className="footer-data">{t('footerData')}</p>
        </div>
        <a
          className="footer-portfolio-btn"
          href="https://arhan-konuksal.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('footerPortfolio')}
        </a>
      </div>
    </footer>
  );
}
