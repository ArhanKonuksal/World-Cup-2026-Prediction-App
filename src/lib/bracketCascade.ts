import {
  BRACKET_MERGE_LINKS,
  FINAL_MATCH_NUM,
  THIRD_PLACE_MATCH_NUM,
} from './bracketTopology';

/** matchNum → knockout matches that directly consume its winner (W#). */
const WINNER_CHILDREN = new Map<number, number[]>();

for (const { feeders, target } of BRACKET_MERGE_LINKS) {
  for (const feeder of feeders) {
    const list = WINNER_CHILDREN.get(feeder) ?? [];
    list.push(target);
    WINNER_CHILDREN.set(feeder, list);
  }
}

/** Matches that depend on semi-final losers (L101 / L102). */
const LOSER_CHILDREN = new Map<number, number[]>([
  [101, [THIRD_PLACE_MATCH_NUM]],
  [102, [THIRD_PLACE_MATCH_NUM]],
]);

/** All downstream match numbers to clear when a given match winner changes. */
export function getDownstreamMatchNums(matchNum: number): number[] {
  const seen = new Set<number>();
  const queue = [matchNum];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const child of WINNER_CHILDREN.get(current) ?? []) {
      if (!seen.has(child)) {
        seen.add(child);
        queue.push(child);
      }
    }
    for (const child of LOSER_CHILDREN.get(current) ?? []) {
      if (!seen.has(child)) {
        seen.add(child);
        queue.push(child);
      }
    }
  }

  if (matchNum === FINAL_MATCH_NUM) {
    seen.delete(FINAL_MATCH_NUM);
  }

  return [...seen];
}

export function applyWinnerPick(
  winners: Record<number, string>,
  matchNum: number,
  teamId: string,
): Record<number, string> {
  const next = { ...winners, [matchNum]: teamId };
  for (const downstream of getDownstreamMatchNums(matchNum)) {
    delete next[downstream];
  }
  return next;
}
