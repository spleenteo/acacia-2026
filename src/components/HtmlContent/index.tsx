type Props = {
  html: string | null | undefined;
  className?: string;
};

/**
 * Renders HTML content from DatoCMS text fields queried with `markdown: true`.
 * Content comes from a trusted source (DatoCMS), so dangerouslySetInnerHTML is safe.
 *
 * This component will be replaced with a Structured Text renderer
 * when the DatoCMS schema migrates from markdown to Structured Text.
 */
export default function HtmlContent({ html, className }: Props) {
  if (!html) return null;

  return (
    <div
      className={`prose prose-acacia ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
