'use client';

import { Fragment, useSyncExternalStore } from 'react';
import { type Locale, locales } from '@/i18n/config';
import { switchLocalePath } from '@/i18n/paths';
import { trackEvent } from '@/lib/analytics';
import { useAlternateLocalePaths } from './AlternateLocaleContext';

/** Language autonyms — shown (in their own language) only to assistive tech. */
const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Persist the manual choice so prefix-less URLs follow it on later visits.
 * This click is the only thing in the codebase that creates the cookie: the
 * proxy renews an existing one but never writes a new one.
 */
function setLocaleCookie(locale: Locale) {
  document.cookie = `acacia_locale=${locale};path=/;max-age=${ONE_YEAR};samesite=lax`;
}

type Variant = 'footer' | 'header';

type Tone = { active: string; idle: string; sep: string };

/**
 * Tone for the inline (slash-separated) variant. Typing the map over
 * `Exclude<Variant, 'header'>` keeps the two halves honest in both directions:
 * a variant added to the union without a tone fails to compile, and a tone
 * left behind for a variant that no longer exists fails too — which is how the
 * `menu` entry left with its last call site instead of lingering as dead code.
 */
const INLINE_TONES = {
  footer: { active: 'text-white/90', idle: 'text-white/45 hover:text-white', sep: 'text-white/25' },
} satisfies Record<Exclude<Variant, 'header'>, Tone>;

/**
 * The header segmented control inverts with the bar it sits on. Both states are
 * 20.2:1 against a flat fill — the dark bar is `bg-dark/20` over a hero photo,
 * so that figure is the floor rather than the exact value. Filling the active
 * cell with `primary` instead would have measured 1.39:1 against the navy bar,
 * worse than the hairline border the spike rejected, and would have spent the
 * action colour on the one cell you cannot click, inches from a blackberry CTA.
 */
const HEADER_TONES = {
  light: {
    wrap: 'border-border-strong',
    active: 'bg-dark text-white',
    idle: 'text-muted hover:text-dark',
  },
  dark: {
    wrap: 'border-white/70',
    active: 'bg-white text-dark',
    idle: 'text-white/70 hover:text-white',
  },
} as const;

/**
 * `useSyncExternalStore` over window.location, rather than a state set in an
 * effect: React 19's lint rules forbid the latter, and this gives the server a
 * null snapshot instead of a hydration mismatch. `popstate` covers back and
 * forward; a client-side <Link> navigation does not fire it, so the href can
 * lag until the next render — the click handler reads location fresh every
 * time, so only the href attribute is affected.
 */
function subscribeToHistory(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

const getHref = () => window.location.href;
const getServerHref = () => null;

type Props = {
  locale: Locale;
  variant?: Variant;
  /** Only read by `variant="header"`: which of the two header states we're on. */
  onLight?: boolean;
  /** Optional callback (e.g. close the mobile menu) fired before navigating. */
  onNavigate?: () => void;
};

/**
 * EN / IT language switcher. Keeps the user on the same page in the other
 * language: prefers the alternate URLs published by the current page (mood, FAQ
 * — localized slugs) and otherwise derives them from the live path via
 * window.location (Turbopack-safe, unlike the forbidden next/navigation hooks).
 * The click writes the acacia_locale cookie and performs a full navigation so the
 * new locale layout renders cleanly.
 */
export default function LocaleSwitcher({
  locale,
  variant = 'footer',
  onLight = false,
  onNavigate,
}: Props) {
  const override = useAlternateLocalePaths();

  // The server has no location, so `getServerSnapshot` returns null and the
  // first paint falls back to the locale root. Once hydrated the href points at
  // the current page, which is what keeps cmd-click, middle-click and "open in
  // new tab" from going home — the click handler always knew the right target,
  // the href did not. Query and hash ride along so the href matches the click.
  const currentHref = useSyncExternalStore(subscribeToHistory, getHref, getServerHref);

  const hrefFor = (l: Locale) => {
    if (override?.[l]) return override[l];
    if (!currentHref) return `/${l}`;
    const url = new URL(currentHref);
    return switchLocalePath(url.pathname, locale, l) + url.search + url.hash;
  };

  const handleSwitch = (target: Locale) => {
    trackEvent('locale_switch', { from: locale, to: target, source: variant });
    setLocaleCookie(target);
    onNavigate?.();
    const dest = override?.[target] ?? switchLocalePath(window.location.pathname, locale, target);
    window.location.assign(dest + window.location.search + window.location.hash);
  };

  // The header variant is a segmented control, not a slash-separated pair: the
  // filled cell is the separator, and it is what makes the control read as a
  // control rather than as decoration.
  if (variant === 'header') {
    const tone = onLight ? HEADER_TONES.light : HEADER_TONES.dark;
    const cell = 'px-1.5 py-1 font-body text-label uppercase tracking-[0.06em] leading-none';
    return (
      <div
        className={`inline-flex items-center overflow-hidden rounded-pill border transition-colors duration-300 ${tone.wrap}`}
        role="group"
        aria-label="Language"
      >
        {locales.map((l) =>
          l === locale ? (
            <span key={l} className={`${cell} font-medium ${tone.active}`} aria-current="true">
              {l}
            </span>
          ) : (
            <a
              key={l}
              href={hrefFor(l)}
              hrefLang={l}
              aria-label={LOCALE_NAMES[l]}
              onClick={(e) => {
                e.preventDefault();
                handleSwitch(l);
              }}
              className={`${cell} transition-colors duration-200 ${tone.idle}`}
            >
              {l}
            </a>
          ),
        )}
      </div>
    );
  }

  const tone = INLINE_TONES[variant];

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
