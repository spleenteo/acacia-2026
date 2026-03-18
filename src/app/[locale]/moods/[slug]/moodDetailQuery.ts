import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';

export const moodDetailQuery = graphql(
  `
    query MoodDetailQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name(locale: $locale)
        slug(locale: $locale)
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        image {
          responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        boxes {
          id
          object {
            ... on ApartmentRecord {
              __typename
              id
              ...ApartmentCardFragment
            }
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment],
);
