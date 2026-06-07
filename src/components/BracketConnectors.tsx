import { useLayoutEffect, useState, type RefObject } from 'react';
import type { BracketMatch } from '../types';
import { BRACKET_MERGE_LINKS } from '../lib/bracketTopology';

interface BracketConnectorsProps {
  containerRef: RefObject<HTMLElement | null>;
  matches: BracketMatch[];
}

interface Size {
  width: number;
  height: number;
}

function getMatchInnerRect(container: HTMLElement, matchNum: number): DOMRect | null {
  const inner = container.querySelector(
    `.bracket-match[data-num="${matchNum}"] .bracket-match-inner`,
  );
  return inner?.getBoundingClientRect() ?? null;
}

/** Snap to half-pixels for crisp 1px SVG strokes. */
function snap(n: number): number {
  return Math.round(n) + 0.5;
}

/** Classic bracket: two feeders merge horizontally, vertical trunk, into target. */
function buildMergePath(
  containerRect: DOMRect,
  feederA: DOMRect,
  feederB: DOMRect,
  target: DOMRect,
): string {
  const yA = snap(feederA.top + feederA.height / 2 - containerRect.top);
  const yB = snap(feederB.top + feederB.height / 2 - containerRect.top);
  const yTarget = snap(target.top + target.height / 2 - containerRect.top);
  const xA = snap(feederA.right - containerRect.left);
  const xB = snap(feederB.right - containerRect.left);
  const xTarget = snap(target.left - containerRect.left);
  const midX = snap((Math.max(xA, xB) + xTarget) / 2);
  const yTop = Math.min(yA, yB);
  const yBottom = Math.max(yA, yB);
  const yMerge = snap((yA + yB) / 2);

  const segments = [
    `M ${xA} ${yA} H ${midX}`,
    `M ${xB} ${yB} H ${midX}`,
    `M ${midX} ${yTop} V ${yBottom}`,
  ];

  if (Math.abs(yMerge - yTarget) < 1) {
    segments.push(`M ${midX} ${yMerge} H ${xTarget}`);
  } else {
    segments.push(`M ${midX} ${yMerge} V ${yTarget} H ${xTarget}`);
  }

  return segments.join(' ');
}

function computePaths(container: HTMLElement): string[] {
  const containerRect = container.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) return [];

  const paths: string[] = [];

  for (const { feeders, target } of BRACKET_MERGE_LINKS) {
    const [feederA, feederB] = feeders;
    const rectA = getMatchInnerRect(container, feederA);
    const rectB = getMatchInnerRect(container, feederB);
    const rectTarget = getMatchInnerRect(container, target);
    if (!rectA || !rectB || !rectTarget) continue;
    paths.push(buildMergePath(containerRect, rectA, rectB, rectTarget));
  }

  return paths;
}

export function BracketConnectors({ containerRef, matches }: BracketConnectorsProps) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [paths, setPaths] = useState<string[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
        setPaths(computePaths(container));
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    container.querySelectorAll('.bracket-match-inner').forEach((node) => observer.observe(node));

    const onWindowResize = () => update();
    window.addEventListener('resize', onWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [containerRef, matches]);

  if (size.width === 0 || paths.length === 0) return null;

  return (
    <svg
      className="bracket-connectors"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      aria-hidden
    >
      {paths.map((d, index) => (
        <path key={index} d={d} className="bracket-connector-path" />
      ))}
    </svg>
  );
}
