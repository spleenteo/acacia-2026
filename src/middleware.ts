import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { canonicalPath } from '@/i18n/paths';

export function middleware(request: NextRequest) {
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
    // Redirect to default locale
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Extract locale and rest of path, then rewrite translated segments to canonical
  const locale = pathname.split('/')[1] as Locale;
  const restOfPath = pathname.slice(locale.length + 1); // includes leading /

  if (restOfPath && restOfPath !== '/') {
    const canonical = canonicalPath(locale, restOfPath);
    if (canonical !== restOfPath) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${canonical}`;
      const response = NextResponse.rewrite(url);
      response.headers.set('x-next-intl-locale', locale);
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|favicon|.*\\..*).*)'],
};
