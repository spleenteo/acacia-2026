'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Distance (px) from the viewport top at which the pinned hero's bottom copy
 * band settles. Encoded in global.css as `top: calc(384px - 68svh)` on
 * `.hero-pin-top`; also used by the filter scroll-to-pin helper. Keep in sync
 * with that stylesheet value.
 */
export const HERO_PIN_TOP_PX = 384;

/**
 * Tracks whether a sticky hero has "pinned" — scrolled up to its sticky `top`.
 *
 * Detection reads the element's *computed* style instead of recomputing a
 * threshold from `window.innerHeight`:
 *   - `position` tells us whether the hero is sticky at all (global.css only makes
 *     `.hero-pin` sticky above a min viewport height), so there's no JS height
 *     check to keep in sync.
 *   - the resolved `top` is the svh-based pin offset; comparing the element's
 *     `rect.top` against it keeps detection aligned with the *actual* CSS pin even
 *     as mobile browser toolbars change `innerHeight` (svh ≠ innerHeight). That
 *     desync was making the hero photo fade only on reverse scroll.
 *
 * Hysteresis — pin at +8px, un-pin only at +64px — absorbs the browser's
 * scroll-anchoring nudge when the section's padding shrinks on pin. Reads are
 * coalesced through requestAnimationFrame.
 *
 * Pair the returned `ref` with the `hero-pin` class, and put the content that
 * scrolls behind it in a sibling with a lower stacking context (`relative z-0`).
 */
export function useHeroPin<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let raf = 0;
    const evaluate = () => {
      const el = ref.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      // The hero only pins where global.css makes `.hero-pin` sticky (viewport
      // tall enough). Otherwise it's a static/relative panel — never pinned.
      if (cs.position !== 'sticky') {
        setPinned(false);
        return;
      }
      // CSS-resolved (svh-based) pin offset — matches the real stuck position,
      // so it stays correct as mobile toolbars resize the viewport.
      const stickyTop = parseFloat(cs.top) || 0;
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
