import { graphql } from '@/lib/datocms/graphql';

/**
 * Structured Text fragment for the FAQ `answer_structured` field.
 * V1 renders the DAST `value` only. Inline record links (faq/post/page) are
 * added in V2 via `links` + renderInlineRecord/renderLinkToRecord.
 */
export const FaqAnswerFragment = graphql(`
  fragment FaqAnswer on FaqModelAnswerStructuredField {
    value
  }
`);
