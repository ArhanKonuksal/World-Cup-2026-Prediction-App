import { useRef, useState } from 'react';
import type { BracketMatch, GroupState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getBracketProgress, isBracketComplete } from '../lib/bracketProgress';
import { downloadBracketImage } from '../lib/exportBracketImage';
import { getTeamById } from '../lib/parseWorldCupData';
import { BracketExportCard } from './BracketExportCard';

interface PredictionExportProps {
  matches: BracketMatch[];
  groups: GroupState[];
  winners: Record<number, string>;
  championId?: string;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export function PredictionExport({
  matches,
  groups,
  winners,
  championId,
  userName,
  onUserNameChange,
}: PredictionExportProps) {
  const { t, locale } = useLanguage();
  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = isBracketComplete(winners);
  const { picked, total } = getBracketProgress(winners);
  const finalWinnerId = matches.find((m) => m.round === 'Final')?.winnerId;
  const champion =
    (championId ? getTeamById(groups, championId) : null) ??
    (finalWinnerId ? getTeamById(groups, finalWinnerId) : null);

  const labels = {
    round32: t('round32'),
    round16: t('round16'),
    quarter: t('quarter'),
    semi: t('semi'),
    final: t('final'),
    thirdPlaceMatch: t('thirdPlaceMatch'),
    champion: t('champion'),
    matchLabel: t('matchLabel'),
  };

  const generatedAt = new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  async function handleDownload() {
    if (!exportRef.current || !userName.trim()) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadBracketImage(exportRef.current, userName.trim());
    } catch {
      setError(t('exportError'));
    } finally {
      setDownloading(false);
    }
  }

  if (!complete) {
    return (
      <section className="panel export-panel export-panel-pending">
        <div className="panel-head">
          <div>
            <h2>{t('exportTitle')}</h2>
            <p>{t('exportPending')}</p>
          </div>
        </div>
        <div className="export-progress-bar" role="progressbar" aria-valuenow={picked} aria-valuemax={total}>
          <div className="export-progress-fill" style={{ width: `${(picked / total) * 100}%` }} />
        </div>
        <p className="export-progress-text">
          {picked} / {total} {t('exportProgressMatches')}
        </p>
      </section>
    );
  }

  return (
    <section className="panel export-panel export-panel-ready">
      <div className="panel-head">
        <div>
          <h2>{t('exportTitle')}</h2>
          <p>{t('exportHint')}</p>
        </div>
      </div>

      <div className="export-form">
        <label className="export-name-field">
          <span>{t('exportNameLabel')}</span>
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder={t('exportNamePlaceholder')}
            maxLength={32}
            autoComplete="name"
          />
        </label>
        <button
          type="button"
          className="btn-export"
          disabled={!userName.trim() || downloading}
          onClick={handleDownload}
        >
          {downloading ? t('exportDownloading') : t('exportDownload')}
        </button>
      </div>

      {error && <p className="notice notice-warn">{error}</p>}

      <p className="export-preview-label">{t('exportPreview')}</p>
      <div className="export-preview-frame">
        <BracketExportCard
          userName={userName.trim() || t('exportNamePlaceholder')}
          titleLine={t('myPrediction')}
          eyebrow={t('eyebrow')}
          champion={champion ?? null}
          generatedLabel={`${t('exportGenerated')} ${generatedAt}`}
          footerCredit={t('footer')}
          matches={matches}
          labels={labels}
        />
      </div>

      {/* Off-screen clone for full-width PNG capture */}
      <div className="export-capture-host" aria-hidden>
        <div ref={exportRef}>
          <BracketExportCard
            userName={userName.trim() || t('exportNamePlaceholder')}
            titleLine={t('myPrediction')}
            eyebrow={t('eyebrow')}
            champion={champion ?? null}
            generatedLabel={`${t('exportGenerated')} ${generatedAt}`}
            footerCredit={t('footer')}
            matches={matches}
            labels={labels}
          />
        </div>
      </div>
    </section>
  );
}
