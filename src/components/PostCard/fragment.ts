import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Blog post card data. Post fields are localized but the blog is legacy EN-only
 * content, so localized fields fall back to `en` (otherwise a null IT slug would
 * break the non-nullable query). Defined in its own file (not the `'use client'`
 * component) so server components can spread it without gql.tada build errors.
 *
 * The featured image is cropped to a horizontal frame on its focal point.
 */
export const PostCardFragment = graphql(
  `
    fragment PostCardFragment on PostRecord {
      id
      title(fallbackLocales: [en])
      slug(fallbackLocales: [en])
      abstract(fallbackLocales: [en])
      category {
        name
      }
      featuredImage {
        responsiveImage(imgixParams: { w: 800, h: 450, fit: crop, crop: focalpoint }) {
          ...ResponsiveImageFragment
        }
      }
      content(fallbackLocales: [en]) {
        value
      }
    }
  `,
  [ResponsiveImageFragment],
);
