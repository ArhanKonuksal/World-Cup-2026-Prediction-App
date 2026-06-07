/** All knockout matches that need a winner for a complete prediction path. */
export const KNOCKOUT_MATCH_NUMS = [
  ...Array.from({ length: 16 }, (_, i) => 73 + i),
  ...Array.from({ length: 8 }, (_, i) => 89 + i),
  ...Array.from({ length: 4 }, (_, i) => 97 + i),
  101, 102, 103, 104,
];

export function isBracketComplete(winners: Record<number, string>): boolean {
  return KNOCKOUT_MATCH_NUMS.every((num) => Boolean(winners[num]));
}

export function getBracketProgress(winners: Record<number, string>): {
  picked: number;
  total: number;
} {
  const picked = KNOCKOUT_MATCH_NUMS.filter((num) => Boolean(winners[num])).length;
  return { picked, total: KNOCKOUT_MATCH_NUMS.length };
}
