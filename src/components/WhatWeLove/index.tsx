'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInView } from '@/hooks/useInView';
import { type FragmentOf, type ResultOf, readFragment } from '@/lib/datocms/graphql';
import ResponsiveImage from '@/components/ResponsiveImage';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import HtmlContent from '@/components/HtmlContent';
import PhotoLightbox from '@/components/PhotoLightbox';
import type { LightboxSlide } from '@/components/Lightbox';

type Props = {
  data: FragmentOf<typeof GalleryImageFragment>[];
  title: string;
  label: string;
  description?: string | null;
  acaciaReward?: boolean | null;
  lightboxSlides?: LightboxSlide[];
};

type Photo = ResultOf<typeof GalleryImageFragment>;

export default function WhatWeLove({
  data,
  title,
  label,
  description,
  acaciaReward,
  lightboxSlides,
}: Props) {
  const tGallery = useTranslations('gallery');
  const headingRef = useInView<HTMLDivElement>();
  const photos = data.map((d) => readFragment(GalleryImageFragment, d));
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const hasPhotos = photos.length >= 2;

  const activeCaption = photos[activeCaptionIndex]?.description;

  const handleHover = (index: number) => {
    if (index === activeCaptionIndex) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsTransitioning(true);
    timeoutRef.current = setTimeout(() => {
      setActiveCaptionIndex(index);
      setIsTransitioning(false);
    }, 250);
  };

  return (
    <div>
      <div ref={headingRef} className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
            {label}
          </p>
          <h2 className="font-heading text-h2 text-dark">
            <em>{title}</em>
          </h2>
        </div>
        {acaciaReward && (
          <div className="shrink-0 flex items-center gap-2 bg-surface-alt border border-border-light rounded-pill px-4 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/acacia-isologo.svg" alt="Acacia Reward" className="w-6 h-6" />
            <span className="font-body text-caption font-medium text-dark tracking-wide">
              Acacia Reward
            </span>
          </div>
        )}
      </div>

      {description && (
        <div className="mb-10">
          <HtmlContent
            html={description}
            className="font-body text-body-lg text-dark leading-relaxed prose-acacia"
          />
        </div>
      )}

      {hasPhotos && (
        <>
          <div className="relative" onMouseLeave={() => setShowCaption(false)}>
            {photos.length === 2 && (
              <TwoUp photos={photos} onHover={handleHover} onEnter={() => setShowCaption(true)} />
            )}
            {photos.length === 3 && (
              <ThreeUp photos={photos} onHover={handleHover} onEnter={() => setShowCaption(true)} />
            )}
            {photos.length === 4 && (
              <FourUp photos={photos} onHover={handleHover} onEnter={() => setShowCaption(true)} />
            )}
            {photos.length === 5 && (
              <FiveUp photos={photos} onHover={handleHover} onEnter={() => setShowCaption(true)} />
            )}
            {photos.length >= 6 && (
              <SixUp photos={photos} onHover={handleHover} onEnter={() => setShowCaption(true)} />
            )}

            {/* Caption overlay — centered on the gallery */}
            {activeCaption && (
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                  showCaption ? 'opacity-100' : 'opacity-0'
                }`}
                aria-live="polite"
              >
                <div
                  className={`bg-dark/85 backdrop-blur-sm rounded-card px-8 py-4 max-w-md mx-4 transition-all duration-500 ease-out ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <p className="font-heading italic text-[1.25rem] leading-snug text-white text-center">
                    {activeCaption}
                  </p>
                </div>
              </div>
            )}
          </div>
          {lightboxSlides && lightboxSlides.length > 0 && (
            <div className="mt-4">
              <PhotoLightbox slides={lightboxSlides} label={tGallery('viewAll')} variant="light" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

type LayoutProps = {
  photos: Photo[];
  onHover: (index: number) => void;
  onEnter: () => void;
};

function PhotoCard({
  photo,
  index,
  onHover,
  onEnter,
  aspect = 'aspect-[4/3]',
}: {
  photo: Photo;
  index: number;
  onHover: (index: number) => void;
  onEnter?: () => void;
  aspect?: string;
}) {
  return (
    <div
      className="group"
      onMouseEnter={() => {
        onHover(index);
        onEnter?.();
      }}
    >
      <div className={`${aspect} relative overflow-hidden bg-surface-alt`}>
        {photo.image?.responsiveImage && (
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <ResponsiveImage
              data={photo.image.responsiveImage}
              pictureClassName="absolute inset-0 w-full h-full"
              imgClassName="w-full h-full object-cover"
              imgStyle={{ maxWidth: 'none', height: '100%', aspectRatio: 'unset' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Two equal columns */
function TwoUp({ photos, onHover, onEnter }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <PhotoCard photo={photos[0]} index={0} onHover={onHover} onEnter={onEnter} />
      <PhotoCard photo={photos[1]} index={1} onHover={onHover} onEnter={onEnter} />
    </div>
  );
}

/** One large left + two stacked right */
function ThreeUp({ photos, onHover, onEnter }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3">
      <PhotoCard
        photo={photos[0]}
        index={0}
        onHover={onHover}
        onEnter={onEnter}
        aspect="aspect-[3/4] md:aspect-auto md:h-full"
      />
      <div className="flex flex-col gap-3">
        <PhotoCard photo={photos[1]} index={1} onHover={onHover} onEnter={onEnter} />
        <PhotoCard photo={photos[2]} index={2} onHover={onHover} onEnter={onEnter} />
      </div>
    </div>
  );
}

/** 2×2 grid */
function FourUp({ photos, onHover, onEnter }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} index={i} onHover={onHover} onEnter={onEnter} />
      ))}
    </div>
  );
}

/** One large spanning top + four smaller below */
function FiveUp({ photos, onHover, onEnter }: LayoutProps) {
  return (
    <div className="space-y-3">
      <PhotoCard
        photo={photos[0]}
        index={0}
        onHover={onHover}
        onEnter={onEnter}
        aspect="aspect-[16/9]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.slice(1, 5).map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={i + 1}
            onHover={onHover}
            onEnter={onEnter}
            aspect="aspect-square"
          />
        ))}
      </div>
    </div>
  );
}

/** 3×2 grid — two rows of three */
function SixUp({ photos, onHover, onEnter }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {photos.slice(0, 6).map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} index={i} onHover={onHover} onEnter={onEnter} />
      ))}
    </div>
  );
}
