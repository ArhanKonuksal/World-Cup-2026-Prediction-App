import type { Team } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getTeamDisplayName } from '../lib/teamDisplayName';

interface ChampionRevealProps {
  champion: Team;
  label: string;
  className?: string;
  variant?: 'panel' | 'export';
}

export function ChampionReveal({
  champion,
  label,
  className = '',
  variant = 'panel',
}: ChampionRevealProps) {
  const { locale } = useLanguage();
  const name = getTeamDisplayName(champion.name, locale);

  return (
    <aside
      className={`champion-reveal champion-reveal--${variant} ${className}`.trim()}
      aria-live="polite"
      aria-label={`${label}: ${name}`}
    >
      <span className="champion-reveal-label">{label}</span>
      <div className="champion-reveal-body">
        <span className="champion-reveal-flag" aria-hidden>
          {champion.flag}
        </span>
        <p className="champion-reveal-name">{name}</p>
      </div>
    </aside>
  );
}
