import Script from 'next/script';
import GoogleAnalyticsPageviews from './Pageviews';

/**
 * Google Analytics 4, wired to Google Consent Mode v2.
 *
 * Renders nothing unless `NEXT_PUBLIC_GA_ID` (a GA4 Measurement ID, e.g.
 * `G-XXXXXXXXXX`) is set, so the app ships without analytics wherever the id
 * isn't configured (local dev, preview deploys). The id is public by design —
 * GA4 needs it in the browser — hence the `NEXT_PUBLIC_` prefix.
 *
 * Consent flow: the inline `<script>` below runs during HTML parsing —
 * guaranteed before the Iubenda banner and gtag.js (both `afterInteractive`) —
 * and defaults every Consent Mode signal to `denied`. Iubenda (configured with
 * `googleConsentMode: "template"` in the locale layout) pushes
 * `gtag('consent','update',…)` when the visitor grants consent, or right away
 * on later visits from stored consent (`wait_for_update` gives it a 500ms
 * window before the first hit). Until then GA4 sends only cookieless pings and
 * models the missing data — no `_ga` cookies are written without consent, as
 * required by the Garante's cookie guidelines.
 *
 * Replaces the legacy Universal Analytics (`UA-796094-2`) used by the previous
 * site, which Google shut down in July 2023 and no longer collects data.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      {/* Plain <script> (not next/script): must execute during parse, before
          the afterInteractive scripts (Iubenda, gtag.js) can fire anything. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
      {/* Track client-side route changes too (config only covers the first load). */}
      <GoogleAnalyticsPageviews />
    </>
  );
}
