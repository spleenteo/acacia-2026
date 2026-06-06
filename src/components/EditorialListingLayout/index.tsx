'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import HtmlContent from '@/components/HtmlContent';

type Props = {
  /** Uppercase editorial kicker shown at the top of the left rail. */
  kicker: string;
  /** Intro copy as HTML (from a DatoCMS `markdown: true` field). */
  intro?: string | null;
  /** Right column content — a filtered grid (CategoryFilter) or a plain card grid. */
  children: ReactNode;
};

/**
 * Two-column editorial listing shell shared by the accommodations, districts and
 * moods index pages. On desktop a sticky-free editorial rail (kicker + intro +
 * accent rule) sits on a sage panel to the left, while the filters/cards fill the
 * wider right column — so the cards rise to the top of the fold instead of
 * sitting below a full-width intro band.
 *
 * Below `lg` the layout stacks to a single column (rail → children) and the intro
 * collapses to a few lines behind a "read more" toggle so the cards stay close to
 * the top. On `lg+` the intro is always shown in full (the rail has its own height).
 *
 * Placed inside the consuming page's `relative lg:z-0` wrapper so the block keeps
 * scrolling behind the sticky `EditorialHero`.
 */
export default function EditorialListingLayout({ kicker, intro, children }: Props) {
  const t = useTranslations('listing');
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="pt-[68px] pb-20 lg:pb-28 lg:pt-28 lg:-mt-[150px] bg-surface">
      <div className="mx-auto max-w-7xl px-8">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-12 xl:gap-16 lg:items-start">
          {/* Left rail — editorial copy on a sage panel */}
          <aside className="rounded-card bg-surface-alt p-8 lg:p-10">
            <p className="mb-4 font-heading font-normal text-h3 leading-snug tracking-[-0.01em] text-dark">
              {kicker}
            </p>

            {intro && (
              <>
                <HtmlContent
                  html={intro}
                  className={[
                    'font-body text-body-sm text-muted',
                    // Clamp below lg unless expanded; never clamp on desktop.
                    expanded ? '' : 'line-clamp-3 lg:line-clamp-none',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="lg:hidden mt-4 cursor-pointer font-body text-body-sm font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/70"
                >
                  {expanded ? t('readLess') : t('readMore')}
                </button>
              </>
            )}

            <div className="mt-8 h-[3px] w-12 rounded-sm bg-primary" />
          </aside>

          {/* Right column — filters + cards */}
          <div className="mt-10 lg:mt-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
