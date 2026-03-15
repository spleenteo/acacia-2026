'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { GalleryItem } from '@/components/ImageGallery';

type Props = {
  items: GalleryItem[];
  label: string;
};

export default function PhotoLightbox({ items, label }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openLightbox = () => {
    setActiveIndex(0);
    dialogRef.current?.showModal();
  };

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((prev) => (prev + direction + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!dialogRef.current?.open) return;
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate, closeLightbox]);

  if (items.length === 0) return null;

  const activeItem = items[activeIndex];

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-body text-body-sm font-medium tracking-wide px-5 py-2.5 rounded-pill border border-white/20 transition-all duration-300 cursor-pointer mt-5"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {label}
        <span className="text-white/50 text-caption ml-0.5">{items.length}</span>
      </button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full bg-dark/95 backdrop:bg-transparent p-0"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
      >
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
              {activeIndex + 1} / {items.length}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
