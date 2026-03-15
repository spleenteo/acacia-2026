'use client';

import ResponsiveImage from '@/components/ResponsiveImage';
import { useCallback, useEffect, useRef, useState } from 'react';
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
};

export default function ImageGallery({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
  }, []);

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close();
    setActiveIndex(null);
  }, []);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      if (activeIndex === null) return;
      const next = (activeIndex + direction + items.length) % items.length;
      setActiveIndex(next);
    },
    [activeIndex, items.length],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, navigate, closeLightbox]);

  if (items.length === 0) return null;

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative overflow-hidden cursor-pointer aspect-[4/3]"
          >
            <div className="transition-transform duration-500 group-hover:scale-110">
              <ResponsiveImage
                data={item.thumb}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full bg-dark/95 backdrop:bg-transparent p-0"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
      >
        {activeItem && (
          <div className="flex items-center justify-center h-full w-full p-4 sm:p-8">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white text-h2 transition-colors cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white text-h1 transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white text-h1 transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  &#8250;
                </button>
              </>
            )}

            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              <ResponsiveImage
                data={activeItem.full}
                className="max-h-[75vh] w-auto object-contain"
              />
              {activeItem.caption && (
                <p className="text-white/70 font-heading italic text-body-sm mt-4 text-center">
                  {activeItem.caption}
                </p>
              )}
              <p className="text-white/40 text-caption mt-2">
                {(activeIndex ?? 0) + 1} / {items.length}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
