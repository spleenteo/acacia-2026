import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import Link from 'next/link';

export const DistrictCardFragment = graphql(
  `
    fragment DistrictCardFragment on DistrictRecord {
      id
      name
      slug
      gallery {
        image {
          responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
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

export default function DistrictCard({ data, locale }: Props) {
  const district = readFragment(DistrictCardFragment, data);
  const coverImage = district.gallery[0]?.image?.responsiveImage;

  return (
    <Link href={modelPath('district', district.slug, locale)!} className="group block">
      <article>
        {/* Image — portrait 3:4, overflow-hidden scoped here only */}
        <div
          className="overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
          style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
        >
          {coverImage && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={coverImage} />
            </div>
          )}
        </div>

        {/* Content — no background, blends with page */}
        <div className="pt-4">
          <h3 className="font-heading text-h3 font-normal text-dark leading-snug">
            {district.name}
          </h3>
        </div>
      </article>
    </Link>
  );
}
