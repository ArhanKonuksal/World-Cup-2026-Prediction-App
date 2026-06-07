import type { BracketMatch, Team } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { BracketThirdPlace, BracketTreeView } from './BracketTreeView';
import type { BracketRoundLabels } from './BracketTreeView';
import { ChampionReveal } from './ChampionReveal';

interface BracketExportCardProps {
  userName: string;
  titleLine: string;
  eyebrow: string;
  generatedLabel: string;
  footerCredit: string;
  matches: BracketMatch[];
  labels: BracketRoundLabels;
  champion: Team | null;
}

export function BracketExportCard({
  userName,
  titleLine,
  eyebrow,
  generatedLabel,
  footerCredit,
  matches,
  labels,
  champion,
}: BracketExportCardProps) {
  const { locale } = useLanguage();
  const displayName = userName.trim() || '—';
  const thirdPlace = matches.find((m) => m.round === 'Match for third place');

  return (
    <div className="export-card">
      <header className="export-card-header">
        <div className="export-card-brand">
          <div className="export-wc-mark" aria-hidden>
            26
          </div>
          <div className="export-card-heading">
            <p className="export-eyebrow">{eyebrow}</p>
            <h2 className="export-title">
              <span className="export-title-name">{displayName}</span>
              <span className="export-title-sub">{titleLine}</span>
            </h2>
          </div>
        </div>
      </header>

      <div className="export-card-body">
        <div className="export-bracket-wrap">
          <BracketTreeView
            matches={matches}
            labels={labels}
            staticMode
            showMatchIds={false}
            hideThirdPlace
            className="export-bracket-tree"
          />
        </div>

        {(thirdPlace || champion) && (
          <div className="export-outcomes-row">
            {thirdPlace && (
              <BracketThirdPlace
                match={thirdPlace}
                labels={labels}
                staticMode
                showMatchIds={false}
                locale={locale}
                className="export-third-place"
              />
            )}
            {champion && (
              <ChampionReveal
                champion={champion}
                label={labels.champion}
                variant="export"
              />
            )}
          </div>
        )}
      </div>

      <footer className="export-card-footer">
        <span>{generatedLabel}</span>
        <span>{footerCredit}</span>
      </footer>
    </div>
  );
}
