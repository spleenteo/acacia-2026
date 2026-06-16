import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * District card data. Kept in its own file (not the `'use client'` component) so
 * server components can spread it without gql.tada build errors.
 */
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
