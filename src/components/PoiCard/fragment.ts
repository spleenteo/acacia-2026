import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * POI card data. Kept in its own file (not the component) so server components
 * can spread it into queries without gql.tada build errors. Only `name` and
 * `category` are guaranteed; image / instagram / description are optional.
 */
export const PoiCardFragment = graphql(
  `
    fragment PoiCardFragment on PoiRecord {
      id
      name
      nightDay
      instagram
      description
      category {
        name(locale: $locale)
      }
      featuredImage {
        focalPoint {
          x
          y
        }
        responsiveImage(imgixParams: { w: 600, h: 900, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
