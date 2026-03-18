import { type MetadataRoute } from 'next';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { locales } from '@/i18n/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const slugsQuery = graphql(`
  query SitemapSlugsQuery {
    allApartments(first: 100) {
      slug
    }
    allDistricts {
      slug
    }
    allMoods {
      slug
    }
  }
`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await executeQuery(slugsQuery);

  const staticPaths = ['', '/florence/accommodations', '/florence/districts', '/moods'];

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
    })),
  );

  const apartmentEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allApartments.map((apt) => ({
      url: `${siteUrl}/${locale}/florence/accommodations/${apt.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  );

  const districtEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allDistricts.map((d) => ({
      url: `${siteUrl}/${locale}/florence/districts/${d.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  const moodEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    data.allMoods.map((m) => ({
      url: `${siteUrl}/${locale}/moods/${m.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  );

  return [...staticEntries, ...apartmentEntries, ...districtEntries, ...moodEntries];
}
