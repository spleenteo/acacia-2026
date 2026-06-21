import { Fragment, type ReactNode } from 'react';

/**
 * DatoCMS Site Search returns highlight fragments with matched terms wrapped in
 * `[h]…[/h]` markers. Render them as React nodes (plain text + `<mark>`) — no
 * `dangerouslySetInnerHTML`, since the fragment is plain text plus these
 * markers. `<mark>` uses the structured-text highlight token (`rust-pale`).
 */
export function renderHighlight(text: string): ReactNode {
  const parts = text.split(/\[h\]|\[\/h\]/);
  return parts.map((part, i) =>
    // Odd indices are the segments that were between [h] and [/h].
    i % 2 === 1 ? (
      <mark key={i} className="rounded-[2px] bg-rust-pale px-0.5 text-dark">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
