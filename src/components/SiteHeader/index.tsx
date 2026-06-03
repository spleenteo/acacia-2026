'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useHeaderOverDark } from '@/components/HeaderTheme';
import DraftModeToggler from '@/components/DraftModeToggler';
import type { Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import type { NavItem } from '@/app/[locale]/layout';
import Link from 'next/link';

type Props = {
  locale: Locale;
  isDraftModeEnabled: boolean;
  navItems: NavItem[];
};

/** WhatsApp contact — same number used by the apartment detail CTA band. */
const WHATSAPP_URL = 'https://wa.me/393939070181';

export default function SiteHeader({ locale, isDraftModeEnabled, navItems }: Props) {
  const t = useTranslations('nav');
  const overDark = useHeaderOverDark();
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

  // Solid/light header everywhere by default; transparent white only while the
  // menu is closed, unscrolled, and sitting over a page that declared a dark hero.
  const onLight = !menuOpen && (scrolled || !overDark);
  const bookHref = `/${locale}${localizedPath(locale, '/florence/accommodations')}`;
  const navLinkClass = [
    'font-body text-body-sm font-normal tracking-wide transition-colors duration-300',
    onLight ? 'text-muted hover:text-primary' : 'text-white/80 hover:text-white',
  ].join(' ');

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          onLight
            ? 'bg-surface/95 backdrop-blur-xl border-b border-border'
            : 'bg-dark/20 backdrop-blur-sm border-b border-white/10',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8">
          {/* Wordmark — two lines, replaces the logo */}
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className={[
              'font-heading leading-[1.02] tracking-wide transition-colors duration-300 md:justify-self-start',
              onLight ? 'text-dark' : 'text-white',
            ].join(' ')}
          >
            <span className="block text-[1.1rem]">Acacia</span>
            <span className="block text-[1.1rem]">Firenze</span>
          </Link>

          {/* Center nav (CMS, single level) */}
          <nav className="hidden items-center justify-center gap-7 md:flex md:justify-self-center">
            {navItems.map((item) =>
              item.isExternal ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navLinkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Right: secondary + primary CTA (desktop) / hamburger (mobile) */}
          <div className="flex items-center justify-end gap-4 md:justify-self-end md:gap-5">
            {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}

            {/* Secondary CTA — Contact */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:inline-flex ${navLinkClass}`}
            >
              {t('contact')}
            </a>

            {/* Primary CTA — Book */}
            <Link
              href={bookHref}
              className="hidden rounded-pill bg-primary px-5 py-2.5 font-body text-caption font-medium tracking-[0.06em] text-white transition-colors duration-300 hover:bg-primary-hover md:inline-flex"
            >
              {t('book')}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
              aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              <span
                className={[
                  'block h-px w-6 origin-center bg-white transition-all duration-300',
                  menuOpen ? 'translate-y-[6px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block h-px w-6 bg-white transition-all duration-300',
                  menuOpen ? 'opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block h-px w-6 origin-center bg-white transition-all duration-300',
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
          'fixed inset-0 z-40 flex flex-col bg-dark px-6 pb-10 pt-[var(--header-height)]',
          'transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Mega links */}
        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navItems.map((item, i) =>
            item.isExternal ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="font-heading font-normal leading-tight text-white transition-colors duration-200 hover:text-primary"
                style={{
                  fontSize: 'clamp(2.75rem, 11vw, 4rem)',
                  transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: `color 200ms, opacity 300ms ${i * 50}ms, transform 300ms ${i * 50}ms`,
                }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-heading font-normal leading-tight text-white transition-colors duration-200 hover:text-primary"
                style={{
                  fontSize: 'clamp(2.75rem, 11vw, 4rem)',
                  transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: `color 200ms, opacity 300ms ${i * 50}ms, transform 300ms ${i * 50}ms`,
                }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* CTAs + locale */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-pill border border-white/25 px-6 py-3 text-center font-body text-body-sm font-medium tracking-wide text-white transition-colors duration-300 hover:border-white/60"
            >
              {t('contact')}
            </a>
            <Link
              href={bookHref}
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-pill bg-primary px-6 py-3 text-center font-body text-body-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              {t('book')}
            </Link>
          </div>
          <span className="font-body text-caption text-white/70">
            {locale.toUpperCase()} /{' '}
            <Link
              href={`/${otherLocale}`}
              onClick={() => setMenuOpen(false)}
              className="text-white/70 transition-colors duration-200 hover:text-white"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </span>
        </div>
      </div>
    </>
  );
}
