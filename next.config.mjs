import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
