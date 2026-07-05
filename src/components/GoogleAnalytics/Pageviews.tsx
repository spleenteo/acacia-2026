'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Sends a GA4 `page_view` on every client-side route change.
 *
 * The inline GA snippet's `gtag('config')` fires a page_view only on the initial
 * full page load. App Router soft navigations (e.g. opening a FAQ from the menu)
 * don't reload, so those pages went untracked in GA — which is why sections
 * reached only via internal links (like the FAQ) looked unvisited.
 *
 * We detect route changes by polling `window.location` (plus `popstate` for
 * instant back/forward). We deliberately do NOT patch `history.pushState`: App
 * Router routes internal navigations through its own router, so a pushState
 * patch doesn't reliably intercept them. Polling catches every change no matter
 * how it happened, and by the time we notice it the new document.title is set.
 * (We can't use `usePathname()` — next/navigation router hooks break under
 * Turbopack in this project.)
 */
export default function GoogleAnalyticsPageviews() {
  useEffect(() => {
    let lastPath = window.location.pathname;

    const check = () => {
      const path = window.location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      trackEvent('page_view', {
        page_location: window.location.href,
        page_path: path,
        page_title: document.title,
      });
    };

    const id = window.setInterval(check, 500);
    window.addEventListener('popstate', check);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('popstate', check);
    };
  }, []);

  return null;
}
