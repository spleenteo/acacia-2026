'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import ResponsiveImage from '@/components/ResponsiveImage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GalleryImageFragment } from './fragment';

type Props = {
  data: FragmentOf<typeof GalleryImageFragment>[];
};

export default function ImageGallery({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const images = data.map((d) => readFragment(GalleryImageFragment, d));

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
      const next = (activeIndex + direction + images.length) % images.length;
      setActiveIndex(next);
    },
    [activeIndex, images.length],
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

  if (images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative overflow-hidden cursor-pointer aspect-[4/3]"
          >
            {img.image?.responsiveImage && (
              <div className="transition-transform duration-500 group-hover:scale-110">
                <ResponsiveImage
                  data={img.image.responsiveImage}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-heading/0 group-hover:bg-heading/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full bg-heading/95 backdrop:bg-transparent p-0"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
      >
        {activeImage && (
          <div className="flex items-center justify-center h-full w-full p-4 sm:p-8">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white text-beta transition-colors cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white text-alpha transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white text-alpha transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  &#8250;
                </button>
              </>
            )}

            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              {activeImage.image?.full && (
                <ResponsiveImage
                  data={activeImage.image.full}
                  className="max-h-[75vh] w-auto object-contain"
                />
              )}
              {activeImage.description && (
                <p className="text-white/70 font-serif italic text-small mt-4 text-center">
                  {activeImage.description}
                </p>
              )}
              <p className="text-white/40 text-milli mt-2">
                {(activeIndex ?? 0) + 1} / {images.length}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
