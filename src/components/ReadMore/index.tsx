'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  children: ReactNode;
  /** Number of lines shown when collapsed. */
  lines?: number;
  /** When true, the content is shown in full (no clamp, no toggle) from `lg` up,
   *  and only collapses below it. Defaults to clamping on every viewport. */
  desktopExpanded?: boolean;
};

/**
 * Clamps its content to `lines` lines and reveals a "read more / read less"
 * toggle — but only when the content actually overflows the clamp. The full text
 * stays in the DOM (CSS clamp), so it remains crawlable/accessible.
 *
 * By default it clamps on every viewport (the detail-page rail is narrow, so
 * long copy needs trimming on desktop too). Pass `desktopExpanded` for index
 * pages that want the copy fully expanded from `lg` up and the toggle only on
 * smaller screens.
 */
export default function ReadMore({ children, lines = 8, desktopExpanded = false }: Props) {
  const t = useTranslations('listing');
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only track the breakpoint when desktop-expansion is requested.
  useEffect(() => {
    if (!desktopExpanded) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [desktopExpanded]);

  const fullyOpen = expanded || (desktopExpanded && isDesktop);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Measure against the clamped height (toggle off → clamp applied on first paint).
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 4);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [children, fullyOpen]);

  return (
    <div>
      <div
        ref={ref}
        style={
          fullyOpen
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: lines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {children}
      </div>

      {!(desktopExpanded && isDesktop) && (overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 cursor-pointer font-body text-body-sm font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/70"
        >
          {expanded ? t('readLess') : t('readMore')}
        </button>
      )}
    </div>
  );
}
