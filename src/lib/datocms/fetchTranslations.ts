import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import type { Locale } from '@/i18n/config';

const translationsQuery = graphql(`
  query AllTranslations($locale: SiteLocale!, $first: IntType!, $skip: IntType!) {
    allTranslations(first: $first, skip: $skip, locale: $locale) {
      key
      value
    }
  }
`);

/** CDA max page size. Paged so >500 translation keys can't be silently lost. */
const PAGE_SIZE = 500;

/**
 * Convert flat dot-notation keys to a nested object.
 * e.g. { "nav.book": "Book" } → { nav: { book: "Book" } }
 */
function nestKeys(records: { key: string; value: string }[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const { key, value } of records) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * Fetch all Translation records from DatoCMS CDA for the given locale,
 * converting dot-notation keys into a nested messages object for next-intl.
 *
 * Results are cached via Next.js Data Cache (tagged "datocms") and invalidated
 * by the same webhook that invalidates all other CDA content.
 */
export async function fetchTranslations(locale: Locale): Promise<Record<string, unknown>> {
  const records: { key: string; value: string }[] = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const data = await executeQuery(translationsQuery, {
      variables: { locale, first: PAGE_SIZE, skip },
      // In dev, skip the Data Cache so new Translation records show immediately
      // (no need to wipe `.next/cache`). In prod the webhook invalidates the tag.
      noStore: process.env.NODE_ENV !== 'production',
    });
    records.push(...data.allTranslations);
    if (data.allTranslations.length < PAGE_SIZE) break;
  }

  return nestKeys(records);
}
