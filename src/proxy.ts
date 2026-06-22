import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { canonicalPath, localizedPath } from '@/i18n/paths';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Picks the locale for a prefix-less request: a remembered manual choice
 * (NEXT_LOCALE cookie) wins, then the browser's Accept-Language, then English.
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
      rememberLocale(response, locale);
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', locale);
  rememberLocale(response, locale);
  return response;
}

/** Persist the locale of an explicitly-prefixed visit, so later prefix-less
 *  URLs (shared links, the bare root) follow the user's last-used language. */
function rememberLocale(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  });
}

export const config = {
  matcher: ['/((?!_next|api|favicon|.*\\..*).*)'],
};
