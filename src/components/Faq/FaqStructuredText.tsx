import { StructuredText } from 'react-datocms/structured-text';
import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { FaqAnswerFragment } from './answerFragment';

/** A record referenced inline from a FAQ answer (link or embed target). */
type LinkedRecord =
  | { __typename: 'FaqRecord'; id: string; slug: string; question: string }
  | { __typename: 'PostRecord'; id: string; slug: string; title: string }
  | { __typename: 'PageRecord'; id: string; slug: string; title: string };

type Props = {
  data: FragmentOf<typeof FaqAnswerFragment> | null | undefined;
  /** Map of faq record id → its hierarchical URL (ancestry-aware, built from the tree). */
  faqHrefById?: Record<string, string>;
  locale: Locale;
};

function hrefFor(
  record: LinkedRecord,
  faqHrefById: Record<string, string>,
  locale: Locale,
): string {
  switch (record.__typename) {
    case 'FaqRecord':
      return faqHrefById[record.id] ?? '#';
    case 'PostRecord':
      return modelPath('post', record.slug, locale) ?? '#';
    case 'PageRecord':
      return modelPath('page', record.slug, locale) ?? '#';
    default:
      return '#';
  }
}

function labelFor(record: LinkedRecord): string {
  return record.__typename === 'FaqRecord' ? record.question : record.title;
}

/**
 * Renders a FAQ answer (Structured Text), including inline links/embeds to
 * other records (faq/post/page). Editorial body styling tuned for mobile.
 * No interactivity → usable in both server and client components.
 */
export default function FaqStructuredText({ data, faqHrefById = {}, locale }: Props) {
  const answer = data ? readFragment(FaqAnswerFragment, data) : null;
  if (!answer?.value) return null;

  return (
    <div className="font-body text-body-lg text-body leading-relaxed [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-rust [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-rust-hover">
      <StructuredText
        data={answer}
        renderLinkToRecord={({ record, children, transformedMeta }) => (
          <a
            {...transformedMeta}
            href={hrefFor(record as unknown as LinkedRecord, faqHrefById, locale)}
          >
            {children}
          </a>
        )}
        renderInlineRecord={({ record }) => {
          const r = record as unknown as LinkedRecord;
          return <a href={hrefFor(r, faqHrefById, locale)}>{labelFor(r)}</a>;
        }}
      />
    </div>
  );
}
