import { StructuredText } from 'react-datocms/structured-text';
import type { ComponentProps } from 'react';

type Props = {
  /** A DatoCMS structured-text field response — at minimum `{ value }`. */
  data?: { value: unknown } | null;
  className?: string;
};

/**
 * Renders a DatoCMS Structured Text field via react-datocms. Mirrors the
 * `prose prose-acacia` wrapper used by `HtmlContent`, so editorial copy keeps
 * the same typographic rhythm whether it comes from a legacy markdown field or
 * the new structured-text field.
 *
 * The current mood `description` content is plain paragraphs (no blocks, no
 * inline links), so no custom block/link renderers are wired yet — add
 * `renderInlineRecord` / `renderBlock` here when editors start using them.
 */
export default function StructuredTextContent({ data, className }: Props) {
  if (!data?.value) return null;

  return (
    <div className={`prose prose-acacia ${className ?? ''}`}>
      {/* gql.tada types `value` as `unknown` (a JsonField scalar); at runtime it
          is a valid DAST document, so it's handed to react-datocms as-is. */}
      <StructuredText data={data as ComponentProps<typeof StructuredText>['data']} />
    </div>
  );
}
