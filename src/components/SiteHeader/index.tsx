'use client';

import { useState, useEffect } from 'react';
import DraftModeToggler from '@/components/DraftModeToggler';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

type Props = {
  locale: Locale;
  isDraftModeEnabled: boolean;
};

const nav = [
  { href: '/florence/accommodations', label: { en: 'Accommodations', it: 'Alloggi' } },
  { href: '/florence/districts', label: { en: 'Districts', it: 'Quartieri' } },
  { href: '/moods', label: { en: 'Moods', it: 'Moods' } },
];

export default function SiteHeader({ locale, isDraftModeEnabled }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const otherLocale = locale === 'en' ? 'it' : 'en';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface/95 backdrop-blur-xl border-b border-border'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-8 py-5">
        <Link href={`/${locale}`} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo--main.svg"
            alt="Acacia Firenze"
            className="h-[22px] md:h-[26px] transition-[filter] duration-300"
            style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
          />
        </Link>
        <nav className="flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={[
                'font-body text-body-sm font-normal transition-colors duration-300 tracking-wide',
                scrolled ? 'text-muted hover:text-rust' : 'text-white/80 hover:text-white',
              ].join(' ')}
            >
              {item.label[locale]}
            </Link>
          ))}
          <span
            className={[
              'font-body text-caption font-normal transition-colors duration-300',
              scrolled ? 'text-light' : 'text-white/50',
            ].join(' ')}
          >
            {locale.toUpperCase()} /{' '}
            <Link
              href={`/${otherLocale}`}
              className={[
                'transition-colors duration-300',
                scrolled ? 'hover:text-dark' : 'hover:text-white',
              ].join(' ')}
            >
              {otherLocale.toUpperCase()}
            </Link>
          </span>
          {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
        </nav>
      </div>
    </header>
  );
}
