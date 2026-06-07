/** Official knockout tree — feeder match numbers for vertical bracket alignment. */

export const R32_TO_R16: [number, number, number][] = [
  [73, 75, 90],
  [74, 77, 89],
  [76, 78, 91],
  [79, 80, 92],
  [83, 84, 93],
  [81, 82, 94],
  [86, 88, 95],
  [85, 87, 96],
];

export const R16_TO_QF: [number, number, number][] = [
  [89, 90, 97],
  [93, 94, 98],
  [91, 92, 99],
  [95, 96, 100],
];

export const QF_TO_SF: [number, number, number][] = [
  [97, 98, 101],
  [99, 100, 102],
];

export const BRACKET_ROW_COUNT = 16;

function mergeFeederRows(
  a: { rowStart: number; rowSpan: number },
  b: { rowStart: number; rowSpan: number },
): { rowStart: number; rowSpan: number } {
  const start = Math.min(a.rowStart, b.rowStart);
  const end = Math.max(a.rowStart + a.rowSpan, b.rowStart + b.rowSpan);
  return { rowStart: start, rowSpan: end - start };
}

function rowCenter(row: { rowStart: number; rowSpan: number }): number {
  return row.rowStart + (row.rowSpan - 1) / 2;
}

/** Semi-finals: center between QF feeders without overlapping each other in the same column. */
function centeredBetweenFeeders(
  feederA: { rowStart: number; rowSpan: number },
  feederB: { rowStart: number; rowSpan: number },
  span: number,
): { rowStart: number; rowSpan: number } {
  const yCenter = (rowCenter(feederA) + rowCenter(feederB)) / 2;
  const rowStart = Math.max(1, Math.round(yCenter - (span - 1) / 2));
  return { rowStart, rowSpan: span };
}

/** Grid rows: each R32 match gets its own row; downstream rounds span feeders. */
export function getBracketGridRows(matchNum: number): { rowStart: number; rowSpan: number } {
  const pairIndex = R32_TO_R16.findIndex(([a, b]) => a === matchNum || b === matchNum);
  if (pairIndex >= 0) {
    const [first, second] = R32_TO_R16[pairIndex];
    const slotInPair = matchNum === first ? 0 : matchNum === second ? 1 : 0;
    return { rowStart: pairIndex * 2 + 1 + slotInPair, rowSpan: 1 };
  }

  const r16Link = R32_TO_R16.find(([, , r16]) => r16 === matchNum);
  if (r16Link) {
    const [feederA, feederB] = r16Link;
    return mergeFeederRows(getBracketGridRows(feederA), getBracketGridRows(feederB));
  }

  const qfLink = R16_TO_QF.find(([, , qf]) => qf === matchNum);
  if (qfLink) {
    const [feederA, feederB] = qfLink;
    return mergeFeederRows(getBracketGridRows(feederA), getBracketGridRows(feederB));
  }

  const sfLink = QF_TO_SF.find(([, , sf]) => sf === matchNum);
  if (sfLink) {
    const [feederA, feederB] = sfLink;
    return centeredBetweenFeeders(
      getBracketGridRows(feederA),
      getBracketGridRows(feederB),
      4,
    );
  }

  return { rowStart: 1, rowSpan: 2 };
}

export function getFinalGridPlacement(): {
  final: { rowStart: number; rowSpan: number };
  third: { rowStart: number; rowSpan: number };
} {
  const half = BRACKET_ROW_COUNT / 2;
  const quarter = half / 2;
  return {
    final: { rowStart: quarter + 1, rowSpan: half },
    // Ortada bağımsız — ana bracket hattının dışında
    third: { rowStart: half - 1, rowSpan: quarter },
  };
}

export const FINAL_MATCH_NUM = 104;
export const THIRD_PLACE_MATCH_NUM = 103;

/** Winner-bracket merge links: two feeders → one target match. */
export const BRACKET_MERGE_LINKS: { feeders: [number, number]; target: number }[] = [
  ...R32_TO_R16.map(([a, b, c]) => ({ feeders: [a, b] as [number, number], target: c })),
  ...R16_TO_QF.map(([a, b, c]) => ({ feeders: [a, b] as [number, number], target: c })),
  ...QF_TO_SF.map(([a, b, c]) => ({ feeders: [a, b] as [number, number], target: c })),
  { feeders: [101, 102], target: FINAL_MATCH_NUM },
];
