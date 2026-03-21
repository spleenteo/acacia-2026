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
import { modelPath } from '@/i18n/paths';
import type { Locale } from '@/i18n/config';

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

const itemTypeToModel: Record<string, string> = {
  '2726': 'apartment',
  '2735': 'district',
  '2738': 'mood',
};

export async function recordToWebsiteRoute(
  item: RawApiTypes.Item<AnyModel>,
  locale: string,
): Promise<string | null> {
  const slug = getSlug(item, locale);
  if (!slug) return null;
  const model = itemTypeToModel[item.__itemTypeId as string];
  if (!model) return null;
  return modelPath(model, slug, locale as Locale);
}

export async function recordToSlug(
  item: RawApiTypes.Item<AnyModel>,
  locale: string,
): Promise<string | null> {
  return getSlug(item, locale);
}
