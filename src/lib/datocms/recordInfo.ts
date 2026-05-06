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
import { isSingletonModelApiKey, modelPath } from '@/i18n/paths';
import type { Locale } from '@/i18n/config';

/*
 * Both the "Web Previews" and "SEO/Readability Analysis" plugins from DatoCMS
 * need to know the URL of the site that corresponds to each DatoCMS record to
 * work properly. These two functions are responsible for returning this
 * information, and are utilized by the route handlers associated with the two
 * plugins:
 *
 * - src/app/api/seo-analysis/route.ts
 * - src/app/api/preview-links/route.ts
 *
 * We dispatch on the model's `api_key` (e.g. `apartment`, `home_page`) instead
 * of the numeric `__itemTypeId`, because numeric IDs are not stable across
 * environment forks: forking the primary environment generates a new set of
 * IDs, which would silently break preview-links and SEO analysis on the forked
 * environment. The `api_key` is invariant across environments.
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
  itemTypeApiKey: string,
  locale: string,
): Promise<string | null> {
  // Singleton/index models map to a fixed path and do not require a slug
  if (isSingletonModelApiKey(itemTypeApiKey)) {
    return modelPath(itemTypeApiKey, '', locale as Locale);
  }

  const slug = getSlug(item, locale);
  if (!slug) return null;
  return modelPath(itemTypeApiKey, slug, locale as Locale);
}

export async function recordToSlug(
  item: RawApiTypes.Item<AnyModel>,
  locale: string,
): Promise<string | null> {
  return getSlug(item, locale);
}
