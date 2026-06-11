'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useHeaderOverDark } from '@/components/HeaderTheme';
import { useBooking } from '@/components/BookingModal';
import DraftModeToggler from '@/components/DraftModeToggler';
import { TONES } from '@/components/WidgetLabel';
import { wonkyClip } from '@/lib/wonkyClip';
import type { Locale } from '@/i18n/config';
import type { NavItem } from '@/app/[locale]/layout';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import Link from 'next/link';

/** Light Japan Fish tints, cycled across nav items for the hover highlight. */
const NAV_TINTS = [TONES.sage.bg, TONES.gold.bg, TONES.slate.bg, TONES.rust.bg];

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
  const { open: openBooking } = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
  // Hamburger lines: dark on the solid header, white over a dark hero / open menu.
  const barColor = onLight ? 'bg-dark' : 'bg-white';
  const navLinkClass = [
    'font-body text-body-sm font-normal tracking-wide transition-colors duration-300',
    onLight ? 'text-muted hover:text-primary' : 'text-white/80 hover:text-white',
  ].join(' ');

  // Nav voce: on hover an irregular light-tinted highlight wipes in behind the
  // label (same wonky clip as the apartment photo captions); the text turns
  // dark to stay legible on the pale tint, over both header states.
  const navTextClass = onLight ? 'text-muted' : 'text-white/80';
  const renderNavItem = (item: NavItem, i: number) => {
    const inner = (
      <>
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-3 -inset-y-2 scale-90 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
          style={{
            backgroundColor: NAV_TINTS[i % NAV_TINTS.length],
            clipPath: wonkyClip(i + 1),
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
        <span
          className={`relative transition-colors duration-300 group-hover:text-dark ${navTextClass}`}
        >
          {item.label}
        </span>
      </>
    );
    const className =
      'group relative inline-flex items-center font-body text-body-sm font-normal tracking-wide';
    return item.isExternal ? (
      <a
        key={item.href}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    ) : (
      <Link key={item.href} href={item.href} className={className}>
        {inner}
      </Link>
    );
  };

  // Mobile overlay voce: large serif link that slides in from the left with a
  // staggered, slightly overshooting cascade (and animates back out on close).
  const renderMobileItem = (item: NavItem, i: number) => {
    const className =
      'font-heading font-normal leading-[1.05] text-white transition-colors duration-200 hover:text-primary';
    const style = {
      fontSize: 'clamp(2.75rem, 11vw, 4rem)',
      transform: menuOpen ? 'translateX(0)' : 'translateX(-32px)',
      opacity: menuOpen ? 1 : 0,
      transition: `color 200ms, opacity 400ms ${i * 60}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms`,
    };
    return item.isExternal ? (
      <a
        key={item.href}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setMenuOpen(false)}
        className={className}
        style={style}
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMenuOpen(false)}
        className={className}
        style={style}
      >
        {item.label}
      </Link>
    );
  };

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          {/* Wordmark — two lines, replaces the logo */}
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className={[
              'font-heading leading-[1.02] tracking-wide transition-colors duration-300 lg:justify-self-start',
              onLight ? 'text-dark' : 'text-white',
            ].join(' ')}
          >
            <span className="block text-[1.1rem]">Acacia</span>
            <span className="block text-[1.1rem]">Firenze</span>
          </Link>

          {/* Center nav (CMS, single level) — desktop only */}
          <nav className="hidden items-center justify-center gap-7 lg:flex lg:justify-self-center">
            {navItems.map((item, i) => renderNavItem(item, i))}
          </nav>

          {/* Right: Contact (desktop) + Book + hamburger (mobile/tablet) */}
          <div className="flex items-center justify-end gap-3 lg:justify-self-end lg:gap-5">
            {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}

            {/* Secondary CTA — Contact (desktop) */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:inline-flex ${navLinkClass}`}
            >
              {t('contact')}
            </a>

            {/* Primary CTA — Book (always) → opens the site-wide booking modal */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="inline-flex rounded-pill bg-primary px-4 py-2 font-body text-caption font-medium tracking-[0.06em] text-white transition-colors duration-300 hover:bg-primary-hover lg:px-5 lg:py-2.5"
            >
              {t('book')}
            </button>

            {/* Hamburger / X — mobile & tablet (up to lg) */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              <span
                className={[
                  'block h-[1.5px] w-6 origin-center rounded-full transition-all duration-300',
                  barColor,
                  menuOpen ? 'translate-y-[7.5px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block h-[1.5px] w-6 rounded-full transition-all duration-300',
                  barColor,
                  menuOpen ? 'scale-x-0 opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'block h-[1.5px] w-6 origin-center rounded-full transition-all duration-300',
                  barColor,
                  menuOpen ? '-translate-y-[7.5px] -rotate-45' : '',
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
          'origin-top-right transition-[opacity,transform] duration-300 ease-out lg:hidden',
          menuOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-[0.97] pointer-events-none',
        ].join(' ')}
      >
        {/* Mega links */}
        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navItems.map((item, i) => renderMobileItem(item, i))}
        </nav>

        {/* CTAs + locale — fade up after the links have cascaded in */}
        <div
          className="flex flex-col gap-4 border-t border-white/10 pt-8"
          style={{
            transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
            opacity: menuOpen ? 1 : 0,
            transition: `opacity 400ms ${navItems.length * 60 + 80}ms, transform 400ms ${
              navItems.length * 60 + 80
            }ms`,
          }}
        >
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
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="flex-1 rounded-pill bg-primary px-6 py-3 text-center font-body text-body-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              {t('book')}
            </button>
          </div>
          <LocaleSwitcher locale={locale} variant="menu" onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>
    </>
  );
}
