'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { getChannelLogo } from '@/lib/channelLogos';
import ResponsiveImage from '@/components/ResponsiveImage';
import { GuestbookCardFragment } from './fragment';

type Props = {
  data: FragmentOf<typeof GuestbookCardFragment>;
  locale: Locale;
};

/**
 * Review card for the guestbook masonry: small date, serif title (h2), full
 * quote, then the author and a link to the apartment the review is about.
 * Hovering the apartment opens a tooltip (photo, typology, room facts, district)
 * that flips to whichever side has room; hovering the card lifts it and wipes a
 * skewed colour bar behind the author.
 */
export default function GuestbookCard({ data, locale }: Props) {
  const t = useTranslations();
  const review = readFragment(GuestbookCardFragment, data);
  const logo = getChannelLogo(review.channel);
  const apt = review.apartment;
  const aptHref = apt?.slug ? modelPath('apartment', apt.slug, locale) : null;

  // Open the apartment tooltip on whichever side has room (the masonry columns
  // mean a card can sit at either page edge). Measured on hover/focus.
  const aptRef = useRef<HTMLDivElement>(null);
  const [tipSide, setTipSide] = useState<'right' | 'left'>('right');
  const placeTooltip = useCallback(() => {
    const el = aptRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const TOOLTIP_WIDTH = 268; // w-64 (256) + side margin (12)
    setTipSide(window.innerWidth - rect.right >= TOOLTIP_WIDTH ? 'right' : 'left');
  }, []);

  const formattedDate = new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(review.date));

  // "Adelfa, 2 Bedroom Apartment" — name + localized category (the typology).
  const aptLabel = apt ? [apt.name, apt.category?.name].filter(Boolean).join(', ') : null;
  const details = apt
    ? [
        apt.bedrooms != null ? `${apt.bedrooms} ${t('apartment.bedrooms')}` : null,
        apt.bathrooms != null ? `${apt.bathrooms} ${t('apartment.bathrooms')}` : null,
        apt.sleeps != null ? `${t('apartment.sleeps')} ${apt.sleeps}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <blockquote className="group relative flex flex-col rounded-card bg-card p-7 shadow-card transition-all duration-300 hover:z-10 hover:bg-surface-alt hover:shadow-card-hover">
      {/* Date (very small) + channel logo */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <time className="font-body text-fine uppercase tracking-[0.14em] text-light">
          {formattedDate}
        </time>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt={logo.alt} className="h-6 w-6 shrink-0 opacity-80" />
      </div>

      {/* Title — serif h2 lead */}
      {review.title && (
        <h2 className="mb-3 font-heading text-h3 leading-snug text-dark">{review.title}</h2>
      )}

      {/* Quote — shown in full */}
      <p className="mb-5 font-body text-body leading-relaxed text-muted">{review.quote}</p>

      <footer className="border-t border-border-light pt-4">
        {/* Author — a skewed colour bar wipes in behind the name on card hover */}
        <p className="font-body text-body font-medium text-dark">
          <span className="relative inline-block">
            <span
              aria-hidden
              className="absolute -inset-x-1 inset-y-0 -z-10 origin-left -skew-x-6 scale-x-0 rounded-[2px] bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100"
            />
            <span className="relative">{review.name}</span>
          </span>
        </p>

        {/* Apartment link + hover tooltip */}
        {apt && aptHref && aptLabel && (
          <div
            ref={aptRef}
            onMouseEnter={placeTooltip}
            onFocus={placeTooltip}
            className="group/apt relative mt-1 inline-block"
          >
            <Link
              href={aptHref}
              className="inline-flex items-center gap-1.5 font-body text-body-sm font-medium text-primary transition-colors hover:text-primary/70"
            >
              <span aria-hidden className="transition-transform group-hover/apt:translate-x-0.5">
                &rarr;
              </span>
              {aptLabel}
            </Link>

            {/* Tooltip — opens to the side with room (never covers the review text) */}
            <div
              className={[
                'pointer-events-none absolute bottom-0 z-50 w-64 scale-95 opacity-0 transition-all duration-200 group-hover/apt:pointer-events-auto group-hover/apt:scale-100 group-hover/apt:opacity-100',
                tipSide === 'right'
                  ? 'left-full ml-3 origin-bottom-left'
                  : 'right-full mr-3 origin-bottom-right',
              ].join(' ')}
            >
              <div className="overflow-hidden rounded-card bg-card shadow-card-hover ring-1 ring-border">
                {apt.featuredImage?.responsiveImage && (
                  <ResponsiveImage data={apt.featuredImage.responsiveImage} />
                )}
                <div className="p-4">
                  <p className="font-heading text-h4 leading-tight text-dark">{apt.name}</p>
                  {apt.category?.name && (
                    <p className="mt-0.5 font-body text-caption text-muted">{apt.category.name}</p>
                  )}
                  {details && <p className="mt-2 font-body text-caption text-muted">{details}</p>}
                  {apt.district?.name && (
                    <p className="mt-1 font-body text-caption text-light">{apt.district.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </footer>
    </blockquote>
  );
}
