import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { MoodCardFragment } from '@/components/MoodCard';

export const homeQuery = graphql(
  `
    query HomeQuery($locale: SiteLocale!) {
      homePage(locale: $locale) {
        title(locale: $locale)
        claim(locale: $locale)
        beddyId
        ctaText(locale: $locale, markdown: true)
        ctaLabel(locale: $locale)
        ctaImage {
          responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        moodsTitle(locale: $locale)
        moods {
          id
          ...MoodCardFragment
        }
        promoTitle(locale: $locale)
        stayText(locale: $locale, markdown: true)
        doText(locale: $locale, markdown: true)
      }
      allApartments(locale: $locale, first: 100) {
        id
        ...ApartmentCardFragment
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment, MoodCardFragment],
);
