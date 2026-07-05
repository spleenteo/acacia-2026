'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { useTranslations } from 'next-intl';
import CardImage from '@/components/CardImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { ApartmentCardFragment } from './fragment';
import Link from 'next/link';

type Props = {
  data: FragmentOf<typeof ApartmentCardFragment>;
  locale: Locale;
  /** Close the card with a divider — used only in the apartments index list,
   *  where every card is an apartment. Off everywhere else (editorial grids,
   *  mixed masonries) to avoid an inconsistent line under some cards only. */
  divider?: boolean;
};

export default function ApartmentCard({ data, locale, divider = false }: Props) {
  const t = useTranslations('listing');
  const apartment = readFragment(ApartmentCardFragment, data);
  const category = apartment.category?.name;
  const district = apartment.district?.name;

  return (
    <div>
      <Link href={modelPath('apartment', apartment.slug, locale)!} className="group block">
        <article>
          {/* Image — portrait 3:4 */}
          {apartment.featuredImage?.responsiveImage && (
            <CardImage data={apartment.featuredImage.responsiveImage} />
          )}

          {/* Content — no background, blends with page */}
          <div className="pt-4">
            {category && (
              <p className="mb-2 font-body text-label uppercase tracking-[0.18em] text-muted font-medium">
                {district ? t('typeInDistrict', { type: category, district }) : category}
              </p>
            )}
            <h3 className="font-heading text-h3 font-normal leading-snug text-dark transition-colors duration-300 group-hover:text-primary">
              {apartment.name}
              {apartment.claim && (
                <span className="font-normal text-muted">, {apartment.claim}</span>
              )}
            </h3>
          </div>
        </article>
      </Link>

      {/* Divider closing off the card — clearly separates it from the one below. */}
      {divider && <hr className="mt-8 border-t border-border" />}
    </div>
  );
}
