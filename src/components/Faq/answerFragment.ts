import { graphql } from '@/lib/datocms/graphql';
import {
  CtaBlogPostFragment,
  ImageBlockFragment,
  ImageGalleryBlockFragment,
  VideoBlockFragment,
} from '@/components/StructuredText/blocksFragment';

/**
 * Structured Text fragments for the FAQ answer fields. The model now has two
 * identical structured-text fields: `short_answer` (the concise TL;DR, shown
 * highlighted at the top) and `long_answer` (the full write-up). Both carry the
 * same blocks (image / gallery / video / blog CTA) and inline links
 * (faq / post / landing page), so the selection is mirrored on each field type.
 */

export const FaqShortAnswerFragment = graphql(
  `
    fragment FaqShortAnswer on FaqModelShortAnswerField {
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
        # Every linked record (incl. legacy posts with no route) exposes its id
        # via RecordInterface, so the Structured Text renderer always finds the
        # itemLink target in the links array and won't throw on unsupported types.
        ... on RecordInterface {
          id
        }
        ... on FaqRecord {
          id
          slug(locale: $locale)
          question(locale: $locale)
        }
        ... on LandingPageRecord {
          id
          slug(locale: $locale)
          title(locale: $locale)
        }
      }
    }
  `,
  [ImageBlockFragment, ImageGalleryBlockFragment, VideoBlockFragment, CtaBlogPostFragment],
);

export const FaqLongAnswerFragment = graphql(
  `
    fragment FaqLongAnswer on FaqModelLongAnswerField {
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
        # Every linked record (incl. legacy posts with no route) exposes its id
        # via RecordInterface, so the Structured Text renderer always finds the
        # itemLink target in the links array and won't throw on unsupported types.
        ... on RecordInterface {
          id
        }
        ... on FaqRecord {
          id
          slug(locale: $locale)
          question(locale: $locale)
        }
        ... on LandingPageRecord {
          id
          slug(locale: $locale)
          title(locale: $locale)
        }
      }
    }
  `,
  [ImageBlockFragment, ImageGalleryBlockFragment, VideoBlockFragment, CtaBlogPostFragment],
);
