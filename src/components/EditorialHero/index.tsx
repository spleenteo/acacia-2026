'use client';

import type { FragmentOf } from '@/lib/datocms/graphql';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { OverDarkHeader } from '@/components/HeaderTheme';
import { useHeroDiagonal } from '@/lib/useHeroDiagonal';
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
 * No sticky pin, fact pills, or booking CTA — use it on section / index pages;
 * the apartment detail page keeps its own richer hero.
 */
export default function EditorialHero({ title, label, tone = 'navy', image, priority }: Props) {
  const color = TONE_HEX[tone];
  const hasImage = !!image;
  // Seed the diagonal from the stega-stripped title so its direction is stable
  // across draft/published and consistent per page, but differs page to page.
  const heroClip = useHeroDiagonal(stripStega(title) || tone);
  // Copy sits over the photo's gradient (white) or directly on the tone — flip
  // to dark text on a light tone when there's no photo to darken behind it.
  const textDark = !hasImage && isLightColor(color);

  const copy = (
    <div className="relative z-10 w-full">
      {label && (
        <p
          className={[
            'mb-3 font-body text-label uppercase tracking-[0.18em] font-medium',
            textDark ? 'text-dark/70' : 'text-white/80',
          ].join(' ')}
        >
          {label}
        </p>
      )}
      <h1
        className={[
          'font-heading font-semibold text-h1 md:text-hero leading-none max-w-3xl',
          textDark ? 'text-dark' : 'text-white',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: unwrapParagraph(title) }}
      />
    </div>
  );

  return (
    <section
      className="relative mb-8 lg:mb-14 pb-10 md:pb-16"
      style={{
        backgroundColor: color,
        marginTop: 'calc(var(--header-height) * -1)',
        // Shared animated diagonal bottom edge (see useHeroDiagonal). The
        // clip-path transition lives inline so it isn't overridden by Tailwind.
        clipPath: heroClip,
        transition: 'clip-path 700ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Dark photo / dark tone → transparent white header until scrolled. */}
      {(hasImage || !isLightColor(color)) && <OverDarkHeader />}

      <div className="md:mx-auto md:max-w-7xl md:px-8">
        {hasImage ? (
          <div className="relative flex min-h-[58svh] md:min-h-[68svh] items-end overflow-hidden md:rounded-card md:shadow-card-hover">
            <ResponsiveImage
              data={image!}
              pictureClassName="absolute inset-0 w-full h-full"
              imgClassName="w-full h-full object-cover object-center"
              imgStyle={{ maxWidth: 'none', height: '100%', aspectRatio: 'unset' }}
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 w-full p-6 md:p-10">{copy}</div>
          </div>
        ) : (
          <div className="flex min-h-[46svh] md:min-h-[54svh] items-end px-6 pb-2 pt-24 md:px-0 md:pb-6">
            {copy}
          </div>
        )}
      </div>
    </section>
  );
}
