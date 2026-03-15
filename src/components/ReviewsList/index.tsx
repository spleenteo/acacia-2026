'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Review = {
  id: string;
  name: string;
  title: string | null;
  quote: string;
  date: string;
};

type Props = {
  reviews: Review[];
  label: string;
  title: string;
};

export default function ReviewsList({ reviews, label, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDots = Math.max(1, reviews.length - 2);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth + 24; // gap-6 = 24px
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, totalDots - 1));
  }, [totalDots]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth + 24;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-surface-alt overflow-hidden">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center mb-12">
          <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
            {label}
          </p>
          <h2 className="font-heading text-h2 text-dark">
            <em>{title}</em>
          </h2>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-8 lg:px-[calc((100vw-80rem)/2+2rem)] pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {reviews.map((review) => (
          <blockquote
            key={review.id}
            className="snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-[calc((80rem-4.5rem)/3.4)] bg-card rounded-card p-7 shadow-card flex flex-col"
          >
            <span className="font-heading text-h1 text-rust/20 leading-none select-none">
              &ldquo;
            </span>
            <p className="font-body text-body text-muted leading-relaxed -mt-4 mb-5 flex-1">
              {review.quote}
            </p>
            <footer className="border-t border-border-light pt-4">
              <p className="font-body text-body font-medium text-dark">{review.name}</p>
              {review.title && (
                <p className="font-heading italic text-body-sm text-muted mt-0.5">{review.title}</p>
              )}
              <time className="font-body text-caption text-light mt-1 block">
                {new Date(review.date).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </footer>
          </blockquote>
        ))}
        {/* Spacer for partial peek on right */}
        <div className="shrink-0 w-4" aria-hidden />
      </div>

      {/* Dot indicators */}
      {totalDots > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex ? 'bg-rust w-5' : 'bg-border'
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
