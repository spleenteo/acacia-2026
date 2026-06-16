import { type ComponentProps } from 'react';
import { StructuredText } from 'react-datocms/structured-text';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { makeStructuredTextBlockRenderer } from '@/components/StructuredText/StructuredTextBlocks';

/** A record referenced inline from a FAQ answer (link or embed target). */
type LinkedRecord =
  | { __typename: 'FaqRecord'; id: string; slug: string; question: string }
  | { __typename: 'PageRecord'; id: string; slug: string; title: string };

type Props = {
  /**
   * Already-unmasked structured-text answer (`{ value, blocks, links }`) — the
   * caller reads the short/long fragment and passes the result, so this one
   * component renders either FAQ answer field.
   */
  data: { value: unknown } | null | undefined;
  /** Map of faq record id → its hierarchical URL (ancestry-aware, built from the tree). */
  faqHrefById?: Record<string, string>;
  locale: Locale;
  /** Tailwind classes for the prose container (size/colour); structure stays. */
  className?: string;
};

function hrefFor(
  record: LinkedRecord,
  faqHrefById: Record<string, string>,
  locale: Locale,
): string {
  switch (record.__typename) {
    case 'FaqRecord':
      return faqHrefById[record.id] ?? '#';
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
 * other records (faq/post/page) and embedded blocks (image/gallery/video/CTA).
 * No interactivity → usable in both server and client components.
 */
export default function FaqStructuredText({
  data,
  faqHrefById = {},
  locale,
  className = 'font-body text-body-lg',
}: Props) {
  if (!data?.value) return null;

  return (
    <div className={`prose prose-acacia ${className}`}>
      <StructuredText
        // gql.tada masks the union blocks (id lives inside each block fragment),
        // so cast to the renderer's data type — runtime data carries the ids.
        data={data as unknown as ComponentProps<typeof StructuredText>['data']}
        renderBlock={makeStructuredTextBlockRenderer(locale, faqHrefById)}
        renderLinkToRecord={({ record, children, transformedMeta }) => {
          const href = hrefFor(record as unknown as LinkedRecord, faqHrefById, locale);
          // Unsupported targets (e.g. legacy blog posts with no route) → plain text.
          if (href === '#') return <>{children}</>;
          return (
            <a {...transformedMeta} href={href}>
              {children}
            </a>
          );
        }}
        renderInlineRecord={({ record }) => {
          const r = record as unknown as LinkedRecord;
          const label = labelFor(r);
          if (!label) return null;
          const href = hrefFor(r, faqHrefById, locale);
          return href === '#' ? <span>{label}</span> : <a href={href}>{label}</a>;
        }}
      />
    </div>
  );
}
