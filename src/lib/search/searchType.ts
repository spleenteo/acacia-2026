/**
 * Site Search has no native facets — we derive the content type of a result
 * from its URL path (locale-agnostic, matching both EN and IT segments). The
 * crawler is restricted to the 5 detail types via robots, so every result
 * should resolve to one of these.
 */

export type SearchResultType = 'apartment' | 'district' | 'mood' | 'faq' | 'magazine';

export const SEARCH_TYPES: readonly SearchResultType[] = [
  'apartment',
  'district',
  'mood',
  'faq',
  'magazine',
];

/** Translation key (under the `search` namespace) for each type's label. */
export const SEARCH_TYPE_LABEL_KEY: Record<SearchResultType, string> = {
  apartment: 'typeApartment',
  district: 'typeDistrict',
  mood: 'typeMood',
  faq: 'typeFaq',
  magazine: 'typeMagazine',
};

/** Derive the content type from a result path (EN or IT segments). */
export function getResultType(path: string): SearchResultType | null {
  if (path.includes('/accommodations/') || path.includes('/appartamenti/')) return 'apartment';
  if (path.includes('/districts/') || path.includes('/quartieri/')) return 'district';
  if (path.includes('/moods/')) return 'mood';
  if (path.includes('/faq/')) return 'faq';
  if (path.includes('/magazine/')) return 'magazine';
  return null;
}

/** Strip the "| Acacia Firenze" SEO suffix the crawler picks up from `<title>`.
 *  Some crawled pages have no title (the API returns null) — guard for it. */
export function cleanTitle(title: string | null | undefined): string {
  if (!title) return '';
  return title.replace(/\s*[|–·-]\s*Acacia\s*Firenze\s*$/i, '').trim() || title;
}
