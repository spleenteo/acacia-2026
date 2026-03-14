import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

export const ApartmentCardFragment = graphql(
  `
    fragment ApartmentCardFragment on ApartmentRecord {
      id
      name
      slug
      claim(locale: $locale)
      highlight(locale: $locale)
      category {
        name(locale: $locale)
      }
      boxImage {
        responsiveImage(imgixParams: { w: 700, h: 520, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

type Props = {
  data: FragmentOf<typeof ApartmentCardFragment>;
  locale: Locale;
};

const discoverLabel = { en: 'Discover →', it: 'Scopri →' } as const;

export default function ApartmentCard({ data, locale }: Props) {
  const apartment = readFragment(ApartmentCardFragment, data);

  return (
    <Link href={`/${locale}/florence/accommodations/${apartment.slug}`} className="group block">
      <article
        className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden"
        style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          {apartment.boxImage?.responsiveImage && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={apartment.boxImage.responsiveImage} />
            </div>
          )}
          {apartment.highlight && (
            <span className="absolute bottom-4 left-4 bg-rust text-white text-tag uppercase tracking-[0.14em] font-semibold px-3 py-1 rounded-pill">
              {apartment.highlight}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {apartment.category && (
            <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
              {apartment.category.name}
            </p>
          )}
          <h3 className="font-heading text-h3 font-semibold text-dark leading-snug mb-2">
            {apartment.name}
          </h3>
          {apartment.claim && (
            <p className="font-body text-body-sm text-muted leading-relaxed mb-4">
              {apartment.claim}
            </p>
          )}
          <p className="font-body text-caption text-muted group-hover:text-rust transition-colors duration-300 font-medium">
            {discoverLabel[locale]}
          </p>
        </div>
      </article>
    </Link>
  );
}
