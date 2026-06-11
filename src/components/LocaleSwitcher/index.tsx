'use client';

import { Fragment } from 'react';
import { type Locale, locales } from '@/i18n/config';
import { switchLocalePath } from '@/i18n/paths';
import { useAlternateLocalePaths } from './AlternateLocaleContext';

/** Language autonyms — shown (in their own language) only to assistive tech. */
const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the manual choice so prefix-less URLs follow it on later visits. */
function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${ONE_YEAR};samesite=lax`;
}

type Variant = 'footer' | 'menu';

type Props = {
  locale: Locale;
  variant?: Variant;
  /** Optional callback (e.g. close the mobile menu) fired before navigating. */
  onNavigate?: () => void;
};

/**
 * EN / IT language switcher. Keeps the user on the same page in the other
 * language: prefers the alternate URLs published by the current page (mood, FAQ
 * — localized slugs) and otherwise derives them from the live path at click
 * time via window.location (Turbopack-safe, unlike the forbidden
 * next/navigation hooks). The click writes the NEXT_LOCALE cookie and performs a
 * full navigation so the new locale layout renders cleanly.
 */
export default function LocaleSwitcher({ locale, variant = 'footer', onNavigate }: Props) {
  const override = useAlternateLocalePaths();

  // Best-effort href for SEO / open-in-new-tab. The precise same-page target for
  // non-override pages needs the live path, so it is resolved in onClick.
  const hrefFor = (l: Locale) => override?.[l] ?? `/${l}`;

  const handleSwitch = (target: Locale) => {
    setLocaleCookie(target);
    onNavigate?.();
    const dest = override?.[target] ?? switchLocalePath(window.location.pathname, locale, target);
    window.location.assign(dest + window.location.search + window.location.hash);
  };

  const tone =
    variant === 'footer'
      ? { active: 'text-white/90', idle: 'text-white/45 hover:text-white', sep: 'text-white/25' }
      : { active: 'text-white', idle: 'text-white/55 hover:text-white', sep: 'text-white/30' };

  return (
    <div
      className="flex items-center gap-1.5 font-body text-caption tracking-wide"
      role="group"
      aria-label="Language"
    >
      {locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span className={tone.sep} aria-hidden>
              /
            </span>
          )}
          {l === locale ? (
            <span className={`font-medium uppercase ${tone.active}`} aria-current="true">
              {l}
            </span>
          ) : (
            <a
              href={hrefFor(l)}
              hrefLang={l}
              aria-label={LOCALE_NAMES[l]}
              onClick={(e) => {
                e.preventDefault();
                handleSwitch(l);
              }}
              className={`uppercase transition-colors duration-200 ${tone.idle}`}
            >
              {l}
            </a>
          )}
        </Fragment>
      ))}
    </div>
  );
}
