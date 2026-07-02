'use client';

import { wonkyClip } from '@/lib/wonkyClip';
import { TONES } from '@/components/WidgetLabel';

/** Light Japan Fish tints, cycled across filters for the hover highlight. */
const FILTER_TINTS = [TONES.sage.bg, TONES.gold.bg, TONES.slate.bg, TONES.rust.bg];

export type FilterOption = { key: string; label: string };

type Props = {
  options: FilterOption[];
  /** The currently active option key. */
  active: string;
  onChange: (key: string) => void;
};

/**
 * Controlled filter bar — the same "wonky-clip" pill row used by the blog's
 * CategoryFilter, but decoupled from any grid so it can sit above a masonry.
 * The parent owns the active state and does the filtering.
 */
export default function FilterBar({ options, active, onChange }: Props) {
  return (
    <div className="mb-10 flex flex-wrap justify-start gap-x-1 gap-y-1">
      {options.map((opt, i) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className="group relative inline-flex cursor-pointer items-center px-3 py-1.5 font-body text-body-sm font-normal tracking-wide"
          >
            {/* Wonky-clip tint that wipes in on hover (and stays for the active filter). */}
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute -inset-x-1 -inset-y-0.5 transition-all duration-300',
                isActive
                  ? 'scale-100 opacity-100'
                  : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100',
              ].join(' ')}
              style={{
                backgroundColor: FILTER_TINTS[i % FILTER_TINTS.length],
                clipPath: wonkyClip(i + 1),
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            <span
              className={[
                'relative transition-colors duration-300',
                isActive ? 'text-dark font-medium' : 'text-muted group-hover:text-dark',
              ].join(' ')}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
