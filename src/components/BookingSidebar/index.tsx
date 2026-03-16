'use client';

import { useEffect, useState } from 'react';

type Props = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  sleeps?: number | null;
  price?: string | null;
  highlight?: string | null;
  acaciaReward?: boolean | null;
  labels: {
    bedrooms: string;
    bathrooms: string;
    sleeps: string;
    book: string;
  };
};

export default function BookingSidebar({
  bedrooms,
  bathrooms,
  sleeps,
  price,
  highlight,
  acaciaReward,
  labels,
}: Props) {
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsBottomBarVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById('beddy-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const stats = [
    { value: bedrooms, label: labels.bedrooms },
    { value: bathrooms, label: labels.bathrooms },
    { value: sleeps, label: labels.sleeps },
  ].filter((s) => s.value);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+2rem)] rounded-card bg-card border border-border-light shadow-card p-6">
          {/* Highlight badge */}
          {highlight && (
            <div className="mb-5">
              <span className="inline-block bg-rust/10 text-rust font-body text-tag uppercase font-medium tracking-wider px-2.5 py-1 rounded-pill border border-rust/20">
                {highlight}
              </span>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex justify-between mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center flex-1">
                  <p className="font-heading font-normal text-h2 text-dark leading-none">
                    {stat.value}
                  </p>
                  <p className="font-body text-tag uppercase tracking-[0.14em] text-muted mt-1.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border-light mb-5" />

          {/* Price */}
          {price && (
            <p className="font-body text-body text-muted mb-5">
              <span className="text-body-lg font-medium text-dark">{price}</span>
            </p>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={scrollToBooking}
            className="w-full bg-rust hover:bg-rust-hover text-white font-body font-medium text-body tracking-wide py-3.5 rounded-pill transition-colors duration-300 cursor-pointer"
          >
            {labels.book}
          </button>
        </div>
      </div>

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
            className="shrink-0 bg-rust hover:bg-rust-hover text-white font-body font-medium text-body-sm tracking-wide px-6 py-2.5 rounded-pill transition-colors duration-300 cursor-pointer"
          >
            {labels.book}
          </button>
        </div>
      </div>
    </>
  );
}
