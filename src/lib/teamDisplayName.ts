import { TEAM_NAMES_TR } from '../data/teamNamesTr';
import type { Team } from '../types';
import type { Locale } from '../i18n/translations';

export function getTeamDisplayName(englishName: string, locale: Locale): string {
  if (locale === 'en') return englishName;
  return TEAM_NAMES_TR[englishName] ?? englishName;
}

export function localizeTeam(team: Team | null | undefined, locale: Locale): Team | null {
  if (!team) return null;
  return { ...team, name: getTeamDisplayName(team.name, locale) };
}
