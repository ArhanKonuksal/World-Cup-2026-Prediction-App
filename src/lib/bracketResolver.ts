import type {
  BracketMatch,
  GroupId,
  GroupState,
  RawWorldCupData,
  Team,
} from '../types';
import { orderedTeamsInGroup } from './parseWorldCupData';
import { assignThirdPlaceTeams, parseThirdPlacePlaceholder } from './thirdPlaceResolver';

const KNOCKOUT_ROUNDS = [
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Match for third place',
  'Final',
];

function resolveSeed(
  token: string,
  rankings: Record<GroupId, Team[]>,
  thirdAssignments: Map<string, Team>,
  winners: Record<number, string>,
  allTeams: Map<string, Team>,
): Team | null {
  if (token.startsWith('W')) {
    const num = parseInt(token.slice(1), 10);
    const winnerId = winners[num];
    return winnerId ? allTeams.get(winnerId) ?? null : null;
  }

  if (token.startsWith('L')) {
    return null; // resolved in second pass
  }

  if (token.startsWith('3')) {
    const key = token.includes('/') ? token : `3${token.slice(1)}`;
    return thirdAssignments.get(key) ?? null;
  }

  const rank = parseInt(token[0], 10);
  const group = token.slice(1) as GroupId;
  const team = rankings[group]?.[rank - 1];
  return team ?? null;
}

export function buildKnockoutBracket(
  data: RawWorldCupData,
  groups: GroupState[],
  groupOrder: Record<GroupId, string[]>,
  qualifiedThirdGroups: GroupId[],
  winners: Record<number, string>,
): BracketMatch[] {
  const rankings = Object.fromEntries(
    groups.map((g) => [g.id, orderedTeamsInGroup(g, groupOrder[g.id])]),
  ) as Record<GroupId, Team[]>;

  const knockoutMatches = data.matches.filter((m) =>
    KNOCKOUT_ROUNDS.includes(m.round),
  );

  const thirdPlaceSlots = knockoutMatches
    .filter((m) => m.team1.startsWith('3') || m.team2.startsWith('3'))
    .flatMap((m) => {
      const slots: { placeholder: string; eligibleGroups: GroupId[] }[] = [];
      if (m.team1.startsWith('3')) {
        slots.push(parseThirdPlacePlaceholder(m.team1));
      }
      if (m.team2.startsWith('3')) {
        slots.push(parseThirdPlacePlaceholder(m.team2));
      }
      return slots;
    });

  const thirdAssignments = assignThirdPlaceTeams(
    new Set(qualifiedThirdGroups),
    thirdPlaceSlots,
    rankings,
  );

  const allTeams = new Map<string, Team>();
  groups.forEach((g) => g.teams.forEach((t) => allTeams.set(t.id, t)));

  const built: BracketMatch[] = knockoutMatches.map((match) => {
    let num = match.num ?? 0;
    if (match.round === 'Match for third place') num = 103;
    if (match.round === 'Final') num = 104;

    const team1 =
      resolveSeed(match.team1, rankings, thirdAssignments, winners, allTeams);
    const team2 =
      resolveSeed(match.team2, rankings, thirdAssignments, winners, allTeams);

    return {
      num,
      round: match.round,
      date: match.date,
      ground: match.ground,
      team1,
      team2,
      team1Label: match.team1,
      team2Label: match.team2,
      winnerId: winners[num],
    };
  });

  const byNum = new Map(built.filter((m) => m.num > 0).map((m) => [m.num, m]));

  for (const m of built) {
    if (m.team1Label.startsWith('W') && !m.team1) {
      const ref = parseInt(m.team1Label.slice(1), 10);
      const winnerId = winners[ref];
      m.team1 = winnerId ? allTeams.get(winnerId) ?? null : null;
    }
    if (m.team2Label.startsWith('W') && !m.team2) {
      const ref = parseInt(m.team2Label.slice(1), 10);
      const winnerId = winners[ref];
      m.team2 = winnerId ? allTeams.get(winnerId) ?? null : null;
    }
    if (m.team1Label.startsWith('L')) {
      const ref = parseInt(m.team1Label.slice(1), 10);
      const source = byNum.get(ref);
      const winnerId = winners[ref];
      if (source?.team1 && source?.team2 && winnerId) {
        m.team1 =
          source.team1.id === winnerId ? source.team2 : source.team1;
      }
    }
    if (m.team2Label.startsWith('L')) {
      const ref = parseInt(m.team2Label.slice(1), 10);
      const source = byNum.get(ref);
      const winnerId = winners[ref];
      if (source?.team1 && source?.team2 && winnerId) {
        m.team2 =
          source.team1.id === winnerId ? source.team2 : source.team1;
      }
    }

    if (m.winnerId && m.team1 && m.team2) {
      if (m.winnerId !== m.team1.id && m.winnerId !== m.team2.id) {
        m.winnerId = undefined;
      }
    } else if (m.winnerId) {
      m.winnerId = undefined;
    }
  }

  return built;
}

export function groupMatchesByRound(
  matches: BracketMatch[],
): Record<string, BracketMatch[]> {
  const rounds: Record<string, BracketMatch[]> = {};
  for (const match of matches) {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  }
  return rounds;
}

export function getThirdPlaceTeams(
  groups: GroupState[],
  groupOrder: Record<GroupId, string[]>,
): { group: GroupId; team: Team }[] {
  return groups.map((g) => ({
    group: g.id,
    team: orderedTeamsInGroup(g, groupOrder[g.id])[2],
  }));
}
