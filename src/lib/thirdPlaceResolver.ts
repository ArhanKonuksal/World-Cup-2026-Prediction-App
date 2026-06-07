import type { GroupId, Team } from '../types';

export interface ThirdPlaceSlot {
  placeholder: string;
  eligibleGroups: GroupId[];
}

export function parseThirdPlacePlaceholder(token: string): ThirdPlaceSlot {
  const body = token.startsWith('3') ? token.slice(1) : token;
  const eligibleGroups = body.split('/').filter(Boolean) as GroupId[];
  return { placeholder: token, eligibleGroups };
}

/**
 * Assigns 8 qualifying third-place teams to R32 slots via backtracking.
 * Matches FIFA Annex C constraints encoded in openfootball placeholders.
 */
export function assignThirdPlaceTeams(
  qualifiedGroups: Set<GroupId>,
  slots: ThirdPlaceSlot[],
  rankings: Record<GroupId, Team[]>,
): Map<string, Team> {
  const assignment = new Map<string, Team>();
  const used = new Set<GroupId>();

  function backtrack(index: number): boolean {
    if (index >= slots.length) return true;

    const slot = slots[index];
    for (const group of slot.eligibleGroups) {
      if (!qualifiedGroups.has(group) || used.has(group)) continue;
      const team = rankings[group]?.[2];
      if (!team) continue;

      used.add(group);
      assignment.set(slot.placeholder, team);
      if (backtrack(index + 1)) return true;
      used.delete(group);
      assignment.delete(slot.placeholder);
    }
    return false;
  }

  backtrack(0);
  return assignment;
}
