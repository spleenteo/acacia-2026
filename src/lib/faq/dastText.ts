/**
 * Extracts plain text from a DatoCMS Structured Text (DAST) value.
 * Used to build the `FAQPage` JSON-LD (which needs plain question/answer text).
 * Strips zero-width characters (defensive against stega in draft mode).
 */
type DastNode = { value?: string; children?: DastNode[]; type?: string };

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listItem', 'blockquote']);

// Zero-width / invisible code points used by stega encoding (built ASCII-only).
const ZERO_WIDTH = new RegExp('[\\u200B-\\u200F\\u2060\\uFEFF]', 'g');

function walk(node: DastNode, out: string[]): void {
  if (typeof node.value === 'string') out.push(node.value);
  node.children?.forEach((c) => walk(c, out));
  if (node.type && BLOCK_TYPES.has(node.type)) out.push(' ');
}

export function dastToText(value: unknown): string {
  const doc = (value as { document?: DastNode } | null)?.document;
  if (!doc) return '';
  const out: string[] = [];
  walk(doc, out);
  return out.join('').replace(ZERO_WIDTH, '').replace(/\s+/g, ' ').trim();
}
