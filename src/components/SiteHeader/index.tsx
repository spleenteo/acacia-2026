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

const bookLabel = { en: 'Book', it: 'Prenota' };

export default function SiteHeader({ locale, isDraftModeEnabled }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale = locale === 'en' ? 'it' : 'en';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const logoFilter = scrolled && !menuOpen ? 'none' : 'brightness(0) invert(1)';

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled && !menuOpen
            ? 'bg-surface/95 backdrop-blur-xl border-b border-border'
            : 'bg-dark/20 backdrop-blur-sm border-b border-white/10',
        ].join(' ')}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 md:px-8 py-5">
          {/* Logo */}
          <Link href={`/${locale}`} className="block" onClick={() => setMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo--main.svg"
              alt="Acacia Firenze"
              className="h-[20px] md:h-[24px] transition-[filter] duration-300"
              style={{ filter: logoFilter }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
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
            <Link
              href={`/${locale}/florence/accommodations`}
              className="font-body text-caption font-medium tracking-[0.06em] text-white bg-rust hover:bg-rust-hover px-5 py-2.5 rounded-pill transition-colors duration-300"
            >
              {bookLabel[locale]}
            </Link>
            {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
          </nav>

          {/* Mobile: draft toggler + hamburger */}
          <div className="flex items-center gap-4 md:hidden">
            {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
              aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              <span
                className={[
                  'block w-6 h-px bg-white transition-all duration-300 origin-center',
                  menuOpen ? 'translate-y-[6px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block w-6 h-px bg-white transition-all duration-300',
                  menuOpen ? 'opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block w-6 h-px bg-white transition-all duration-300 origin-center',
                  menuOpen ? '-translate-y-[6px] -rotate-45' : '',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={[
          'fixed inset-0 z-40 bg-dark flex flex-col px-6 pt-[var(--header-height)] pb-10',
          'transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Mega links */}
        <nav className="flex flex-col gap-2 mt-10 flex-1">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              onClick={() => setMenuOpen(false)}
              className="font-heading font-normal text-white hover:text-rust transition-colors duration-200 leading-tight"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 4rem)',
                transitionDelay: menuOpen ? `${i * 50}ms` : '0ms',
                transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
                opacity: menuOpen ? 1 : 0,
                transition: `color 200ms, opacity 300ms ${i * 50}ms, transform 300ms ${i * 50}ms`,
              }}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>

        {/* Bottom bar: locale + CTA */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10">
          <span className="font-body text-caption text-white/40">
            {locale.toUpperCase()} /{' '}
            <Link
              href={`/${otherLocale}`}
              onClick={() => setMenuOpen(false)}
              className="text-white/40 hover:text-white transition-colors duration-200"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </span>
          <Link
            href={`/${locale}/florence/accommodations`}
            onClick={() => setMenuOpen(false)}
            className="font-body text-caption font-medium tracking-[0.06em] text-white bg-rust hover:bg-rust-hover px-6 py-2.5 rounded-pill transition-colors duration-300"
          >
            {bookLabel[locale]}
          </Link>
        </div>
      </div>
    </>
  );
}
