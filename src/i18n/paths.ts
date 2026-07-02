import { type Locale, locales, defaultLocale } from './config';

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
  // The blog section is published under the public segment "magazine" in both
  // locales; the filesystem route stays `/blog` (canonical) and the proxy
  // rewrites `/magazine` back to it.
  blog: { en: 'magazine', it: 'magazine' },
  // Search page: filesystem route `/search`, Italian public URL `/cerca`.
  search: { en: 'search', it: 'cerca' },
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
};

/** Maps singleton/index model API keys to their canonical paths (no slug needed) */
const indexPaths: Record<string, string> = {
  home_page: '/',
  index_apartment: '/florence/accommodations',
  index_district: '/florence/districts',
  index_mood: '/moods',
  index_blog: '/blog',
  index_faq: '/faq',
  index_guestbook: '/guestbook',
};

/** Whether a model API key corresponds to a singleton/index page (no slug required) */
export function isSingletonModelApiKey(modelApiKey: string): boolean {
  return modelApiKey in indexPaths;
}

/**
 * Slug of the `index_page` collection record that backs an index route.
 * Each record's per-locale slug equals the route's final segment translated
 * into that locale (e.g. `/florence/accommodations` → en `accommodations`,
 * it `appartamenti`; `/blog` → `magazine` in both). DatoCMS filters localized
 * slugs against the queried locale, so the page must select with this value.
 * e.g. indexPageSlug('/florence/accommodations', 'it') → 'appartamenti'
 */
export function indexPageSlug(canonicalRoute: string, locale: Locale): string {
  const segment = canonicalRoute.split('/').filter(Boolean).pop() ?? '';
  return pathSegments[segment]?.[locale] ?? segment;
}

/** Canonical index routes that are backed by `index_page` collection records. */
const indexPageRoutes = [
  '/florence/accommodations',
  '/florence/districts',
  '/moods',
  '/blog',
  '/faq',
  '/guestbook',
] as const;

/**
 * Resolves an `index_page` collection record to its localized URL from the
 * record's (localized) slug — the inverse of {@link indexPageSlug}. Records
 * whose slug has no front-end route yet (e.g. `services`, `offers`) return
 * `null`. e.g. indexPageRouteBySlug('quartieri', 'it') → '/it/firenze/quartieri'
 */
export function indexPageRouteBySlug(slug: string, locale: Locale): string | null {
  const route = indexPageRoutes.find((r) => indexPageSlug(r, locale) === slug);
  return route ? `/${locale}${localizedPath(locale, route)}` : null;
}

/**
 * Generates the full localized path for a DatoCMS model record.
 * Handles both detail records (with slug) and singleton/index pages (no slug).
 * e.g. modelPath('apartment', 'abaco', 'it') → '/it/firenze/appartamenti/abaco'
 * e.g. modelPath('index_apartment', '', 'it') → '/it/firenze/appartamenti'
 * e.g. modelPath('index_page', 'quartieri', 'it') → '/it/firenze/quartieri'
 */
export function modelPath(modelApiKey: string, slug: string, locale: Locale): string | null {
  // `index_page` is a collection: one model backing many index routes, so the
  // record's slug (not its api_key) selects the destination.
  if (modelApiKey === 'index_page') {
    return indexPageRouteBySlug(slug, locale);
  }

  // Legacy singleton index models map straight to a fixed path (no slug).
  const indexPath = indexPaths[modelApiKey];
  if (indexPath) {
    return `/${locale}${localizedPath(locale, indexPath)}`;
  }

  const prefix = modelPrefixes[modelApiKey];
  if (!prefix) return null;
  return `/${locale}${localizedPath(locale, `/${prefix}/${slug}`)}`;
}

/**
 * Builds a `/{locale}`-prefixed URL, collapsing the root path so the home page
 * stays `/{locale}` instead of `/{locale}/` (a trailing slash would mismatch the
 * served URL and break the self-canonical).
 */
export function localeUrl(locale: Locale, path: string): string {
  const localized = localizedPath(locale, path);
  return localized === '/' ? `/${locale}` : `/${locale}${localized}`;
}

/**
 * The `x-default` hreflang entry for a set of per-locale URLs: the default
 * locale's URL when present, otherwise the first available one. Returns an empty
 * object when there are no URLs, so it can be spread unconditionally.
 * e.g. xDefault({ en: '/en/moods', it: '/it/moods' }) → { 'x-default': '/en/moods' }
 */
export function xDefault(languages: Record<string, string>): Record<string, string> {
  const fallback = languages[defaultLocale] ?? Object.values(languages)[0];
  return fallback ? { 'x-default': fallback } : {};
}

/**
 * Builds the `alternates` (canonical + per-locale `languages` + `x-default`) for
 * a page whose slug is NOT localized — the same canonical path translated into
 * each locale. Pages with per-locale slugs (mood, FAQ) build their alternates
 * from the record's localized slugs instead.
 * e.g. indexAlternates('it', '/moods') → { canonical: '/it/moods', languages: { en: '/en/moods', it: '/it/moods', 'x-default': '/en/moods' } }
 */
export function indexAlternates(locale: Locale, path: string) {
  const languages = Object.fromEntries(locales.map((l) => [l, localeUrl(l, path)]));
  return {
    canonical: localeUrl(locale, path),
    languages: { ...languages, ...xDefault(languages) },
  };
}

/**
 * Per-locale URLs for a detail record whose slug is **localized** (mood, post),
 * derived from its `_allSlugLocales`. `prefix` is the canonical section path
 * (e.g. 'moods', 'blog' — translated per locale by {@link localizedPath}).
 *
 * - `mode: 'hreflang'` includes only locales that actually have a translation —
 *   a missing locale has no equivalent URL to advertise, so it is omitted.
 * - `mode: 'switcher'` falls back to the section index for a missing locale, so
 *   the UI language toggle always lands somewhere valid instead of a soft-404.
 */
export function localizedSlugPaths(
  allSlugLocales: ReadonlyArray<{ locale: string | null; value: string | null }>,
  prefix: string,
  mode: 'hreflang' | 'switcher',
): Record<string, string> {
  const slugByLocale = new Map(allSlugLocales.map((s) => [s.locale, s.value]));
  const paths: Record<string, string> = {};
  for (const l of locales) {
    const slug = slugByLocale.get(l);
    if (slug) paths[l] = `/${l}${localizedPath(l, `/${prefix}/${slug}`)}`;
    else if (mode === 'switcher') paths[l] = `/${l}${localizedPath(l, `/${prefix}`)}`;
  }
  return paths;
}

/**
 * Expands a list of slugs into `{ locale, slug }` params for every locale —
 * the shared body of the detail pages' `generateStaticParams`. Skips empty slugs.
 */
export function localeSlugParams(slugs: ReadonlyArray<string | null | undefined>) {
  const valid = slugs.filter((s): s is string => Boolean(s));
  return locales.flatMap((locale) => valid.map((slug) => ({ locale, slug })));
}
