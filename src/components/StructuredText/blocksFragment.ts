import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Block fragments for the structured-text fields that allow embedded blocks
 * (FAQ `answer_structured`, Page `structured_text`). The three block models are
 * shared across those fields, so these fragments are written on the concrete
 * block record types and reused under each field's `blocks` union.
 *
 * Note the video block exposes its external video via `embeddedVideo`
 * (api key `embedded_video`) — previously `video`.
 */

export const ImageBlockFragment = graphql(
  `
    fragment ImageBlockFields on ImageBlockRecord {
      __typename
      id
      asset {
        responsiveImage(imgixParams: { w: 1200 }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

export const ImageGalleryBlockFragment = graphql(
  `
    fragment ImageGalleryBlockFields on ImageGalleryBlockRecord {
      __typename
      id
      assets {
        responsiveImage(imgixParams: { w: 1000 }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

export const VideoBlockFragment = graphql(`
  fragment VideoBlockFields on VideoBlockRecord {
    __typename
    id
    embeddedVideo {
      url
      provider
      providerUid
      thumbnailUrl
      title
      width
      height
    }
  }
`);

export const CtaBlogPostFragment = graphql(
  `
    fragment CtaBlogPostFields on CtaBlogPostRecord {
      __typename
      id
      post {
        title
        slug
        abstract
        featuredImage {
          responsiveImage(imgixParams: { w: 360, h: 270, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
