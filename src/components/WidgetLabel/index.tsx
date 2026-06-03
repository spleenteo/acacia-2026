import type { ReactNode } from 'react';

export type Tone = 'rust' | 'gold' | 'sage' | 'slate';

/** Soft Japan Fish chips: a tinted background with the deep hue for the text. */
export const TONES: Record<Tone, { bg: string; fg: string }> = {
  rust: { bg: '#fbe3da', fg: '#9c2602' },
  gold: { bg: '#ffeccb', fg: '#9a6e18' },
  sage: { bg: '#dcebe0', fg: '#3f7757' },
  slate: { bg: '#e3edf1', fg: '#3a5662' },
};

type Props = {
  children: ReactNode;
  tone?: Tone;
};

/**
 * Section/widget label rendered as a coloured chip drawn from the Japan Fish
 * palette, instead of plain coloured text. Presentational only → safe in both
 * server and client components.
 */
export default function WidgetLabel({ children, tone = 'sage' }: Props) {
  const c = TONES[tone];
  return (
    <span
      className="inline-block font-body text-label uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-sm"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}
