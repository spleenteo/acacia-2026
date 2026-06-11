import { graphql } from '@/lib/datocms/graphql';
import {
  CtaBlogPostFragment,
  ImageBlockFragment,
  ImageGalleryBlockFragment,
  VideoBlockFragment,
} from '@/components/StructuredText/blocksFragment';

/**
 * Structured Text fragment for the FAQ `answer_structured` field.
 * `links` carries the records referenced by inline links (itemLink) and inline
 * embeds (inlineItem) — faq / post / page — so the renderer can build hrefs.
 * `blocks` carries the embedded blocks (image / image gallery / embedded video).
 */
export const FaqAnswerFragment = graphql(
  `
    fragment FaqAnswer on FaqModelAnswerStructuredField {
      value
      blocks {
        __typename
        ...ImageBlockFields
        ...ImageGalleryBlockFields
        ...VideoBlockFields
        ...CtaBlogPostFields
      }
      links {
        __typename
        ... on FaqRecord {
          id
          slug(locale: $locale)
          question(locale: $locale)
        }
        ... on PostRecord {
          id
          slug
          title
        }
        ... on PageRecord {
          id
          slug(locale: $locale)
          title(locale: $locale)
        }
      }
    }
  `,
  [ImageBlockFragment, ImageGalleryBlockFragment, VideoBlockFragment, CtaBlogPostFragment],
);
