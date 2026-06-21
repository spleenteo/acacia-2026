'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type DockItem = { id: string; label: string };

type Props = {
  /** Sections to navigate, in document order. `id` must match a section's id. */
  items: DockItem[];
};

// Magnification falloff (px) and the extra width a marker gains at the cursor.
const SIGMA = 56;
const REST_W = 30;
const MAX_EXTRA = 64;
// A marker reveals its label when the cursor is this close to its centre.
const FOCUS_RADIUS = 34;

/**
 * Fixed scroll-spy dock pinned to the right edge, vertically centred. Each
 * section is a small marker; the one currently in view is accent-coloured.
 * Hovering magnifies the markers macOS-dock style (a proximity wave) and the
 * marker nearest the cursor genies its section name out to the left. Clicking
 * smooth-scrolls to the section. Desktop only — hidden below `lg`.
 */
export default function SectionDock({ items }: Props) {
  const [active, setActive] = useState(0);
  const [cursorY, setCursorY] = useState<number | null>(null);
  // Rest-state vertical centre of each marker (viewport coords; stable under
  // scroll because the dock is fixed). Kept in state so the magnification maths
  // can read it during render; remeasured on mount and resize only, so growing
  // markers don't feed back into the proximity wave.
  const [centers, setCenters] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const rafRef = useRef(0);

  const measure = useCallback(() => {
    setCenters(
      itemRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      }),
    );
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, items.length]);

  // Scroll-spy: a section is active while it crosses the viewport's middle band.
  useEffect(() => {
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.dockIndex);
          if (e.isIntersecting) ratios.set(idx, e.intersectionRatio);
          else ratios.delete(idx);
        }
        if (ratios.size > 0) setActive(Math.min(...ratios.keys()));
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 1] },
    );
    items.forEach((it, i) => {
      const el = document.getElementById(it.id);
      if (el) {
        el.dataset.dockIndex = String(i);
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [items]);

  const onMove = (e: React.MouseEvent) => {
    const y = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setCursorY(y));
  };
  const onLeave = () => {
    cancelAnimationFrame(rafRef.current);
    setCursorY(null);
  };

  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Marker nearest the cursor (within FOCUS_RADIUS) reveals its label.
  let focusIdx = -1;
  if (cursorY != null) {
    let best = FOCUS_RADIUS;
    centers.forEach((c, i) => {
      const d = Math.abs(c - cursorY);
      if (d < best) {
        best = d;
        focusIdx = i;
      }
    });
  }

  return (
    <nav
      aria-label="Section navigation"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex"
    >
      {items.map((item, i) => {
        const center = centers[i];
        const boost =
          cursorY != null && center != null
            ? Math.exp(-((cursorY - center) ** 2) / (2 * SIGMA * SIGMA))
            : 0;
        const width = REST_W + MAX_EXTRA * boost;
        const isActive = i === active;
        const isFocus = i === focusIdx;
        return (
          <a
            key={item.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={`#${item.id}`}
            onClick={jumpTo(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'true' : undefined}
            className="group relative flex h-5 items-center justify-end"
          >
            {/* Genie label — slides out to the left for the marker under the cursor. */}
            <span
              aria-hidden
              className={[
                'pointer-events-none absolute right-full mr-4 whitespace-nowrap font-heading text-h4 italic text-primary',
                'transition-all duration-300 ease-out',
                isFocus ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0',
              ].join(' ')}
            >
              {item.label}
            </span>

            {/* The marker bar. Width is driven per-frame by cursor proximity;
                a short transition smooths entry/exit and the rest state. */}
            <span
              className={[
                'h-1.5 rounded-full transition-[background-color,height] duration-300',
                isActive || isFocus ? 'bg-primary' : 'bg-dark/15 group-hover:bg-dark/25',
                isActive ? 'h-2' : '',
              ].join(' ')}
              style={{ width: `${width}px` }}
            />
          </a>
        );
      })}
    </nav>
  );
}
