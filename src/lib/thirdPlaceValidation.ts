import type { GroupId, GroupState, RawWorldCupData, Team } from '../types';
import { orderedTeamsInGroup } from './parseWorldCupData';
import {
  assignThirdPlaceTeams,
  parseThirdPlacePlaceholder,
} from './thirdPlaceResolver';

const KNOCKOUT_ROUNDS = [
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Match for third place',
  'Final',
];

function collectThirdPlaceSlots(data: RawWorldCupData) {
  return data.matches
    .filter(
      (m) =>
        KNOCKOUT_ROUNDS.includes(m.round) &&
        (m.team1.startsWith('3') || m.team2.startsWith('3')),
    )
    .flatMap((m) => {
      const slots = [];
      if (m.team1.startsWith('3')) slots.push(parseThirdPlacePlaceholder(m.team1));
      if (m.team2.startsWith('3')) slots.push(parseThirdPlacePlaceholder(m.team2));
      return slots;
    });
}

export function isThirdPlaceSelectionValid(
  data: RawWorldCupData,
  groups: GroupState[],
  groupOrder: Record<GroupId, string[]>,
  qualifiedThirdGroups: GroupId[],
): boolean {
  if (qualifiedThirdGroups.length !== 8) return true;

  const rankings = Object.fromEntries(
    groups.map((g) => [g.id, orderedTeamsInGroup(g, groupOrder[g.id])]),
  ) as Record<GroupId, Team[]>;

  const slots = collectThirdPlaceSlots(data);
  const assignment = assignThirdPlaceTeams(
    new Set(qualifiedThirdGroups),
    slots,
    rankings,
  );

  return assignment.size === slots.length;
}
