/*
 * Type-safe record handling using DatoCMS's generated types.
 *
 * This file uses types generated from your DatoCMS schema via `npm run generate-cma-types`.
 * The generated types provide full autocomplete and compile-time safety when
 * accessing record fields.
 *
 * See: https://www.datocms.com/docs/content-management-api/resources/item#type-safe-development-with-typescript
 */
import type { RawApiTypes } from '@datocms/cma-client';
import type { AnyModel } from './cma-types';

/*
 * Both the "Web Previews" and "SEO/Readability Analysis" plugins from DatoCMS
 * need to know the URL of the site that corresponds to each DatoCMS record to
 * work properly. These two functions are responsible for returning this
 * information, and are utilized by the route handlers associated with the two
 * plugins:
 *
 * - src/app/api/seo-analysis/route.tsx
 * - src/app/api/preview-links/route.tsx
 */

function getSlug(item: RawApiTypes.Item<AnyModel>, locale: string): string | null {
  if (!('slug' in item.attributes)) return null;
  const slug = item.attributes.slug;
  if (!slug) return null;
  if (typeof slug === 'string') return slug;
  // Localized slug fields are objects keyed by locale
  if (typeof slug === 'object') {
    const map = slug as Record<string, string>;
    return map[locale] ?? map['en'] ?? null;
  }
  return null;
}

export async function recordToWebsiteRoute(
  item: RawApiTypes.Item<AnyModel>,
  locale: string,
): Promise<string | null> {
  const slug = getSlug(item, locale);
  switch (item.__itemTypeId) {
    // Apartment model (ID 2726) — non-localized slug
    case '2726':
      return slug ? `/${locale}/florence/accommodations/${slug}` : null;
    // District model (ID 2735) — localized slug
    case '2735':
      return slug ? `/${locale}/florence/districts/${slug}` : null;
    // Mood model (ID 2738) — localized slug
    case '2738':
      return slug ? `/${locale}/moods/${slug}` : null;
    default:
      return null;
  }
}

export async function recordToSlug(
  item: RawApiTypes.Item<AnyModel>,
  locale: string,
): Promise<string | null> {
  return getSlug(item, locale);
}

const modelApiKeyToPathPrefix: Record<string, string> = {
  apartment: 'florence/accommodations',
  district: 'florence/districts',
  mood: 'moods',
};

/**
 * Resolves a DatoCMS record slug to a full frontend path using the model's API key.
 * Used by the Button component to reconstruct URLs from the better-linking plugin.
 */
export function recordSlugToPath(modelApiKey: string, slug: string, locale: string): string | null {
  const prefix = modelApiKeyToPathPrefix[modelApiKey];
  if (!prefix) return null;
  return `/${locale}/${prefix}/${slug}`;
}
