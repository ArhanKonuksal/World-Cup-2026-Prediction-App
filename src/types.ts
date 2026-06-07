export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export const GROUP_IDS: GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
];

export interface Team {
  id: string;
  name: string;
  flag: string;
  group: GroupId;
}

export interface GroupState {
  id: GroupId;
  teams: Team[];
}

export interface RawMatch {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground: string;
}

export interface RawWorldCupData {
  name: string;
  matches: RawMatch[];
}

export interface BracketMatch {
  num: number;
  round: string;
  date: string;
  team1: Team | null;
  team2: Team | null;
  team1Label: string;
  team2Label: string;
  ground: string;
  winnerId?: string;
}

export interface PredictionsState {
  groups: Record<GroupId, string[]>;
  qualifiedThirdGroups: GroupId[];
  winners: Record<number, string>;
  championId?: string;
  userName?: string;
}
