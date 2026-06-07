import type { GroupId, GroupState, RawWorldCupData, Team } from '../types';
import { GROUP_IDS } from '../types';
import { getFlag, teamId } from '../data/teamFlags';

const OPENFOOTBALL_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

export async function loadWorldCupData(): Promise<RawWorldCupData> {
  try {
    const response = await fetch(OPENFOOTBALL_URL);
    if (response.ok) return response.json();
  } catch {
    // fall through to bundled copy
  }

  const fallback = await fetch('/data/worldcup2026.json');
  if (!fallback.ok) throw new Error('DATA_LOAD_FAILED');
  return fallback.json();
}

export function extractGroups(data: RawWorldCupData): GroupState[] {
  const groupTeams = new Map<GroupId, Set<string>>();

  for (const match of data.matches) {
    if (!match.group) continue;
    const groupLetter = match.group.replace('Group ', '') as GroupId;
    if (!groupTeams.has(groupLetter)) groupTeams.set(groupLetter, new Set());
    groupTeams.get(groupLetter)!.add(match.team1);
    groupTeams.get(groupLetter)!.add(match.team2);
  }

  return GROUP_IDS.map((id) => {
    const names = [...(groupTeams.get(id) ?? [])];
    const teams: Team[] = names.map((name) => ({
      id: teamId(name, id),
      name,
      flag: getFlag(name),
      group: id,
    }));
    return { id, teams };
  });
}

export function buildInitialPredictions(groups: GroupState[]): Record<GroupId, string[]> {
  return Object.fromEntries(
    groups.map((g) => [g.id, g.teams.map((t) => t.id)]),
  ) as Record<GroupId, string[]>;
}

export function getTeamById(groups: GroupState[], id: string): Team | undefined {
  for (const group of groups) {
    const team = group.teams.find((t) => t.id === id);
    if (team) return team;
  }
  return undefined;
}

export function orderedTeamsInGroup(
  group: GroupState,
  order: string[],
): Team[] {
  return order
    .map((id) => group.teams.find((t) => t.id === id))
    .filter((t): t is Team => Boolean(t));
}
