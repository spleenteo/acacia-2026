'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * PostHog product analytics: pageviews, autocapture (clicks → heatmaps),
 * session replay and the custom events sent through `trackEvent()`.
 *
 * Renders nothing and initialises nothing unless both `NEXT_PUBLIC_POSTHOG_*`
 * variables are set, so local dev and preview deploys run without it. The
 * locale layout mounts it only outside Draft Mode, and it also bails out when
 * the page is framed (DatoCMS Web Previews / Visual Editing iframe), so editors
 * are never tracked or recorded.
 *
 * TRADEOFF (site-owner decision, September 2026, trial): like GA4, PostHog runs
 * for every visitor with no consent gating — it writes its `ph_*` cookie and
 * records sessions before the Iubenda banner is answered, which is NOT aligned
 * with the Italian Garante's guidelines. The project is also in the US region.
 * Both are accepted for the trial; revisit before relying on it long term.
 */
export default function PostHogAnalytics() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!token || !host) return;
    if (window.self !== window.top) return;
    if (posthog.__loaded) return;

    posthog.init(token, {
      api_host: host,
      // Pageviews on every history change, so App Router soft navigations are
      // tracked without `usePathname()` (which breaks under Turbopack here).
      defaults: '2026-01-30',
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
    });
  }, []);

  return null;
}
