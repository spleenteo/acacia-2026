import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { RelatedFaqCardFragment } from '@/components/RelatedFaqCard';

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

// NOTE: `cta_blog_post.post` links to the LEGACY blog model (modular `content`,
// has an `abstract`), not the new `PostRecord`. Keep `abstract` here.
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

/**
 * FAQ block — embeds a single FAQ record, rendered as the coloured
 * question + short-answer card (same look as the mood page's related-FAQ box).
 * The destination URL is resolved by the caller from the FAQ tree.
 */
export const CtaFaqFragment = graphql(
  `
    fragment CtaFaqFields on CtaFaqRecord {
      __typename
      id
      faq {
        id
        ...RelatedFaqCardFragment
      }
    }
  `,
  [RelatedFaqCardFragment],
);

/**
 * Button block — a styled CTA whose `button` single-block carries the label and
 * a polymorphic link. Only the presence is queried here; full link resolution
 * isn't wired into the renderer yet, so it renders nothing for now.
 */
export const ButtonBlockFragment = graphql(`
  fragment ButtonBlockFields on ButtonBlockRecord {
    __typename
    id
  }
`);
