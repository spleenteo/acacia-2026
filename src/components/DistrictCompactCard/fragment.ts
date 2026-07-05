import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Compact district card data — the reduced variant shown inside a mood's mixed
 * masonry. Unlike the full DistrictCard it uses a SQUARE cover and carries the
 * `abstract` (rendered below the name). Kept in its own file so server pages can
 * spread it into queries without gql.tada build errors.
 */
export const DistrictCompactCardFragment = graphql(
  `
    fragment DistrictCompactCardFragment on DistrictRecord {
      id
      name
      slug
      abstract(locale: $locale, markdown: true)
      gallery {
        __typename
        ... on GalleryImageRecord {
          image {
            responsiveImage(imgixParams: { w: 400, h: 400, fit: crop }) {
              ...ResponsiveImageFragment
            }
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
