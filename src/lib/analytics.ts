import posthog from 'posthog-js';

/**
 * Minimal analytics event helpers, for Google Analytics 4 and PostHog.
 *
 * `gtag` is defined by the inline GA script in `components/GoogleAnalytics` (only
 * when `NEXT_PUBLIC_GA_ID` is set); PostHog is initialised by
 * `components/PostHogAnalytics` (only when its env vars are set, outside Draft
 * Mode and iframes). Each destination is a no-op when it isn't loaded — local
 * dev, preview deploys, or an ad-blocker — so callers never need to guard.
 * Client-side only.
 */
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: EventParams) => void;
  }
}

/** Sends a custom event to GA4 and PostHog, under the same name. */
export function trackEvent(name: string, params?: EventParams): void {
  trackGaEvent(name, params);
  if (typeof window !== 'undefined' && posthog.__loaded) posthog.capture(name, params);
}

/**
 * Sends an event to GA4 only. For events PostHog already records on its own,
 * like the manual `page_view` on client-side navigations.
 */
export function trackGaEvent(name: string, params?: EventParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
