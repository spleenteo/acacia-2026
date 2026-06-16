import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import CardImage from '@/components/CardImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import Link from 'next/link';

export const ApartmentCardFragment = graphql(
  `
    fragment ApartmentCardFragment on ApartmentRecord {
      id
      name
      slug
      houseBadge {
        label(locale: $locale)
      }
      category {
        name(locale: $locale)
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
    <Link href={modelPath('apartment', apartment.slug, locale)!} className="group block">
      <article>
        {/* Image — portrait 3:4 */}
        {apartment.featuredImage?.responsiveImage && (
          <CardImage data={apartment.featuredImage.responsiveImage} />
        )}

        {/* Content — no background, blends with page */}
        <div className="pt-4">
          {apartment.category && (
            <p className="font-body text-label uppercase tracking-[0.18em] text-muted font-medium mb-2">
              {apartment.category.name}
            </p>
          )}
          <h3 className="font-heading text-h3 font-normal text-dark leading-snug transition-colors duration-300 group-hover:text-primary">
            {apartment.name}
          </h3>
          {apartment.houseBadge?.label && (
            <p className="font-body text-caption text-primary font-normal mt-2">
              {apartment.houseBadge.label}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
