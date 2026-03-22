'use client';

import ResponsiveImage from '@/components/ResponsiveImage';
import Lightbox, { useLightbox, type LightboxSlide } from '@/components/Lightbox';
import type { FragmentOf } from '@/lib/datocms/graphql';
import type { ResponsiveImageFragment } from '@/components/ResponsiveImage';

export type GalleryItem = {
  id: string;
  thumb: FragmentOf<typeof ResponsiveImageFragment>;
  full: FragmentOf<typeof ResponsiveImageFragment>;
  caption?: string | null;
};

type Props = {
  items: GalleryItem[];
  slides: LightboxSlide[];
};

export default function ImageGallery({ items, slides }: Props) {
  const lightbox = useLightbox();

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => lightbox.openAt(index)}
            className="group relative overflow-hidden cursor-pointer aspect-[4/3]"
          >
            <div className="transition-transform duration-500 group-hover:scale-110">
              <ResponsiveImage data={item.thumb} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      <Lightbox
        slides={slides}
        open={lightbox.open}
        index={lightbox.index}
        onClose={lightbox.close}
      />
    </>
  );
}
