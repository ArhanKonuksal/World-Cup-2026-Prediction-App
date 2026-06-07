import type { GroupId, GroupState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getThirdPlaceTeams } from '../lib/bracketResolver';
import { getTeamDisplayName } from '../lib/teamDisplayName';

interface ThirdPlacePickerProps {
  groups: GroupState[];
  groupOrder: Record<GroupId, string[]>;
  selected: GroupId[];
  invalidCombo?: boolean;
  onToggle: (groupId: GroupId) => void;
}

export function ThirdPlacePicker({
  groups,
  groupOrder,
  selected,
  invalidCombo = false,
  onToggle,
}: ThirdPlacePickerProps) {
  const { t, locale } = useLanguage();
  const thirdPlaces = getThirdPlaceTeams(groups, groupOrder);
  const count = selected.length;
  const ready = count === 8 && !invalidCombo;

  return (
    <section className={`panel third-panel ${ready ? 'is-ready' : 'is-pending'}`}>
      <div className="panel-head">
        <div>
          <h2>{t('thirdPlaceTitle')}</h2>
          <p>
            <strong className="count-pill">{count} / 8</strong> {t('thirdPlaceHint')}
          </p>
        </div>
      </div>

      <div className="third-grid">
        {thirdPlaces.map(({ group, team }) => {
          const isSelected = selected.includes(group);
          const disabled = !isSelected && count >= 8;

          return (
            <button
              key={group}
              type="button"
              className={`third-card ${isSelected ? 'is-selected' : ''}`}
              disabled={disabled}
              onClick={() => onToggle(group)}
            >
              <span className="third-group">{t('group')} {group}</span>
              <span className="third-team">
                <span className="flag">{team.flag}</span>
                <span>{getTeamDisplayName(team.name, locale)}</span>
              </span>
              <span className="third-action">
                {isSelected ? t('thirdQualified') : t('thirdSelect')}
              </span>
            </button>
          );
        })}
      </div>

      {!ready && count < 8 && <p className="notice notice-warn">{t('thirdWarning')}</p>}
      {count === 8 && invalidCombo && (
        <p className="notice notice-warn">{t('thirdInvalidCombo')}</p>
      )}
    </section>
  );
}
