import type { BracketMatch, GroupState } from '../types';
import { getTeamById } from '../lib/parseWorldCupData';
import { useLanguage } from '../i18n/LanguageContext';
import { BracketTreeView } from './BracketTreeView';
import { ChampionReveal } from './ChampionReveal';

interface KnockoutBracketProps {
  matches: BracketMatch[];
  groups: GroupState[];
  qualifiedCount: number;
  thirdPlaceValid?: boolean;
  championId?: string;
  onPickWinner: (matchNum: number, teamId: string, round: string) => void;
  onResetBracket: () => void;
}

export function KnockoutBracket({
  matches,
  groups,
  qualifiedCount,
  thirdPlaceValid = true,
  championId,
  onPickWinner,
  onResetBracket,
}: KnockoutBracketProps) {
  const { t } = useLanguage();
  const disabled = qualifiedCount !== 8 || !thirdPlaceValid;
  const champion = championId ? getTeamById(groups, championId) : null;

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

  return (
    <section className="panel knockout-panel">
      <div className="panel-head">
        <div>
          <h2>{t('knockout')}</h2>
          <p>{t('knockoutHint')}</p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            if (window.confirm(t('resetBracketConfirm'))) onResetBracket();
          }}
        >
          {t('resetBracket')}
        </button>
      </div>

      {disabled && (
        <p className="notice notice-warn">
          {qualifiedCount !== 8 ? t('knockoutDisabled') : t('thirdInvalidCombo')}
        </p>
      )}

      <div className="knockout-layout">
        <div className="knockout-bracket-col">
          <p className="bracket-scroll-hint">{t('scrollHint')}</p>
          <div className="bracket-viewport">
            <BracketTreeView
              matches={matches}
              labels={labels}
              disabled={disabled}
              onPickWinner={onPickWinner}
            />
          </div>
        </div>

        {!disabled && (
          <div className="champion-reveal-slot">
            {champion ? (
              <ChampionReveal champion={champion} label={t('champion')} />
            ) : (
              <div className="champion-reveal champion-reveal--pending" aria-hidden>
                <span className="champion-reveal-label">{t('champion')}</span>
                <div className="champion-reveal-body">
                  <span className="champion-reveal-flag">—</span>
                  <p className="champion-reveal-name">{t('championPick')}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
