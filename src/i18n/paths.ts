import { type Locale, locales } from './config';

/**
 * Maps canonical (filesystem) path segments to their translated equivalents per locale.
 * EN segments match the filesystem; IT segments are translated.
 */
const pathSegments: Record<string, Record<Locale, string>> = {
  florence: { en: 'florence', it: 'firenze' },
  accommodations: { en: 'accommodations', it: 'appartamenti' },
  districts: { en: 'districts', it: 'quartieri' },
  moods: { en: 'moods', it: 'moods' },
  faq: { en: 'faq', it: 'faq' },
  guestbook: { en: 'guestbook', it: 'guestbook' },
};

/** Reverse map: for each locale, maps translated segment → canonical segment */
const reverseSegments: Record<Locale, Record<string, string>> = { en: {}, it: {} };
for (const [canonical, translations] of Object.entries(pathSegments)) {
  for (const [locale, translated] of Object.entries(translations)) {
    reverseSegments[locale as Locale][translated] = canonical;
  }
}

/**
 * Converts a canonical path (matching filesystem) to a localized path.
 * e.g. localizedPath('it', '/florence/accommodations/abaco') → '/firenze/appartamenti/abaco'
 */
export function localizedPath(locale: Locale, canonicalPath: string): string {
  const segments = canonicalPath.split('/').filter(Boolean);
  const translated = segments.map((seg) => pathSegments[seg]?.[locale] ?? seg);
  return '/' + translated.join('/');
}

/**
 * Converts a localized path back to its canonical (filesystem) form.
 * e.g. canonicalPath('it', '/firenze/appartamenti/abaco') → '/florence/accommodations/abaco'
 */
export function canonicalPath(locale: Locale, localizedPath: string): string {
  const segments = localizedPath.split('/').filter(Boolean);
  const canonical = segments.map((seg) => reverseSegments[locale]?.[seg] ?? seg);
  return '/' + canonical.join('/');
}

/**
 * Builds the localized URL for a FAQ tree node from its slug chain.
 * The FAQ slugs are themselves localized (per-locale), so the chain is already
 * in the right language; only the `/faq` segment goes through the segment map.
 * e.g. faqPath('it', ['preparati-al-viaggio','come-arrivare']) → '/it/faq/preparati-al-viaggio/come-arrivare'
 */
export function faqPath(locale: Locale, slugs: string[]): string {
  const base = `/${locale}${localizedPath(locale, '/faq')}`;
  return slugs.length ? `${base}/${slugs.join('/')}` : base;
}

/**
 * Re-expresses a localized URL (incl. its `/{locale}` prefix) in another locale,
 * keeping the same page. Translates the path segments through the segment map
 * (florence ↔ firenze, …); works for every page whose slug is NOT localized
 * (home, indexes, apartments, districts, blog). Pages with per-locale slugs
 * (mood, FAQ) must override the result via the AlternateLocale context instead.
 * e.g. switchLocalePath('/it/firenze/appartamenti/abaco', 'it', 'en')
 *        → '/en/florence/accommodations/abaco'
 */
export function switchLocalePath(
  localizedPathname: string,
  fromLocale: Locale,
  toLocale: Locale,
): string {
  const parts = localizedPathname.split('/').filter(Boolean);
  // Drop the leading locale segment if present.
  const rest = locales.includes(parts[0] as Locale) ? parts.slice(1) : parts;
  const canonical = canonicalPath(fromLocale, '/' + rest.join('/'));
  const localized = localizedPath(toLocale, canonical);
  return `/${toLocale}${localized === '/' ? '' : localized}`;
}

/** Maps model API keys (detail records) to their canonical path prefixes */
const modelPrefixes: Record<string, string> = {
  apartment: 'florence/accommodations',
  district: 'florence/districts',
  mood: 'moods',
  post: 'blog',
  page: 'info',
};

/** Maps singleton/index model API keys to their canonical paths (no slug needed) */
const indexPaths: Record<string, string> = {
  home_page: '/',
  index_apartment: '/florence/accommodations',
  index_district: '/florence/districts',
  index_mood: '/moods',
  index_faq: '/faq',
  index_guestbook: '/guestbook',
};

/** Whether a model API key corresponds to a singleton/index page (no slug required) */
export function isSingletonModelApiKey(modelApiKey: string): boolean {
  return modelApiKey in indexPaths;
}

/**
 * Generates the full localized path for a DatoCMS model record.
 * Handles both detail records (with slug) and singleton/index pages (no slug).
 * e.g. modelPath('apartment', 'abaco', 'it') → '/it/firenze/appartamenti/abaco'
 * e.g. modelPath('index_apartment', '', 'it') → '/it/firenze/appartamenti'
 */
export function modelPath(modelApiKey: string, slug: string, locale: Locale): string | null {
  // Check singleton/index models first
  const indexPath = indexPaths[modelApiKey];
  if (indexPath) {
    return `/${locale}${localizedPath(locale, indexPath)}`;
  }

  const prefix = modelPrefixes[modelApiKey];
  if (!prefix) return null;
  return `/${locale}${localizedPath(locale, `/${prefix}/${slug}`)}`;
}
