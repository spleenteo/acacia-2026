import { graphql } from '@/lib/datocms/graphql';

/**
 * Structured Text fragment for the FAQ `answer_structured` field.
 * `links` carries the records referenced by inline links (itemLink) and inline
 * embeds (inlineItem) — faq / post / page — so the renderer can build hrefs.
 */
export const FaqAnswerFragment = graphql(`
  fragment FaqAnswer on FaqModelAnswerStructuredField {
    value
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
`);
