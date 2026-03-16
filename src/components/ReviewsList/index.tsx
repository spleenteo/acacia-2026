'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '@/components/Modal';

type Review = {
  id: string;
  name: string;
  title: string | null;
  quote: string;
  date: string;
  channel: string | null;
};

type Props = {
  reviews: Review[];
  label: string;
  title: string;
};

const channelLogos: Record<string, { src: string; alt: string }> = {
  booking: { src: '/booking-logo.svg', alt: 'Booking.com' },
  airbnb: { src: '/airbnb-logo.svg', alt: 'Airbnb' },
};

const defaultLogo = { src: '/acacia-isologo.svg', alt: 'Acacia Firenze' };

function getChannelLogo(channel: string | null) {
  if (!channel) return defaultLogo;
  return channelLogos[channel.toLowerCase()] ?? defaultLogo;
}

export default function ReviewsList({ reviews, label, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const totalDots = Math.max(1, reviews.length - 2);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth + 24;
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
    <>
      <section className="py-20 lg:py-28 bg-surface-alt overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-8">
            <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
              {label}
            </p>
            <h2 className="font-heading text-h2 text-dark">
              <em>{title}</em>
            </h2>
          </div>

          {/* Platform badges */}
          <div className="flex justify-center items-center gap-4 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder-booking-score.svg"
              alt="Booking.com score"
              className="h-10 md:h-12 w-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder-airbnb-superhost.svg"
              alt="Airbnb Superhost"
              className="h-10 md:h-12 w-auto"
            />
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-5 md:px-8 lg:px-[calc((100vw-80rem)/2+2rem)] pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {reviews.map((review) => {
            const logo = getChannelLogo(review.channel);
            return (
              <blockquote
                key={review.id}
                className="snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-[calc((80rem-4.5rem)/3.4)] bg-card rounded-card p-7 shadow-card flex flex-col cursor-pointer hover:shadow-card-hover transition-shadow duration-300"
                onClick={() => setSelectedReview(review)}
              >
                {/* Channel logo + opening quote */}
                <div className="flex justify-between items-start mb-3">
                  <span className="font-heading text-h1 text-rust/20 leading-none select-none">
                    &ldquo;
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.src} alt={logo.alt} className="w-6 h-6 opacity-40" />
                </div>

                {/* Quote — truncated to 5 lines */}
                <p className="font-body text-body text-muted leading-relaxed -mt-4 mb-5 flex-1 line-clamp-5">
                  {review.quote}
                </p>

                <footer className="border-t border-border-light pt-4">
                  <p className="font-body text-body font-medium text-dark">{review.name}</p>
                  {review.title && (
                    <p className="font-heading italic text-body-sm text-muted mt-0.5">
                      {review.title}
                    </p>
                  )}
                  <time className="font-body text-caption text-light mt-1 block">
                    {new Date(review.date).toLocaleDateString('en-GB', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </footer>
              </blockquote>
            );
          })}
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

      {/* Review detail modal */}
      <Modal open={!!selectedReview} onClose={() => setSelectedReview(null)}>
        {selectedReview && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-heading text-hero text-rust/20 leading-none select-none">
                &ldquo;
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getChannelLogo(selectedReview.channel).src}
                alt={getChannelLogo(selectedReview.channel).alt}
                className="w-8 h-8 opacity-40"
              />
            </div>
            <p className="font-body text-body-lg text-muted leading-relaxed -mt-6 mb-8">
              {selectedReview.quote}
            </p>
            <footer className="border-t border-border-light pt-5">
              <p className="font-body text-body-lg font-medium text-dark">{selectedReview.name}</p>
              {selectedReview.title && (
                <p className="font-heading italic text-body text-muted mt-1">
                  {selectedReview.title}
                </p>
              )}
              <time className="font-body text-caption text-light mt-2 block">
                {new Date(selectedReview.date).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </footer>
          </div>
        )}
      </Modal>
    </>
  );
}
