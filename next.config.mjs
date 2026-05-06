import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Allow the DatoCMS Web Previews plugin to embed the site in its
        // Visual editing iframe. Without this, restrictive default CSPs (set
        // by Vercel or a proxy) could block the iframe load and break the
        // Visual mode.
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://plugins-cdn.datocms.com",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
