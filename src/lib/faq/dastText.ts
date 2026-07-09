import { stripStega } from 'react-datocms/stega';

/**
 * Extracts plain text from a DatoCMS Structured Text (DAST) value.
 * Used to build the `FAQPage` JSON-LD (which needs plain question/answer text).
 * Strips stega metadata (draft mode) via `stripStega`, which knows the full
 * encoding alphabet — a hand-rolled zero-width regex would miss part of it
 * (U+2061–2063 and the astral U+1D173–1D17A range).
 */
type DastNode = { value?: string; children?: DastNode[]; type?: string };

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listItem', 'blockquote']);

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
  return stripStega(out.join('')).replace(/\s+/g, ' ').trim();
}
