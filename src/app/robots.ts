import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Canonical bases of the 5 detail types that DatoCMS Site Search should index.
const SEARCH_DETAIL_BASES = [
  '/florence/accommodations',
  '/florence/districts',
  '/moods',
  '/faq',
  '/blog', // → /magazine
];

// Localized `Allow` prefixes for the search crawler, e.g.
// `/it/firenze/appartamenti/`, `/en/magazine/`. First-match-wins, so these
// must precede the catch-all `Disallow: /`.
const searchAllow = locales.flatMap((locale) =>
  SEARCH_DETAIL_BASES.map((base) => `/${locale}${localizedPath(locale, base)}/`),
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep route handlers and the self-hosted webfonts out of the crawl. We
        // deliberately do NOT block the rest of /_next/static (JS/CSS chunks):
        // Google needs those to render the pages. The `.woff2` fonts live under
        // /_next/static/media/, aren't needed to read the text, and were showing
        // up under "Crawled – currently not indexed".
        disallow: ['/api/', '/_next/static/media/'],
      },
      // DatoCMS Site Search crawler: index only the detail pages (no home,
      // index pages, guestbook). `Allow` rules ordered before `Disallow: /`.
      {
        userAgent: 'DatoCmsSearchBot',
        allow: searchAllow,
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
