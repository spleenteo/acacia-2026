'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { useTranslations } from 'next-intl';
import ResponsiveImage from '@/components/ResponsiveImage';
import HtmlContent from '@/components/HtmlContent';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { DistrictCompactCardFragment } from './fragment';
import Link from 'next/link';

type Props = {
  data: FragmentOf<typeof DistrictCompactCardFragment>;
  locale: Locale;
};

/** Compass glyph accompanying the "district" kicker. */
function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/**
 * Reduced district card for a mood's mixed masonry: a square photo beside a
 * compass kicker, the district name, and a short abstract — roughly half the
 * height of the full (overlay, portrait) DistrictCard.
 */
export default function DistrictCompactCard({ data, locale }: Props) {
  const t = useTranslations('districts');
  const district = readFragment(DistrictCompactCardFragment, data);
  // `gallery` is a union (GalleryImage | Post); the cover is the first image block.
  const cover = district.gallery.flatMap((g) =>
    g.__typename === 'GalleryImageRecord' ? [g.image?.responsiveImage] : [],
  )[0];

  return (
    <Link href={modelPath('district', district.slug, locale)!} className="group block">
      <article className="flex gap-4">
        {/* Square photo */}
        {cover && (
          <div className="aspect-square w-28 shrink-0 self-start overflow-hidden rounded-sm sm:w-32">
            <ResponsiveImage
              data={cover}
              className="h-full w-full"
              pictureClassName="h-full w-full object-cover transition-transform duration-700 ease-card group-hover:scale-[1.03]"
            />
          </div>
        )}

        {/* Compass kicker, name, abstract */}
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 flex items-center gap-1.5 font-body text-label uppercase tracking-[0.2em] text-primary font-medium">
            <CompassIcon className="h-3.5 w-3.5 shrink-0" />
            {t('tag')}
          </p>
          <h3 className="font-heading text-h3 font-normal leading-snug text-dark transition-colors duration-300 group-hover:text-primary">
            {district.name}
          </h3>
          {district.abstract && (
            <HtmlContent
              html={district.abstract}
              className="mt-1.5 line-clamp-3 font-body text-body-sm leading-relaxed text-muted [&_p]:m-0"
            />
          )}
        </div>
      </article>
    </Link>
  );
}
