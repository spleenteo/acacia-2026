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
        responsiveImage(imgixParams: { w: 400, h: 300, fit: crop }) {
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

export default function ApartmentCard({ data, locale }: Props) {
  const apartment = readFragment(ApartmentCardFragment, data);

  return (
    <Link
      href={`/${locale}/florence/accommodations/${apartment.slug}`}
      className="group block"
    >
      <div className="border-b border-dotted border-heading mb-8 transition-colors duration-500 hover:bg-cream">
        <div className="overflow-hidden">
          {apartment.boxImage?.responsiveImage && (
            <div className="transition-transform duration-500 group-hover:scale-[1.3]">
              <ResponsiveImage data={apartment.boxImage.responsiveImage} />
            </div>
          )}
        </div>
        <div className="px-4 pb-4">
          {apartment.category && (
            <p className="font-bold text-small my-3 capitalize">{apartment.category.name}</p>
          )}
          <h2 className="font-heading font-extralight text-gamma leading-tight mb-3">
            {apartment.name}
          </h2>
          {apartment.claim && (
            <p className="font-serif italic text-small text-body-light">{apartment.claim}</p>
          )}
          {apartment.highlight && (
            <span className="inline-block bg-secondary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm mt-2">
              {apartment.highlight}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
