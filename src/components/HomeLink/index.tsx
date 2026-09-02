'use client';

import { useSyncExternalStore, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import { type Locale, locales, defaultLocale } from '@/i18n/config';

/**
 * "Back home" for the pages that never receive a locale: the 404 scene and the
 * error boundary get no `params`, so they cannot know which language the
 * visitor was reading. Their bare `/` used to land in the right one only
 * because the proxy rewrote the locale cookie on every visit — V3 stops doing
 * that, so the link works it out from the URL instead. Without this, an
 * Italian reading /en/… would be sent to /it right after something had
 * already gone wrong.
 *
 * Location is read through `useSyncExternalStore` for the same reasons as in
 * LocaleSwitcher: react-hooks forbids setState in an effect, the server
 * snapshot is null rather than a hydration mismatch, and next/navigation's
 * hooks are off limits under Turbopack.
 *
 * Known limit, shared with the switcher's href: the server snapshot is null,
 * so the HTML served for the root-level 404 — the only one that is actually
 * server-rendered — carries `/en` regardless of the URL. Fixing that means
 * forwarding the pathname from the proxy in a header.
 */
const subscribe = () => () => {};
const getPathname = () => window.location.pathname;
const getServerPathname = () => null;

export default function HomeLink({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const pathname = useSyncExternalStore(subscribe, getPathname, getServerPathname);
  const segment = pathname?.split('/')[1];
  const locale = locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;

  return (
    <Link href={`/${locale}`} className={className} style={style}>
      {children}
    </Link>
  );
}
