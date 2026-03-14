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
          responsiveImage(imgixParams: { w: 400, h: 300, fit: crop }) {
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
    <Link href={`/${locale}/florence/districts/${district.slug}`} className="group block">
      <div className="border-b border-dotted border-heading mb-8 transition-colors duration-500 hover:bg-cream">
        <div className="overflow-hidden">
          {coverImage && (
            <div className="transition-transform duration-500 group-hover:scale-[1.3]">
              <ResponsiveImage data={coverImage} />
            </div>
          )}
        </div>
        <div className="px-4 pb-4 pt-3">
          <h2 className="font-heading font-extralight text-gamma leading-tight">{district.name}</h2>
        </div>
      </div>
    </Link>
  );
}
