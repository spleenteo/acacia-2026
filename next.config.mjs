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
      // Offers / events / acacialife / debug — gone → locale home.
      { source: '/it/offerte/:path*', destination: '/it', permanent: true },
      { source: '/en/offers/:path*', destination: '/en', permanent: true },
      { source: '/it/eventi/:path*', destination: '/it', permanent: true },
      { source: '/en/events/:path*', destination: '/en', permanent: true },
      { source: '/it/acacialife/:path*', destination: '/it', permanent: true },
      { source: '/en/acacialife/:path*', destination: '/en', permanent: true },
      { source: '/it/debug/:path*', destination: '/it', permanent: true },
      { source: '/en/debug/:path*', destination: '/en', permanent: true },
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
