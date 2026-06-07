import { useRef } from 'react';
import type { BracketMatch } from '../types';
import { formatMatchLabel, type Locale } from '../i18n/translations';
import {
  QF_TO_SF,
  R16_TO_QF,
  R32_TO_R16,
  getBracketGridRows,
  getFinalGridPlacement,
} from '../lib/bracketTopology';
import { BracketConnectors } from './BracketConnectors';
import { useLanguage } from '../i18n/LanguageContext';
import { getTeamDisplayName } from '../lib/teamDisplayName';

export interface BracketRoundLabels {
  round32: string;
  round16: string;
  quarter: string;
  semi: string;
  final: string;
  thirdPlaceMatch: string;
  champion: string;
  matchLabel: string;
}

interface BracketTreeViewProps {
  matches: BracketMatch[];
  labels: BracketRoundLabels;
  disabled?: boolean;
  staticMode?: boolean;
  showMatchIds?: boolean;
  hideThirdPlace?: boolean;
  onPickWinner?: (matchNum: number, teamId: string, round: string) => void;
  className?: string;
}

interface BracketThirdPlaceProps {
  match: BracketMatch;
  labels: Pick<BracketRoundLabels, 'thirdPlaceMatch' | 'matchLabel'>;
  disabled?: boolean;
  staticMode?: boolean;
  showMatchIds?: boolean;
  locale: Locale;
  className?: string;
  onPickWinner?: (matchNum: number, teamId: string, round: string) => void;
}

export function BracketThirdPlace({
  match,
  labels,
  disabled = false,
  staticMode = false,
  showMatchIds = true,
  locale,
  className = '',
  onPickWinner,
}: BracketThirdPlaceProps) {
  return (
    <aside
      className={`bracket-third-standalone ${className}`.trim()}
      aria-label={labels.thirdPlaceMatch}
    >
      <h3 className="bracket-third-title">{labels.thirdPlaceMatch}</h3>
      <div className="bracket-third-card">
        <BracketMatchCell
          match={match}
          matchLabelTemplate={labels.matchLabel}
          disabled={disabled}
          staticMode={staticMode}
          showMatchIds={showMatchIds}
          locale={locale}
          variant="bronze"
          onPick={
            onPickWinner
              ? (teamId) => onPickWinner(match.num, teamId, match.round)
              : undefined
          }
        />
      </div>
    </aside>
  );
}

function BracketSlot({
  team,
  label,
  side,
  isWinner,
  canPick,
  staticMode,
  onPick,
  locale,
}: {
  team: BracketMatch['team1'];
  label: string;
  side: 'top' | 'bottom';
  isWinner: boolean;
  canPick: boolean;
  staticMode: boolean;
  onPick?: () => void;
  locale: Locale;
}) {
  const displayName = team ? getTeamDisplayName(team.name, locale) : null;
  if (!team) {
    return (
      <div className={`bracket-slot empty ${side}`}>
        <span className="slot-label">{label}</span>
      </div>
    );
  }

  if (staticMode) {
    return (
      <div className={`bracket-slot ${side} ${isWinner ? 'winner' : ''}`}>
        <span className="flag">{team.flag}</span>
        <span className="name">{displayName}</span>
        {isWinner && <span className="win-mark" aria-hidden>✓</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`bracket-slot ${side} ${isWinner ? 'winner' : ''} ${canPick ? 'clickable' : ''}`}
      disabled={!canPick}
      onClick={onPick}
    >
      <span className="flag">{team.flag}</span>
      <span className="name">{displayName}</span>
      {isWinner && <span className="win-mark" aria-hidden>✓</span>}
    </button>
  );
}

function BracketMatchCell({
  match,
  matchLabelTemplate,
  disabled,
  staticMode,
  showMatchIds,
  locale,
  onPick,
  variant = 'default',
}: {
  match: BracketMatch;
  matchLabelTemplate: string;
  disabled: boolean;
  staticMode: boolean;
  showMatchIds: boolean;
  locale: Locale;
  onPick?: (teamId: string) => void;
  variant?: 'default' | 'bronze';
}) {
  const renderSlot = (team: BracketMatch['team1'], label: string, side: 'top' | 'bottom') => {
    const isWinner = Boolean(team && match.winnerId === team.id);
    const canPick = !staticMode && !disabled && Boolean(team && match.team1 && match.team2);

    return (
      <BracketSlot
        team={team}
        label={label}
        side={side}
        isWinner={isWinner}
        canPick={canPick}
        staticMode={staticMode}
        onPick={onPick ? () => onPick(team!.id) : undefined}
        locale={locale}
      />
    );
  };

  return (
    <div
      className={`bracket-match${variant === 'bronze' ? ' bracket-match--bronze' : ''}`}
      data-num={match.num}
    >
      {showMatchIds && match.num > 0 && (
        <span className="bracket-match-label">
          {formatMatchLabel(matchLabelTemplate, match.num)}
        </span>
      )}
      <div className="bracket-match-inner">
        {renderSlot(match.team1, match.team1Label, 'top')}
        {renderSlot(match.team2, match.team2Label, 'bottom')}
      </div>
    </div>
  );
}

function BracketColumn({
  label,
  col,
  roundClass,
  matchNums,
  matchesByNum,
  matchLabelTemplate,
  disabled,
  staticMode,
  showMatchIds,
  locale,
  onPick,
}: {
  label: string;
  col: number;
  roundClass: string;
  matchNums: number[];
  matchesByNum: Map<number, BracketMatch>;
  matchLabelTemplate: string;
  disabled: boolean;
  staticMode: boolean;
  showMatchIds: boolean;
  locale: Locale;
  onPick?: (matchNum: number, teamId: string, round: string) => void;
}) {
  return (
    <div className={`bracket-col ${roundClass}`} style={{ gridColumn: col }}>
      <h3 className="bracket-col-title">{label}</h3>
      <div className="bracket-col-grid">
        {matchNums.map((num) => {
          const match = matchesByNum.get(num);
          if (!match) return null;
          const { rowStart, rowSpan } = getBracketGridRows(num);
          return (
            <div
              key={num}
              className={`bracket-cell bracket-cell-span-${rowSpan}`}
              style={{ gridRow: `${rowStart} / span ${rowSpan}` }}
            >
              <BracketMatchCell
                match={match}
                matchLabelTemplate={matchLabelTemplate}
                disabled={disabled}
                staticMode={staticMode}
                showMatchIds={showMatchIds}
                locale={locale}
                onPick={
                  onPick
                    ? (teamId) => onPick(match.num, teamId, match.round)
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BracketTreeView({
  matches,
  labels,
  disabled = false,
  staticMode = false,
  showMatchIds = true,
  hideThirdPlace = false,
  onPickWinner,
  className = '',
}: BracketTreeViewProps) {
  const { locale } = useLanguage();
  const matchesByNum = new Map(matches.map((m) => [m.num, m]));
  const thirdPlace = matches.find((m) => m.round === 'Match for third place');
  const finalMatch = matches.find((m) => m.round === 'Final');

  const r32Nums = R32_TO_R16.flatMap(([a, b]) => [a, b]);
  const r16Nums = R32_TO_R16.map(([, , n]) => n);
  const qfNums = R16_TO_QF.map(([, , n]) => n);
  const sfNums = QF_TO_SF.map(([, , n]) => n);
  const { final: finalGrid } = getFinalGridPlacement();
  const treeRef = useRef<HTMLDivElement>(null);

  const colProps = {
    matchesByNum,
    matchLabelTemplate: labels.matchLabel,
    disabled,
    staticMode,
    showMatchIds,
    locale,
    onPick: onPickWinner,
  };

  return (
    <div className={`bracket-tree-shell ${className}`.trim()}>
      <div className="bracket-tree" ref={treeRef}>
        <BracketConnectors containerRef={treeRef} matches={matches} />
        <BracketColumn label={labels.round32} col={1} roundClass="bracket-col-r32" matchNums={r32Nums} {...colProps} />
        <BracketColumn label={labels.round16} col={2} roundClass="bracket-col-r16" matchNums={r16Nums} {...colProps} />
        <BracketColumn label={labels.quarter} col={3} roundClass="bracket-col-qf" matchNums={qfNums} {...colProps} />
        <BracketColumn label={labels.semi} col={4} roundClass="bracket-col-sf" matchNums={sfNums} {...colProps} />

        <div className="bracket-col bracket-col-finals" style={{ gridColumn: 5 }}>
          <h3 className="bracket-col-title">{labels.final}</h3>
          <div className="bracket-col-grid finals-grid">
            {finalMatch && (
              <div
                className="bracket-cell bracket-cell-span-8"
                style={{ gridRow: `${finalGrid.rowStart} / span ${finalGrid.rowSpan}` }}
              >
                <BracketMatchCell
                  match={finalMatch}
                  matchLabelTemplate={labels.matchLabel}
                  disabled={disabled}
                  staticMode={staticMode}
                  showMatchIds={showMatchIds}
                  locale={locale}
                  onPick={
                    onPickWinner
                      ? (teamId) =>
                          onPickWinner(finalMatch.num, teamId, finalMatch.round)
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {thirdPlace && !hideThirdPlace && (
        <BracketThirdPlace
          match={thirdPlace}
          labels={labels}
          disabled={disabled}
          staticMode={staticMode}
          showMatchIds={showMatchIds}
          locale={locale}
          onPickWinner={onPickWinner}
        />
      )}
    </div>
  );
}
