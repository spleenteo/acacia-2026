'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBooking } from '@/components/BookingModal';

type Props = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  sleeps?: number | null;
  price?: string | null;
  highlight?: string | null;
  acaciaReward?: boolean | null;
  /** Apartment-specific Beddy widget code for the booking modal. */
  beddyId?: string | null;
};

export default function BookingSidebar({
  bedrooms,
  bathrooms,
  sleeps,
  price,
  highlight,
  acaciaReward,
  beddyId,
}: Props) {
  const t = useTranslations('apartment');
  const { open } = useBooking();
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsBottomBarVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBooking = () => open({ widgetCode: beddyId });

  const stats = [
    { value: bedrooms, label: t('bedrooms') },
    { value: sleeps, label: t('sleeps') },
    { value: bathrooms, label: t('bathrooms') },
  ].filter((s) => s.value);

  return (
    <>
      {/* Desktop CTA now lives inside the (sticky) hero — see ApartmentDetailContent. */}

      {/* ── Mobile Bottom Bar ── */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border-light px-5 py-3 transition-transform duration-300 ${
          isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            {price && (
              <p className="font-body text-body-sm text-dark font-medium truncate">{price}</p>
            )}
            {stats.length > 0 && (
              <p className="font-body text-caption text-muted whitespace-nowrap">
                {stats.map((s) => s.value).join(' · ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="shrink-0 bg-primary hover:bg-primary-hover text-white font-body font-medium text-body-sm tracking-wide px-6 py-2.5 rounded-pill transition-colors duration-300 cursor-pointer"
          >
            {t('book')}
          </button>
        </div>
      </div>
    </>
  );
}
