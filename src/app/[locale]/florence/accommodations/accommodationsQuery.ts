import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';

export const accommodationsQuery = graphql(
  `
    query AccommodationsQuery($locale: SiteLocale!) {
      pageApartments(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        intro(locale: $locale, markdown: true)
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 500, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
      allApartmentCategories(locale: $locale, orderBy: [position_ASC]) {
        id
        name(locale: $locale)
        slug
      }
      allApartments(locale: $locale, first: 100, orderBy: [name_ASC]) {
        id
        category {
          slug
        }
        ...ApartmentCardFragment
      }
      homePage(locale: $locale) {
        beddyId
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment],
);
