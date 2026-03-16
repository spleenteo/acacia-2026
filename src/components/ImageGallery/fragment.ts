import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

export const GalleryImageFragment = graphql(
  `
    fragment GalleryImageFragment on GalleryImageRecord {
      id
      description(locale: $locale)
      image {
        responsiveImage(imgixParams: { w: 400, h: 300, fit: crop }) {
          ...ResponsiveImageFragment
        }
        full: responsiveImage(imgixParams: { w: 1200, fit: max }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
