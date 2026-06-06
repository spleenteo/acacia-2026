'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import HtmlContent from '@/components/HtmlContent';

type Props = {
  /** Optional uppercase/serif kicker at the top of the text rail. */
  kicker?: string;
  /** Intro copy as an HTML string (index pages) — collapsible on mobile. */
  intro?: string | null;
  /** Pre-rendered text node (detail pages: a StructuredText/HtmlContent body),
   *  shown in full (no mobile collapse). Use instead of `intro`. */
  body?: ReactNode;
  /** Which side the text rail sits on at lg+. 'left' = index, 'right' = detail. */
  textSide?: 'left' | 'right';
  /** Right/left column content — a filtered grid or a plain card grid. */
  children: ReactNode;
};

/**
 * Two-column editorial shell shared by listing index pages (text rail left,
 * cards right) and detail pages (cards left, text rail right — `textSide="right"`).
 * The rail sits on a sage panel; on index pages a long `intro` collapses behind a
 * "read more" toggle below `lg`. Sits inside the consuming page's
 * `relative z-0 -mt-8 lg:mt-0` wrapper so it tucks under the sticky EditorialHero.
 */
export default function EditorialListingLayout({
  kicker,
  intro,
  body,
  textSide = 'left',
  children,
}: Props) {
  const t = useTranslations('listing');
  const [expanded, setExpanded] = useState(false);

  const rail = (
    <aside className="rounded-card bg-surface-alt p-8 lg:p-10">
      {kicker && (
        <p className="mb-4 font-heading font-normal text-h3 leading-snug tracking-[-0.01em] text-dark">
          {kicker}
        </p>
      )}

      {intro && (
        <>
          <HtmlContent
            html={intro}
            className={[
              'font-body text-body-sm text-muted',
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

      {body}

      <div className="mt-8 h-[3px] w-12 rounded-sm bg-primary" />
    </aside>
  );

  const cards = children;
  // Mobile DOM order = grid order: text-left → rail first; text-right → cards first.
  const [first, second] = textSide === 'right' ? [cards, rail] : [rail, cards];
  const gridCols = textSide === 'right' ? 'lg:grid-cols-[1fr_300px]' : 'lg:grid-cols-[300px_1fr]';

  return (
    <section className="pt-[68px] pb-20 lg:pb-28 lg:pt-28 lg:-mt-[150px] bg-surface">
      <div className="mx-auto max-w-7xl px-8">
        <div className={`lg:grid ${gridCols} lg:gap-12 xl:gap-16 lg:items-start`}>
          <div>{first}</div>
          <div className="mt-10 lg:mt-0">{second}</div>
        </div>
      </div>
    </section>
  );
}
