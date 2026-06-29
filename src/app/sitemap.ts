import { type MetadataRoute } from 'next';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { locales, type Locale } from '@/i18n/config';
import { localizedPath, faqPath } from '@/i18n/paths';
import { fetchFaqTree, pathSlugsForNode } from '@/lib/faq/faqTree';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Regenerate the sitemap at most hourly. This route is statically rendered and
 * served from Vercel's edge CDN; `revalidateTag('datocms')` (fired by the
 * cache-invalidation webhook) refreshes the underlying Data Cache but does not
 * purge the edge copy of a static route, so without a TTL the sitemap could lag
 * far behind content changes. An hour bounds that staleness.
 */
export const revalidate = 3600;

const slugsQuery = graphql(`
  query SitemapSlugsQuery {
    allApartments(first: 100) {
      slug
      _updatedAt
    }
    allDistricts(first: 100) {
      slug
      _updatedAt
    }
    allMoods(first: 100) {
      _allSlugLocales {
        locale
        value
      }
      _updatedAt
    }
    allPosts(first: 100) {
      _allSlugLocales {
        locale
        value
      }
      _updatedAt
    }
  }
`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await executeQuery(slugsQuery);

  const staticPaths = [
    '',
    '/florence/accommodations',
    '/florence/districts',
    '/moods',
    '/blog',
    '/faq',
    '/guestbook',
  ];

  // FAQ tree: every node has its own (localized) hierarchical URL.
  const faqEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      locales.map(async (locale) => {
        const tree = await fetchFaqTree(locale, false);
        return tree.nodes.map((n) => ({
          url: `${siteUrl}${faqPath(locale, pathSlugsForNode(tree, n.id))}`,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }));
      }),
    )
  ).flat();

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}/${locale}${path ? localizedPath(locale, path) : ''}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
    })),
  );

  const apartmentEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allApartments.map((apt) => ({
      url: `${siteUrl}/${locale}${localizedPath(locale, `/florence/accommodations/${apt.slug}`)}`,
      lastModified: new Date(apt._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  );

  const districtEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allDistricts.map((d) => ({
      url: `${siteUrl}/${locale}${localizedPath(locale, `/florence/districts/${d.slug}`)}`,
      lastModified: new Date(d._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  // Mood slugs are localized: emit each locale's own slug from `_allSlugLocales`
  // (the bare slug is the default locale's, which would soft-404 under /it) and
  // skip locales the mood isn't translated into.
  const moodEntries: MetadataRoute.Sitemap = data.allMoods.flatMap((m) =>
    (m._allSlugLocales ?? [])
      .filter((s) => s.value && locales.includes(s.locale as Locale))
      .map((s) => ({
        url: `${siteUrl}/${s.locale}${localizedPath(s.locale as Locale, `/moods/${s.value}`)}`,
        lastModified: new Date(m._updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  );

  // Magazine posts are localized per-locale (content + slug): list only the
  // locales a post is actually translated into, each with its own slug.
  const postEntries: MetadataRoute.Sitemap = data.allPosts.flatMap((p) =>
    (p._allSlugLocales ?? [])
      .filter((s) => s.value && locales.includes(s.locale as Locale))
      .map((s) => ({
        url: `${siteUrl}/${s.locale}${localizedPath(s.locale as Locale, `/blog/${s.value}`)}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  );

  return [
    ...staticEntries,
    ...apartmentEntries,
    ...districtEntries,
    ...moodEntries,
    ...postEntries,
    ...faqEntries,
  ];
}
