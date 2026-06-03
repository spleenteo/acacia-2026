'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Distance (px) from the viewport top at which the pinned hero's bottom copy
 * band settles. Higher = the band sits lower on screen, leaving headroom so a
 * two-line title clears the fixed header. The sticky `top` and the pin
 * threshold below are both derived from this single value to stay in sync.
 */
export const HERO_PIN_TOP_PX = 384;

/** The sticky `top` for a pinning hero — feed straight into an inline style. */
export const HERO_STICKY_TOP = `calc(${HERO_PIN_TOP_PX}px - 68svh)`;

/**
 * Tracks whether a sticky hero has "pinned" — scrolled up to its sticky top.
 * Desktop only (≥1024px); below that it never pins.
 *
 * The companion sticky `top` is `HERO_STICKY_TOP`, chosen so the pinned copy
 * lands at a fixed px position regardless of viewport height; this recomputes
 * that same threshold from `innerHeight`. Hysteresis — pin at +8px, un-pin only
 * at +64px — absorbs the browser's scroll-anchoring nudge when the section's
 * padding shrinks on pin (which would otherwise oscillate the boolean in a tight
 * band). The reads are coalesced through requestAnimationFrame.
 *
 * Pair the returned `ref` with `lg:sticky` + `top: HERO_STICKY_TOP` on the
 * pinning section, and put the content that should scroll behind it in a sibling
 * with a lower stacking context (`relative lg:z-0`).
 */
export function useHeroPin<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let raf = 0;
    const evaluate = () => {
      if (window.innerWidth < 1024) {
        setPinned(false);
        return;
      }
      const el = ref.current;
      if (!el) return;
      const stickyTop = HERO_PIN_TOP_PX - 0.68 * window.innerHeight;
      const top = el.getBoundingClientRect().top;
      setPinned((prev) => (prev ? top <= stickyTop + 64 : top <= stickyTop + 8));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        evaluate();
      });
    };
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { ref, pinned };
}
