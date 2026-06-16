import { type MetadataRoute } from 'next';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { locales } from '@/i18n/config';
import { localizedPath, faqPath } from '@/i18n/paths';
import { fetchFaqTree, pathSlugsForNode } from '@/lib/faq/faqTree';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const slugsQuery = graphql(`
  query SitemapSlugsQuery {
    allApartments {
      slug
      _updatedAt
    }
    allDistricts {
      slug
      _updatedAt
    }
    allMoods {
      slug
      _updatedAt
    }
    allPosts(first: 100) {
      slug
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

  const moodEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allMoods.map((m) => ({
      url: `${siteUrl}/${locale}${localizedPath(locale, `/moods/${m.slug}`)}`,
      lastModified: new Date(m._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  // Blog is legacy EN-only content, but both locale routes render it.
  const postEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allPosts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${siteUrl}/${locale}${localizedPath(locale, `/blog/${p.slug}`)}`,
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
