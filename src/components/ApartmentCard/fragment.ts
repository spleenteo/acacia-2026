import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Apartment card data. Kept in its own file (not the `'use client'` component)
 * so server components can spread it into queries without gql.tada build errors.
 */
export const ApartmentCardFragment = graphql(
  `
    fragment ApartmentCardFragment on ApartmentRecord {
      id
      name
      slug
      claim(locale: $locale)
      category {
        name(locale: $locale)
      }
      district {
        name
      }
      featuredImage {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
          ...ResponsiveImageFragment
        }
        colors {
          hex
          red
          green
          blue
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
