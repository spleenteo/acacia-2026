import Script from 'next/script';

/**
 * Google Analytics 4.
 *
 * Renders nothing unless `NEXT_PUBLIC_GA_ID` (a GA4 Measurement ID, e.g.
 * `G-XXXXXXXXXX`) is set, so the app ships without analytics wherever the id
 * isn't configured (local dev, preview deploys). The id is public by design —
 * GA4 needs it in the browser — hence the `NEXT_PUBLIC_` prefix.
 *
 * Replaces the legacy Universal Analytics (`UA-796094-2`) used by the previous
 * site, which Google shut down in July 2023 and no longer collects data.
 *
 * Note: this loads GA unconditionally. If a cookie-consent banner is added
 * later, gate these scripts (or use GA Consent Mode) to stay GDPR-compliant.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
