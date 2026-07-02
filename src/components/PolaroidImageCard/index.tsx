'use client';

import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import type { FragmentOf } from '@/lib/datocms/graphql';

type Props = {
  /** Thumbnail responsive-image data (the masked fragment ResponsiveImage unmasks). */
  data: FragmentOf<typeof ResponsiveImageFragment>;
  /** Optional handwritten-feel caption shown in the polaroid's bottom margin. */
  caption?: string | null;
  /** Masonry index — drives the alternating tilt so the photos look scattered. */
  index: number;
  onClick: () => void;
};

/**
 * A gallery image styled as a polaroid: a warm-sand mount that reads against the
 * white section, a thicker bottom margin, a subtle alternating tilt that
 * straightens and lifts on hover, and an enlarged, centred caption. Shared by the
 * district and mood detail pages so the two stay in sync.
 */
export default function PolaroidImageCard({ data, caption, index, onClick }: Props) {
  const tilt = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
  return (
    <button type="button" onClick={onClick} className="group block w-full cursor-pointer text-left">
      <div
        className={`rounded-card bg-surface-warm p-3 pb-6 shadow-card-hover ${tilt} transition-all duration-500 ease-card group-hover:-translate-y-1 group-hover:rotate-0`}
      >
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-card group-hover:scale-[1.03]">
            <ResponsiveImage data={data} />
          </div>
        </div>
        {caption && (
          <p className="pt-4 text-center font-heading italic text-body-lg text-muted">{caption}</p>
        )}
      </div>
    </button>
  );
}
