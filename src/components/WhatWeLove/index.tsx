'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInView } from '@/hooks/useInView';
import { type FragmentOf, type ResultOf, readFragment } from '@/lib/datocms/graphql';
import ResponsiveImage from '@/components/ResponsiveImage';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import HtmlContent from '@/components/HtmlContent';
import PhotoLightbox from '@/components/PhotoLightbox';
import { isLightColor } from '@/lib/heroColor';
import { wonkyClip } from '@/lib/wonkyClip';
import type { LightboxSlide } from '@/components/Lightbox';

type Props = {
  data: FragmentOf<typeof GalleryImageFragment>[];
  title: string;
  label: string;
  description?: string | null;
  lightboxSlides?: LightboxSlide[];
};

type Photo = ResultOf<typeof GalleryImageFragment>;

export default function WhatWeLove({ data, title, label, description, lightboxSlides }: Props) {
  const tGallery = useTranslations('gallery');
  const headingRef = useInView<HTMLDivElement>();
  const photos = data.map((d) => readFragment(GalleryImageFragment, d));

  return (
    <div>
      {/* Title only — the "What We Love" kicker now sits with the gallery it
          labels (below), letting the heading rise into the reclaimed space. */}
      <div ref={headingRef} className="mb-6">
        <h2 className="font-heading text-h2 text-dark">
          <em>{title}</em>
        </h2>
      </div>

      {description && (
        <div className="mb-16 md:mb-24">
          <HtmlContent
            html={description}
            className="font-body text-body-lg text-dark leading-relaxed prose-acacia"
          />
        </div>
      )}

      {/* Vertical, alternating photo flow — every wwl_gallery image, left/right.
          The "What We Love" kicker labels this gallery directly. */}
      {photos.length > 0 && (
        <>
          <p className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium mb-6">
            {label}
          </p>
          <div className="space-y-10 md:space-y-20">
            {photos.map((photo, i) => (
              <ZigZagItem key={photo.id} photo={photo} isRight={i % 2 === 1} index={i} />
            ))}
          </div>
        </>
      )}

      {lightboxSlides && lightboxSlides.length > 0 && (
        <div className="mt-12">
          <PhotoLightbox slides={lightboxSlides} label={tGallery('viewAll')} variant="light" />
        </div>
      )}
    </div>
  );
}

/**
 * One photo in the alternating vertical flow. Even items sit left, odd items
 * right. The optional description floats over the inner edge in a box whose
 * background is the image's DatoCMS `bgColor` (text contrast adapts to it),
 * with a serif face and a slightly skewed shape. It fades + slides + pops in
 * (overshoot easing) only once the photo is essentially fully in view.
 */
function ZigZagItem({ photo, isRight, index }: { photo: Photo; isRight: boolean; index: number }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal when the photo is essentially fully visible, or — for photos
        // taller than the viewport — when it fills most of the screen. Reset
        // once it has fully scrolled out of view (e.g. scrolling back to the
        // top), so the reveal replays the next time it scrolls into view.
        if (
          entry.intersectionRatio >= 0.98 ||
          entry.intersectionRect.height >= window.innerHeight * 0.9
        ) {
          setVisible(true);
        } else if (!entry.isIntersecting) {
          setVisible(false);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.98, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const full = photo.image?.full;
  const bg = full?.bgColor ?? '#eaf2f1';
  const textClass = isLightColor(bg) ? 'text-dark' : 'text-white';

  return (
    <div className={`relative md:w-[72%] ${isRight ? 'md:ml-auto' : 'md:mr-auto'}`}>
      <div ref={imgRef}>
        {full && (
          <ResponsiveImage
            data={full}
            pictureClassName="block w-full"
            imgClassName="w-full h-auto"
          />
        )}
      </div>

      {photo.description && (
        <div
          style={{
            backgroundColor: bg,
            clipPath: wonkyClip(index + 1),
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className={[
            'absolute top-6 z-10 max-w-[15rem] md:max-w-xs px-7 py-5',
            isRight ? 'left-0 md:-left-10' : 'right-0 md:-right-10',
            'transition-all duration-700',
            textClass,
            visible
              ? 'opacity-100 translate-x-0 scale-100'
              : `opacity-0 scale-95 ${isRight ? '-translate-x-6' : 'translate-x-6'}`,
          ].join(' ')}
        >
          <p className="font-heading text-h4 leading-snug">{photo.description}</p>
        </div>
      )}
    </div>
  );
}
