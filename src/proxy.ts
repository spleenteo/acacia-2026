import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { canonicalPath, localizedPath } from '@/i18n/paths';

/**
 * Renamed in V3: every `NEXT_LOCALE` already on a visitor's machine — most of
 * them written by a visit rather than by a choice — goes inert the moment this
 * ships, instead of steering them for another year. next-intl does not read it
 * in this project: it resolves the locale from `x-next-intl-locale` and
 * `requestLocale`, so the conventional name bought us nothing.
 */
const LOCALE_COOKIE = 'acacia_locale';
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Picks the locale for a prefix-less request: an explicit choice (the
 * `acacia_locale` cookie, written only by the language switcher) wins, then
 * the browser's Accept-Language, then English.
 */
function negotiateLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && locales.includes(cookie as Locale)) return cookie as Locale;

  const header = request.headers.get('accept-language');
  if (header) {
    for (const part of header.split(',')) {
      const tag = part.split(';')[0].trim().toLowerCase();
      const base = tag.split('-')[0];
      const match = locales.find((l) => l === tag || l === base);
      if (match) return match;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already starts with a valid locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    // Content-negotiate the locale (cookie → Accept-Language → English).
    const locale = negotiateLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Extract locale and rest of path, then rewrite translated segments to canonical
  const locale = pathname.split('/')[1] as Locale;
  const restOfPath = pathname.slice(locale.length + 1); // includes leading /

  if (restOfPath && restOfPath !== '/') {
    // `canonical` = the filesystem route (English segments); `localized` = the
    // single public URL for this locale.
    const canonical = canonicalPath(locale, restOfPath);
    const localized = localizedPath(locale, canonical);

    // Any non-localized variant — English filesystem segments on a localized
    // locale (`/it/florence/accommodations`), the legacy `/blog[/...]` path, or
    // a mix of the two — is permanently redirected to the one public URL, so
    // each page is served from a single address (no duplicate content).
    if (restOfPath !== localized) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${localized}`;
      return NextResponse.redirect(url, 301);
    }

    // Public localized URL whose segments differ from the filesystem route →
    // rewrite to the canonical path so the App Router can resolve it.
    if (canonical !== restOfPath) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${canonical}`;
      const response = NextResponse.rewrite(url);
      response.headers.set('x-next-intl-locale', locale);
      renewLocaleChoice(request, response);
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', locale);
  renewLocaleChoice(request, response);
  return response;
}

/**
 * Refreshes an existing choice; never creates one. Two reasons it exists at all
 * rather than dropping the write entirely:
 *
 * - Safari's ITP caps cookies written by JavaScript at seven days, ignoring
 *   max-age. The old per-visit `Set-Cookie` hid that. Without a server-side
 *   renewal an explicit choice would quietly expire after a week and the
 *   visitor would fall back to Accept-Language — the very defect this slice
 *   removes, arriving from the other side.
 * - It renews the value it finds, NOT the locale of the page being visited.
 *   Renewing with the visited locale would be the old behaviour under a new
 *   name, and no test that starts from a clean jar would notice.
 */
function renewLocaleChoice(request: NextRequest, response: NextResponse) {
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  if (chosen && locales.includes(chosen as Locale)) {
    response.cookies.set(LOCALE_COOKIE, chosen, {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
    });
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon|.*\\..*).*)'],
};
