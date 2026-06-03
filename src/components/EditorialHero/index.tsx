'use client';

import type { FragmentOf } from '@/lib/datocms/graphql';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { OverDarkHeader } from '@/components/HeaderTheme';
import { useHeroDiagonal } from '@/lib/useHeroDiagonal';
import { useHeroPin, HERO_STICKY_TOP } from '@/lib/useHeroPin';
import { isLightColor } from '@/lib/heroColor';
import { stripStega } from 'react-datocms/use-content-link';

/**
 * Panel tones — the saturated Japan Fish hues that work as a panel background
 * (not the pale chip tints used by WidgetLabel).
 */
export type HeroTone = 'rust' | 'gold' | 'sage' | 'slate' | 'navy';

const TONE_HEX: Record<HeroTone, string> = {
  rust: '#d53302',
  gold: '#ffaa4d',
  sage: '#a0cbad',
  slate: '#8fb1be',
  navy: '#00012a',
};

type Props = {
  /** Title HTML — may contain inline <em> for italic emphasis. */
  title: string;
  /** Optional uppercase kicker above the title. */
  label?: string | null;
  /** Optional tagline below the title (plain text). */
  subtitle?: string | null;
  /** Panel colour tone — used as the solid background and the diagonal sliver. */
  tone?: HeroTone;
  /** Optional background photo; when present the copy sits over a dark gradient. */
  image?: FragmentOf<typeof ResponsiveImageFragment> | null;
  priority?: boolean;
};

function unwrapParagraph(html: string): string {
  return html.replace(/^<p>([\s\S]*)<\/p>\n?$/, '$1');
}

/**
 * Generic editorial hero: a solid tone-or-photo coloured panel with the same
 * animated diagonal bottom edge as the apartment hero (shared via
 * `useHeroDiagonal`), pared down to a title + optional kicker + optional photo.
 *
 * With a photo it mirrors the apartment hero exactly: on desktop it pins
 * (sticky) and the photo cross-fades to the solid tone as it collapses (shared
 * pin tracking via `useHeroPin`). The consuming page must place the content that
 * scrolls behind it in a sibling with `relative lg:z-0`. Without a photo it's a
 * static tone panel. No fact pills or booking CTA — those stay apartment-only.
 */
export default function EditorialHero({
  title,
  label,
  subtitle,
  tone = 'navy',
  image,
  priority,
}: Props) {
  const color = TONE_HEX[tone];
  const hasImage = !!image;
  // Seed the diagonal from the stega-stripped title so its direction is stable
  // across draft/published and consistent per page, but differs page to page.
  const heroClip = useHeroDiagonal(stripStega(title) || tone);
  // Pin tracking (desktop) — only meaningful with a photo, which fades on pin.
  const { ref, pinned } = useHeroPin<HTMLElement>();
  const isPinned = hasImage && pinned;
  // Copy sits over the photo's gradient (white) or directly on the tone — flip
  // to dark text on a light tone once the photo is gone (no image, or pinned).
  const textDark = (!hasImage || isPinned) && isLightColor(color);

  const copy = (
    <div className="hero-enter relative z-10 w-full">
      {label && (
        <p
          className={[
            'mb-3 font-body text-label uppercase tracking-[0.18em] font-medium transition-colors duration-500',
            textDark ? 'text-dark/70' : 'text-white/80',
          ].join(' ')}
        >
          {label}
        </p>
      )}
      <h1
        className={[
          'font-heading font-semibold text-h1 md:text-hero leading-none max-w-3xl transition-colors duration-500',
          textDark ? 'text-dark' : 'text-white',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: unwrapParagraph(title) }}
      />
      {subtitle && (
        <p
          className={[
            'mt-4 max-w-2xl font-body text-body-lg leading-snug transition-colors duration-500',
            textDark ? 'text-dark/75' : 'text-white/85',
          ].join(' ')}
          // Interpret inline HTML (e.g. <em>/<strong>) instead of printing tags.
          dangerouslySetInnerHTML={{ __html: unwrapParagraph(subtitle) }}
        />
      )}
    </div>
  );

  return (
    <section
      ref={ref}
      className={[
        'relative pb-10 lg:sticky lg:z-30',
        hasImage
          ? `mb-4 lg:mb-14 ${isPinned ? 'md:pb-3.5' : 'md:pb-16'}`
          : // No photo → compact panel that simply stays pinned where it loads
            // (top), with the content scrolling behind it.
            'mb-8 lg:mb-14 md:pb-16 lg:top-0',
      ].join(' ')}
      style={{
        backgroundColor: color,
        marginTop: 'calc(var(--header-height) * -1)',
        // Sticky pin offset (shared with useHeroPin); ignored unless lg:sticky.
        ...(hasImage ? { top: HERO_STICKY_TOP } : null),
        // Shared animated diagonal bottom edge (see useHeroDiagonal). The
        // clip-path + padding transitions live inline so an inline `transition`
        // doesn't override a Tailwind one.
        clipPath: heroClip,
        transition: 'clip-path 700ms cubic-bezier(0.22, 1, 0.36, 1), padding 500ms ease',
      }}
    >
      {/* Dark photo / dark tone → transparent white header until scrolled. */}
      {(hasImage || !isLightColor(color)) && <OverDarkHeader />}

      <div className="md:mx-auto md:max-w-7xl md:px-8">
        {hasImage ? (
          <div
            className={`relative min-h-[calc(58svh-50px)] md:min-h-[calc(68svh-50px)] overflow-hidden md:rounded-card transition-shadow duration-500 ${
              isPinned ? 'md:shadow-none' : 'md:shadow-card-hover'
            }`}
          >
            <ResponsiveImage
              data={image!}
              pictureClassName={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                isPinned ? 'opacity-0' : 'opacity-100'
              }`}
              imgClassName="w-full h-full object-cover object-center"
              imgStyle={{ maxWidth: 'none', height: '100%', aspectRatio: 'unset' }}
              priority={priority}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
                isPinned ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">{copy}</div>
          </div>
        ) : (
          // No photo → no full-size state to collapse from, so the panel opens
          // already at the compact "pinned" size: a content-height copy band
          // with enough top padding to clear the fixed header.
          <div className="px-6 pb-2 pt-[calc(var(--header-height)+2.5rem)] md:px-0 md:pb-4 md:pt-[calc(var(--header-height)+3.5rem)]">
            {copy}
          </div>
        )}
      </div>
    </section>
  );
}
