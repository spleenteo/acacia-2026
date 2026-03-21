/**
 * Export DatoCMS Translation records to JSON files for next-intl.
 *
 * Usage:
 *   npx tsx scripts/export-translations.ts
 *
 * Generates:
 *   src/messages/en.json
 *   src/messages/it.json
 *
 * Requires DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN in .env.local
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const TOKEN = process.env.DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN;
if (!TOKEN) {
  console.error('Missing DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN');
  process.exit(1);
}

const ENDPOINT = 'https://graphql.datocms.com';
const LOCALES = ['en', 'it'] as const;

const query = `
  query AllTranslations($locale: SiteLocale!) {
    allTranslations(first: 500, locale: $locale) {
      key
      value
    }
  }
`;

type TranslationRecord = { key: string; value: string };

async function fetchTranslations(locale: string): Promise<TranslationRecord[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
    'X-Exclude-Invalid': 'true',
  };
  if (process.env.DATOCMS_ENVIRONMENT) {
    headers['X-Environment'] = process.env.DATOCMS_ENVIRONMENT;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables: { locale } }),
  });

  if (!res.ok) {
    throw new Error(`DatoCMS returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data.allTranslations;
}

/**
 * Convert flat dot-notation keys to nested object.
 * e.g. { "nav.book": "Book" } → { nav: { book: "Book" } }
 */
function nestKeys(records: TranslationRecord[]): Record<string, unknown> {
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

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(__dirname, '../src/messages');

  for (const locale of LOCALES) {
    console.log(`Fetching translations for "${locale}"...`);
    const records = await fetchTranslations(locale);
    const nested = nestKeys(records);
    const outPath = resolve(outDir, `${locale}.json`);
    writeFileSync(outPath, JSON.stringify(nested, null, 2) + '\n');
    console.log(`  ✓ ${outPath} (${records.length} keys)`);
  }

  console.log('\nDone!');
}

main();
