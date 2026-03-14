import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

export const DistrictCardFragment = graphql(
  `
    fragment DistrictCardFragment on DistrictsRecord {
      id
      name
      slug
      gallery {
        image {
          responsiveImage(imgixParams: { w: 700, h: 520, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

type Props = {
  data: FragmentOf<typeof DistrictCardFragment>;
  locale: Locale;
};

const discoverLabel = { en: 'Explore →', it: 'Esplora →' } as const;

export default function DistrictCard({ data, locale }: Props) {
  const district = readFragment(DistrictCardFragment, data);
  const coverImage = district.gallery[0]?.image?.responsiveImage;

  return (
    <Link href={`/${locale}/florence/districts/${district.slug}`} className="group block">
      <article
        className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden"
        style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          {coverImage && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={coverImage} />
            </div>
          )}
          <span className="absolute bottom-4 left-4 bg-rust text-white text-tag uppercase tracking-[0.14em] font-semibold px-3 py-1 rounded-pill">
            Firenze
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-heading text-h3 font-semibold text-dark leading-snug mb-4">
            {district.name}
          </h3>
          <p className="font-body text-caption text-muted group-hover:text-rust transition-colors duration-300 font-medium">
            {discoverLabel[locale]}
          </p>
        </div>
      </article>
    </Link>
  );
}
