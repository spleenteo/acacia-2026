'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  children: ReactNode;
  /** Number of lines shown when collapsed. */
  lines?: number;
};

/**
 * Clamps its content to `lines` lines and reveals a "read more / read less"
 * toggle — but only when the content actually overflows the clamp. Works on all
 * viewports (the detail-page description rail is narrow, so long copy needs
 * trimming on desktop too). The full text stays in the DOM (CSS clamp), so it
 * remains crawlable/accessible.
 */
export default function ReadMore({ children, lines = 8 }: Props) {
  const t = useTranslations('listing');
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Measure against the clamped height (toggle off → clamp applied on first paint).
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 4);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [children]);

  return (
    <div>
      <div
        ref={ref}
        style={
          expanded
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

      {(overflowing || expanded) && (
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
