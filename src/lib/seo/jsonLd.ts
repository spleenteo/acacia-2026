import { type Locale } from '@/i18n/config';
import { localeUrl } from '@/i18n/paths';

/**
 * Shared JSON-LD builders. Callers must pass values already cleaned with
 * `stripStega()` (these objects are serialized via `JSON.stringify`, a
 * non-render path — see CLAUDE.md "Stega encoding & stripStega").
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Absolute, locale-prefixed, segment-localized URL for a canonical path. */
export function absoluteUrl(locale: Locale, canonicalPath: string): string {
  return `${siteUrl}${localeUrl(locale, canonicalPath)}`;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Localized display names for the section (level-2) breadcrumb crumb. */
const sectionNames: Record<string, Record<Locale, string>> = {
  '/florence/accommodations': { en: 'Accommodations', it: 'Appartamenti' },
  '/florence/districts': { en: 'Districts', it: 'Quartieri' },
  '/moods': { en: 'Moods', it: 'Moods' },
  '/blog': { en: 'Magazine', it: 'Magazine' },
};

/**
 * `Home > Section > Current` BreadcrumbList for a detail page. `name` must
 * already be stripStega-cleaned by the caller. `sectionPath`/`path` are
 * canonical (filesystem) paths — they are localized + made absolute here.
 */
export function detailBreadcrumbJsonLd(opts: {
  locale: Locale;
  sectionPath: string;
  path: string;
  name: string;
}): Record<string, unknown> {
  const { locale, sectionPath, path, name } = opts;
  return breadcrumbJsonLd([
    { name: 'Acacia Firenze', url: `${siteUrl}/${locale}` },
    {
      name: sectionNames[sectionPath]?.[locale] ?? sectionPath,
      url: absoluteUrl(locale, sectionPath),
    },
    { name, url: absoluteUrl(locale, path) },
  ]);
}
