import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing the dev server through a Cloudflare quick tunnel (remote
  // preview from a phone). Dev-only; harmless in production.
  allowedDevOrigins: ['*.trycloudflare.com', 'owners-quilt-dialog-being.trycloudflare.com'],
  // Migration 301s (308/permanent) from the legacy acaciafirenze.com URL space.
  // Only old paths that 404 on the new site are mapped; everything else
  // (apartments, districts, moods, FAQ, blog→magazine) already resolves to 200.
  async redirects() {
    return [
      // Services — no equivalent section on the new site → locale home.
      { source: '/it/firenze/servizi/:path*', destination: '/it', permanent: true },
      { source: '/en/florence/services/:path*', destination: '/en', permanent: true },
      // Guestbook pagination — the index exists, the /page/N URLs don't.
      { source: '/it/guestbook/page/:path*', destination: '/it/guestbook', permanent: true },
      { source: '/en/guestbook/page/:path*', destination: '/en/guestbook', permanent: true },
      // Legacy blog posts live in `post_old` (not migrated to the new `post`
      // model), so /blog/<slug> would soft-404 (empty 200) — send them to the
      // Magazine index. Supersedes the proxy's path-preserving /blog→/magazine.
      { source: '/it/blog/:path*', destination: '/it/magazine', permanent: true },
      { source: '/en/blog/:path*', destination: '/en/magazine', permanent: true },
      // Offers / events / acacialife / debug — gone → locale home.
      { source: '/it/offerte/:path*', destination: '/it', permanent: true },
      { source: '/en/offers/:path*', destination: '/en', permanent: true },
      { source: '/it/eventi/:path*', destination: '/it', permanent: true },
      { source: '/en/events/:path*', destination: '/en', permanent: true },
      { source: '/it/acacialife/:path*', destination: '/it', permanent: true },
      { source: '/en/acacialife/:path*', destination: '/en', permanent: true },
      { source: '/it/debug/:path*', destination: '/it', permanent: true },
      { source: '/en/debug/:path*', destination: '/en', permanent: true },
      // Legacy static home file (old HTML site) → locale home.
      { source: '/it/index.html', destination: '/it', permanent: true },
      { source: '/en/index.html', destination: '/en', permanent: true },
      // Retired apartments (removed, or draft and being retired) → the
      // accommodations index, in each locale's public URL. Slugs aren't
      // localized, so the same slug covers both languages.
      ...['amarillis', 'kumquat', 'cannella', 'cumino', 'curry'].flatMap((slug) => [
        {
          source: `/en/florence/accommodations/${slug}`,
          destination: '/en/florence/accommodations',
          permanent: true,
        },
        {
          source: `/it/firenze/appartamenti/${slug}`,
          destination: '/it/firenze/appartamenti',
          permanent: true,
        },
      ]),
      // Legacy `/index.html` suffix from the old static site → strip it. Covers
      // old apartment/district URLs like `…/appartamenti/villa-pepi/index.html`
      // and chains with the retired-apartment rules above
      // (`…/cannella/index.html` → `…/cannella` → accommodations index). The
      // explicit `/{locale}/index.html` rules above win (first match), so the
      // site roots stay correct.
      { source: '/:path*/index.html', destination: '/:path*', permanent: true },
      // Old apartment URL space (`/en/apartments/<slug>`, no `/florence/`
      // prefix) → the current accommodations detail path. Slugs are unchanged.
      {
        source: '/en/apartments/:slug',
        destination: '/en/florence/accommodations/:slug',
        permanent: true,
      },
      // Services under the un-prefixed `/services` (EN) / `/servizi` (IT) — the
      // counterpart of the `/florence/services` · `/firenze/servizi` rules
      // above: no equivalent section → locale home.
      { source: '/en/services/:path*', destination: '/en', permanent: true },
      { source: '/it/servizi/:path*', destination: '/it', permanent: true },
      // Legacy index `.html`, and a mood with no EN translation → their current
      // index pages.
      {
        source: '/en/florence/accommodations.html',
        destination: '/en/florence/accommodations',
        permanent: true,
      },
      { source: '/en/moods/spring-in-florence', destination: '/en/moods', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Allow the DatoCMS Web Previews plugin to embed the site in its
        // Visual editing iframe. `frame-ancestors` is validated against the
        // WHOLE ancestor chain: admin → plugin → site. This project uses a
        // custom admin domain (DATOCMS_BASE_EDITING_URL = dato.acaciafirenze.com),
        // so it must be allowed alongside the plugin CDN — otherwise the
        // browser refuses to connect ("refused to connect").
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://plugins-cdn.datocms.com https://*.admin.datocms.com https://dato.acaciafirenze.com",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
