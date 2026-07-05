'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { stripStega } from 'react-datocms/stega';
import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { pickHeroColor, isLightColor } from '@/lib/heroColor';
import ResponsiveImage from '@/components/ResponsiveImage';
import { ReviewSpotlightFragment } from './fragment';

type Props = {
  data: FragmentOf<typeof ReviewSpotlightFragment>;
  locale: Locale;
};

/**
 * Detects whether the user asked for reduced motion (client-only). Returns
 * `false` on the server / first paint so SSR markup is stable.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return reduced;
}

/**
 * Fires `true` once when the element scrolls well into view (and stays true),
 * driving both the diagonal wipe-in and the typewriter start.
 */
function useEnteredView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-25% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, entered };
}

/**
 * Types `text` out character by character once `start` is true. Until then the
 * visible string is empty (the full text always lives in an sr-only node, so
 * screen readers and no-JS render get the whole quote). When reduced motion is
 * requested the full text shows immediately.
 */
function useTypewriter(text: string, start: boolean, reduced: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Driving a timer-based animation from an effect is the "synchronise with an
    // external system" case the set-state-in-effect rule explicitly exempts.
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(text.length);
      return;
    }
    if (!start) return;
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [text, start, reduced]);
  return { typed: text.slice(0, count), done: count >= text.length };
}

// Diagonal panel (desktop): a flat vertical edge that wipes into a slanted one,
// echoing the hero's animated clip-path. Mirrored to the LEFT edge of the panel.
const PANEL_FLAT = 'polygon(49% 0, 100% 0, 100% 100%, 49% 100%)';
const PANEL_SLANT = 'polygon(58% 0, 100% 0, 100% 100%, 40% 100%)';

export default function ReviewSpotlight({ data, locale }: Props) {
  const t = useTranslations('reviewSpotlight');
  const review = readFragment(ReviewSpotlightFragment, data);
  const apt = review.apartment;

  const { ref, entered } = useEnteredView<HTMLElement>();
  const reduced = usePrefersReducedMotion();

  // `quote` crosses into non-render logic (slicing/length for the typewriter),
  // so it must be stega-stripped — raw stega would corrupt the character counts.
  const quote = stripStega(review.quote) ?? '';
  const { typed, done } = useTypewriter(quote, entered, reduced);

  const aptHref = apt?.slug ? modelPath('apartment', apt.slug, locale) : null;
  const formattedDate = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(review.date));

  // Panel tone drawn from the apartment photo's palette — same logic as the
  // apartment hero (pickHeroColor). Only the right-hand column sits on it, so
  // its text/CTA flip to light when the tone is dark (desktop only; on mobile
  // the panel is hidden and everything sits on the light ground).
  const panelColor = pickHeroColor(apt?.featuredImage?.colors);
  const panelDark = !isLightColor(panelColor);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-surface py-20 lg:py-0"
    >
      {/* Full-bleed colour panel with the animated diagonal LEFT edge (desktop).
          Background tone comes from the apartment photo's palette. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{
          backgroundColor: panelColor,
          clipPath: entered && !reduced ? PANEL_SLANT : reduced ? PANEL_SLANT : PANEL_FLAT,
          transition: 'clip-path 800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-2 lg:gap-16">
        {/* LEFT — the review, on the light ground */}
        <blockquote className="max-w-xl">
          <p className="mb-5 font-body text-label uppercase tracking-[0.2em] text-primary">
            {t('label')}
          </p>

          {review.title && (
            <h2 className="mb-5 font-heading text-h2 italic leading-tight text-dark">
              {review.title}
            </h2>
          )}

          {/* The full quote stays available to assistive tech / no-JS; the
              visible copy is typed in. min-height reserves space so the caret
              doesn't shift the layout as it fills. */}
          <span className="sr-only">{quote}</span>
          <p
            aria-hidden
            className="min-h-[7.5rem] font-body text-body-lg leading-relaxed text-muted sm:min-h-[6rem]"
          >
            {typed}
            <span
              className={[
                'ml-0.5 inline-block w-[2px] -translate-y-[2px] self-center bg-primary align-middle',
                'h-[1.05em]',
                done ? 'animate-pulse opacity-0' : 'animate-pulse',
              ].join(' ')}
            />
          </p>

          <footer className="mt-8 font-body text-body-sm text-muted">
            <span aria-hidden>— </span>
            <span className="font-medium text-dark">{review.name}</span>
            {`, ${formattedDate}`}
          </footer>
        </blockquote>

        {/* RIGHT — the related apartment. Compact horizontal row on mobile
            (small photo + details beside it); large centred column on desktop,
            sitting over the colour panel. */}
        {apt && (
          <div className="flex flex-row items-center gap-5 text-left lg:flex-col lg:items-center lg:gap-0 lg:text-center">
            {apt.featuredImage?.responsiveImage && (
              <div className="shrink-0 rotate-[-3deg] rounded-sm bg-white p-2 shadow-card-hover transition-transform duration-500 hover:rotate-0 lg:p-3">
                <div className="aspect-square w-28 overflow-hidden rounded-[2px] sm:w-32 lg:w-[24rem]">
                  <ResponsiveImage
                    data={apt.featuredImage.responsiveImage}
                    className="h-full w-full"
                    pictureClassName="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Details — name leads on mobile (order-1), category leads on
                desktop as a kicker (lg:order-1), via flex order. */}
            <div className="flex min-w-0 flex-col lg:items-center">
              {apt.category?.name && (
                <p
                  className={[
                    'order-2 mt-1.5 font-body text-label uppercase tracking-[0.18em] lg:order-1 lg:mt-7',
                    'text-muted',
                    panelDark ? 'lg:text-white/70' : 'lg:text-dark/60',
                  ].join(' ')}
                >
                  {apt.category.name}
                </p>
              )}
              <p
                className={[
                  'order-1 font-heading text-h2 leading-tight lg:order-2 lg:mt-1.5',
                  'text-dark',
                  panelDark ? 'lg:text-white' : 'lg:text-dark',
                ].join(' ')}
              >
                {apt.name}
                {apt.claim && (
                  <span
                    className={[
                      'font-normal text-muted',
                      panelDark ? 'lg:text-white/70' : 'lg:text-dark/60',
                    ].join(' ')}
                  >
                    , {apt.claim}
                  </span>
                )}
              </p>

              {aptHref && (
                <Link
                  href={aptHref}
                  aria-label={`${t('cta')} — ${stripStega(apt.name) ?? ''}`}
                  className={[
                    'order-3 mt-4 inline-flex w-fit items-center rounded-pill px-8 py-3.5 font-body text-caption font-medium tracking-[0.06em] transition-colors duration-300 lg:mt-6',
                    'bg-primary text-white hover:bg-primary-hover',
                    panelDark ? 'lg:bg-white lg:text-dark lg:hover:bg-white/85' : '',
                  ].join(' ')}
                >
                  {t('cta')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
