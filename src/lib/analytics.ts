/**
 * Minimal Google Analytics 4 event helper.
 *
 * `gtag` is defined by the inline GA script in `components/GoogleAnalytics` (only
 * when `NEXT_PUBLIC_GA_ID` is set). This helper is a no-op when it isn't loaded
 * — local dev, preview deploys, or an ad-blocker — so callers never need to
 * guard. Client-side only.
 */
type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void;
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
