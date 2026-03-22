'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import YARLightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export type LightboxSlide = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt?: string;
  caption?: string | null;
};

type LightboxProps = {
  slides: LightboxSlide[];
  open: boolean;
  index?: number;
  onClose: () => void;
};

function parseSrcSet(srcSet: string, originalWidth: number, originalHeight: number) {
  return srcSet.split(',').map((entry) => {
    const [url, descriptor] = entry.trim().split(/\s+/);
    const w = descriptor?.replace('w', '');
    const entryWidth = w ? Number(w) : originalWidth;
    return {
      src: url,
      width: entryWidth,
      height: Math.round((entryWidth / originalWidth) * originalHeight),
    };
  });
}

/**
 * Renders caption + dot indicators + counter below the image.
 * Separated to avoid re-rendering the entire YARL lightbox on index change.
 */
function LightboxOverlay({
  slides,
  currentIndex,
}: {
  slides: LightboxSlide[];
  currentIndex: number;
}) {
  const caption = slides[currentIndex]?.caption;

  return (
    <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
      {caption && (
        <p className="font-heading italic text-body-sm text-white/70 text-center px-4">{caption}</p>
      )}
      {slides.length > 1 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
          <span className="font-body text-caption text-white/40">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * YARL-based lightbox modal with swipe, zoom, counter, lazy loading, and scroll lock.
 * Shared by PhotoLightbox (button trigger) and ImageGallery (grid trigger).
 */
export default function Lightbox({ slides, open, index = 0, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync initial index when lightbox opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(index);
    }
  }, [open, index]);

  // Hide Beddy widget when lightbox is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('lightbox-open');
    } else {
      document.body.classList.remove('lightbox-open');
    }
    return () => document.body.classList.remove('lightbox-open');
  }, [open]);

  const onHandlers = useMemo(
    () => ({
      view: ({ index: i }: { index: number }) => {
        setCurrentIndex(i);
      },
    }),
    [],
  );

  const yarlSlides = useMemo(
    () =>
      slides.map((s) => ({
        src: s.src,
        srcSet: s.srcSet ? parseSrcSet(s.srcSet, s.width, s.height) : undefined,
        width: s.width,
        height: s.height,
        alt: s.alt || '',
      })),
    [slides],
  );

  return (
    <>
      <YARLightbox
        open={open}
        close={onClose}
        index={currentIndex}
        slides={yarlSlides}
        animation={{ fade: 250, swipe: 300 }}
        carousel={{ finite: false, preload: 1 }}
        controller={{ closeOnBackdropClick: true }}
        on={onHandlers}
        render={{
          controls: () => (
            <div ref={overlayRef}>
              <LightboxOverlay slides={slides} currentIndex={currentIndex} />
            </div>
          ),
        }}
        styles={{
          root: { '--yarl__color_backdrop': 'rgba(46, 40, 34, 0.95)' },
        }}
        labels={{
          Previous: 'Precedente',
          Next: 'Successiva',
          Close: 'Chiudi',
        }}
      />
    </>
  );
}

/**
 * Hook for managing lightbox open/close state and active index.
 */
export function useLightbox() {
  const [state, setState] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  const openAt = useCallback((index: number) => {
    setState({ open: true, index });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return { ...state, openAt, close };
}
