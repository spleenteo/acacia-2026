'use client';

import { useEffect, useMemo, useState } from 'react';

export type DiagonalDirection = 'left' | 'right';

/** Stable 32-bit hash of a string → a deterministic pseudo-random number. */
function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  return h;
}

/**
 * Which bottom corner rides up. Deterministic per `seed` (e.g. an apartment id),
 * so a given page is always consistent but neighbouring pages alternate sides.
 */
export function diagonalDirection(seed: string): DiagonalDirection {
  return Math.sin(hash(seed)) >= 0 ? 'left' : 'right';
}

function clipFor(direction: DiagonalDirection, cut: number): string {
  return direction === 'left'
    ? `polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - ${cut}px))`
    : `polygon(0 0, 100% 0, 100% calc(100% - ${cut}px), 0 100%)`;
}

type Options = {
  /** Cut depth (px) below 1600px. */
  base?: number;
  /** Cut depth (px) at/above 1600px — a wider panel flattens a fixed cut, so the
   *  angle is deepened to stay legible on large monitors. */
  wide?: number;
};

/**
 * Returns the `clip-path` polygon for the editorial colour panel's diagonal
 * bottom edge. The cut starts flat and wipes in on mount — and again whenever
 * `seed` changes (i.e. navigating to another apartment) — so pair it with a
 * `transition: clip-path …` on the element. The direction is seeded from `seed`
 * (left- or right-rising) and the depth grows past 1600px.
 *
 * Both server and first client render produce a flat cut (cut = 0), so there's
 * no hydration mismatch; the wipe-in is purely a post-mount effect.
 *
 * Returns the `clipPath` string plus the current `cut` depth in px (handy for
 * positioning something exactly on the diagonal — at the panel's horizontal
 * centre the edge sits `cut / 2` above the box bottom).
 */
export function useHeroDiagonal(
  seed: string,
  { base = 34, wide = 72 }: Options = {},
): { clipPath: string; cut: number } {
  const direction = useMemo(() => diagonalDirection(seed), [seed]);
  const [cut, setCut] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1600px)');
    const target = () => (mq.matches ? wide : base);
    // Snap flat, then animate to the target once the flat frame has painted, so
    // the clip-path transition actually runs (and replays on every seed change).
    // Driving a CSS transition's start frame is the "synchronise with an external
    // system" case the set-state-in-effect rule explicitly exempts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCut(0);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setCut(target()));
    });
    // On a viewport crossing the 1600px breakpoint, ease to the new depth (no replay).
    const onChange = () => setCut(target());
    mq.addEventListener('change', onChange);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      mq.removeEventListener('change', onChange);
    };
  }, [seed, base, wide]);

  return { clipPath: clipFor(direction, cut), cut };
}
