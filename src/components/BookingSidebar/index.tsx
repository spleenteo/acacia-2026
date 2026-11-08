'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/components/BookingModal';

const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};
const hasScrolled = () => window.scrollY > 0;
const notScrolledOnServer = () => false;

type Props = {
  name: string;
  district?: string | null;
  bathrooms?: number | null;
  sleeps?: number | null;
  highlight?: string | null;
  acaciaReward?: boolean | null;
  /** Apartment-specific Beddy widget code for the booking modal. */
  beddyId?: string | null;
};

export default function BookingSidebar({
  name,
  district,
  bathrooms,
  sleeps,
  highlight,
  acaciaReward,
  beddyId,
}: Props) {
  const t = useTranslations('apartment');
  const { open } = useBooking();
  const isBottomBarVisible = useSyncExternalStore(
    subscribeToScroll,
    hasScrolled,
    notScrolledOnServer,
  );

  const scrollToBooking = () => open({ widgetCode: beddyId, source: 'apartment' });

  const details = [
    sleeps ? `${sleeps} ${t('sleepsWord')}` : null,
    bathrooms ? `${bathrooms} ${t('bathWord', { count: bathrooms })}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      {/* Desktop CTA now lives inside the (sticky) hero — see ApartmentDetailContent. */}

      {/* ── Mobile Bottom Bar ── slides in as soon as the page scrolls, so the
          first view stays the photo's. global.css lifts the WhatsApp button and
          keeps the page end clear through these data attributes. */}
      <div
        data-mobile-booking-bar
        data-visible={isBottomBarVisible || undefined}
        inert={!isBottomBarVisible}
        className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border-light px-4 py-3 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          <div className="min-w-0">
            <p className="truncate font-body text-caption text-muted">
              <span className="font-heading text-body text-dark">{name}</span>
              {district && <> · {district}</>}
            </p>
            {details && <p className="truncate font-body text-caption text-muted">{details}</p>}
          </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="shrink-0 bg-primary hover:bg-primary-hover text-white font-body font-medium text-body-sm px-4 py-2.5 rounded-pill whitespace-nowrap transition-colors duration-300 cursor-pointer"
          >
            {t('book')}
          </button>
        </div>
      </div>
    </>
  );
}
