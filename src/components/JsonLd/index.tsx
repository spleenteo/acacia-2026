/**
 * Renders a JSON-LD structured-data block (`<script type="application/ld+json">`).
 *
 * Server component — meant to be rendered from Server Components (layouts, pages)
 * so the markup is in the initial HTML where crawlers read it (no JS execution).
 *
 * IMPORTANT: any value coming from a DatoCMS text field must be passed through
 * `stripStega()` BEFORE being put into `data` — `JSON.stringify` is a non-render
 * path, so the invisible stega metadata that draft mode embeds would otherwise
 * leak into the serialized JSON. See CLAUDE.md ("Stega encoding & stripStega").
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so a string value can never break out of the <script> element
      // (same hardening used by the FAQ JSON-LD block).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
