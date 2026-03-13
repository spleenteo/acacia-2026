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

export async function recordToWebsiteRoute(
  item: RawApiTypes.Item<AnyModel>,
  _locale: string,
): Promise<string | null> {
  switch (item.__itemTypeId) {
    // Apartment model
    case '2726': {
      return `/`;
    }
    default:
      return null;
  }
}

export async function recordToSlug(
  item: RawApiTypes.Item<AnyModel>,
  _locale: string,
): Promise<string | null> {
  if ('slug' in item.attributes) {
    return item.attributes.slug as string;
  }
  return null;
}
