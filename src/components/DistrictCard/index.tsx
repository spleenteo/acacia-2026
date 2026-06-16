'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { useTranslations } from 'next-intl';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { DistrictCardFragment } from './fragment';
import Link from 'next/link';

type Props = {
  data: FragmentOf<typeof DistrictCardFragment>;
  locale: Locale;
};

/**
 * District card — set apart from the other (text-below-image) cards by laying
 * the "District" kicker and the name *over* the photo, on a dark scrim. Photo
 * and name stay the essentials.
 */
export default function DistrictCard({ data, locale }: Props) {
  const t = useTranslations('districts');
  const district = readFragment(DistrictCardFragment, data);
  const coverImage = district.gallery[0]?.image?.responsiveImage;

  return (
    <Link href={modelPath('district', district.slug, locale)!} className="group block">
      <article
        className="relative overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
        style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
      >
        {/* Image — portrait 3:4 */}
        {coverImage && (
          <div
            className="transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
          >
            <ResponsiveImage data={coverImage} />
          </div>
        )}

        {/* Dark scrim so the overlaid text stays legible over any photo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/25 to-transparent"
        />

        {/* Label + name, laid over the photo. */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="mb-1.5 font-body text-label uppercase tracking-[0.22em] text-white/75 font-medium">
            {t('tag')}
          </p>
          <h3 className="font-heading text-h3 font-normal leading-snug text-white">
            {district.name}
          </h3>
        </div>
      </article>
    </Link>
  );
}
