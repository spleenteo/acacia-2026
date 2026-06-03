import type { ReactNode } from 'react';
import WidgetLabel from '@/components/WidgetLabel';

type Tone = 'rust' | 'gold' | 'sage' | 'slate';

type Props = {
  /** Text for the coloured top-label chip. */
  label: ReactNode;
  /** Chip tone from the Japan Fish palette. */
  tone?: Tone;
  /** Optional serif title rendered under the chip. */
  title?: ReactNode;
};

/**
 * Header for a sidebar widget: a coloured label chip and an optional italic
 * serif title. The top margin is larger than the bottom one, so the spacing
 * separates one widget from the next without pushing the title away from its
 * own content. Presentational only → safe in server and client components.
 *
 * The top gap is a margin on mobile/desktop, but a padding inside the tablet
 * (md) two-column layout: CSS multi-column truncates margins at the top of a
 * column, so a margin would misalign the second column's first widget — padding
 * is preserved and keeps both columns' first widgets aligned.
 */
export default function WidgetTitle({ label, tone = 'sage', title }: Props) {
  return (
    <div className="mt-10 mb-5 md:mt-0 md:pt-10 lg:mt-10 lg:pt-0">
      <p className={title ? 'mb-2' : undefined}>
        <WidgetLabel tone={tone}>{label}</WidgetLabel>
      </p>
      {title && <h3 className="font-heading italic text-h3 text-dark">{title}</h3>}
    </div>
  );
}
