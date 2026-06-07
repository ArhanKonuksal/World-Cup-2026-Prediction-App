/** Flag emojis for all 48 World Cup 2026 teams (openfootball dataset). */
export const TEAM_FLAGS: Record<string, string> = {
  Mexico: '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Czech Republic': '🇨🇿',
  Canada: '🇨🇦',
  Qatar: '🇶🇦',
  Switzerland: '🇨🇭',
  'Bosnia & Herzegovina': '🇧🇦',
  Brazil: '🇧🇷',
  Morocco: '🇲🇦',
  Haiti: '🇭🇹',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸',
  Paraguay: '🇵🇾',
  Australia: '🇦🇺',
  Turkey: '🇹🇷',
  Germany: '🇩🇪',
  'Ivory Coast': '🇨🇮',
  Ecuador: '🇪🇨',
  'Curaçao': '🇨🇼',
  Netherlands: '🇳🇱',
  Japan: '🇯🇵',
  Sweden: '🇸🇪',
  Tunisia: '🇹🇳',
  Belgium: '🇧🇪',
  Egypt: '🇪🇬',
  Iran: '🇮🇷',
  'New Zealand': '🇳🇿',
  Spain: '🇪🇸',
  'Saudi Arabia': '🇸🇦',
  Uruguay: '🇺🇾',
  'Cape Verde': '🇨🇻',
  France: '🇫🇷',
  Senegal: '🇸🇳',
  Iraq: '🇮🇶',
  Norway: '🇳🇴',
  Argentina: '🇦🇷',
  Algeria: '🇩🇿',
  Austria: '🇦🇹',
  Jordan: '🇯🇴',
  Portugal: '🇵🇹',
  'DR Congo': '🇨🇩',
  Uzbekistan: '🇺🇿',
  Colombia: '🇨🇴',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Croatia: '🇭🇷',
  Ghana: '🇬🇭',
  Panama: '🇵🇦',
};

export function getFlag(name: string): string {
  return TEAM_FLAGS[name] ?? '🏳️';
}

export function teamId(name: string, group: string): string {
  return `${group}-${name.replace(/\s+/g, '-').toLowerCase()}`;
}
