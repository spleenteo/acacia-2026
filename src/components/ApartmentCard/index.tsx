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
      highlight(locale: $locale)
      category {
        name(locale: $locale)
      }
      boxImage {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
      featuredImage {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
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
    <Link href={`/${locale}/florence/accommodations/${apartment.slug}`} className="group block">
      <article>
        {/* Image — portrait 3:4, overflow-hidden scoped here only */}
        <div
          className="overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
          style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
        >
          {(apartment.boxImage?.responsiveImage || apartment.featuredImage?.responsiveImage) && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage
                data={
                  (apartment.boxImage?.responsiveImage ?? apartment.featuredImage?.responsiveImage)!
                }
              />
            </div>
          )}
        </div>

        {/* Content — no background, blends with page */}
        <div className="pt-4">
          {apartment.category && (
            <p className="font-body text-caption text-muted font-normal mb-1.5">
              {apartment.category.name}
            </p>
          )}
          <h3 className="font-heading text-h3 font-normal text-dark leading-snug">
            {apartment.name}
          </h3>
          {apartment.highlight && (
            <p className="font-body text-caption text-rust font-normal mt-2">
              {apartment.highlight}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
