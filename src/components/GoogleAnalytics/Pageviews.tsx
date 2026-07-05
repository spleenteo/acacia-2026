'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Sends a GA4 `page_view` on every client-side route change.
 *
 * The inline GA snippet's `gtag('config')` fires a page_view only on the initial
 * full page load. App Router soft navigations (e.g. opening the FAQ from the
 * menu) don't reload, so those pages went completely untracked in GA — which is
 * why sections reached only via internal links (like the FAQ) looked unvisited.
 *
 * We can't use `usePathname()` here: next/navigation router hooks break under
 * Turbopack in this project. Instead we detect route changes by patching
 * `history.pushState` and listening to `popstate` (back/forward). Only pathname
 * changes count — `replaceState` (used across the app to sync `?q=`/`?category=`
 * without navigating) is intentionally left alone so filters don't fire pageviews.
 */
export default function GoogleAnalyticsPageviews() {
  useEffect(() => {
    let lastPath = window.location.pathname;

    const send = () => {
      const path = window.location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      trackEvent('page_view', {
        page_location: window.location.href,
        page_title: document.title,
      });
    };
    // Defer so the new page's <title> is in place before we read it.
    const sendSoon = () => window.setTimeout(send, 0);

    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = (...args: Parameters<History['pushState']>) => {
      originalPushState(...args);
      sendSoon();
    };
    window.addEventListener('popstate', sendSoon);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', sendSoon);
    };
  }, []);

  return null;
}
