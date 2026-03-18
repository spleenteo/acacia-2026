/**
 * One-off migration script: copy APE values from infoDetail blocks to the new apartment.ape field.
 * Skips empty values and "." placeholders.
 *
 * Usage: npx dotenv -c -- npx tsx scripts/migrate-ape.ts [--dry-run]
 */

import { buildClient } from '@datocms/cma-client-node';
import { executeQuery as cdaExecuteQuery } from '@datocms/cda-client';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  // Use CDA to read apartments with their infoDetail
  const data = await cdaExecuteQuery(
    `{
      allApartments(first: 100) {
        id
        name
        ape
        infoDetail {
          __typename
          ... on InfoTextRecord {
            detailsLabel { name }
            text
          }
        }
      }
    }`,
    {
      token: process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!,
      environment: process.env.DATOCMS_ENVIRONMENT || undefined,
      includeDrafts: true,
      excludeInvalid: true,
    },
  );

  // Use CMA to write
  const client = buildClient({
    apiToken: process.env.DATOCMS_CMA_TOKEN!,
    environment: process.env.DATOCMS_ENVIRONMENT,
  });

  let updated = 0;
  let skipped = 0;

  for (const apt of data.allApartments) {
    const currentApe = (apt.ape || '').trim();

    // Skip if ape already has a meaningful value
    if (currentApe !== '' && currentApe !== '.') {
      console.log(`  SKIP ${apt.name} — ape already set: "${currentApe}"`);
      skipped++;
      continue;
    }

    // Find APE in infoDetail blocks
    const apeBlock = apt.infoDetail.find(
      (d: { __typename: string; detailsLabel?: { name: string }; text?: string }) =>
        d.__typename === 'InfoTextRecord' &&
        d.detailsLabel?.name?.trim().toUpperCase() === 'APE',
    );

    const apeValue = apeBlock?.text?.trim();

    if (!apeValue || apeValue === '' || apeValue === '.') {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  DRY-RUN: ${apt.name} → ape = "${apeValue}"`);
    } else {
      await client.items.update(apt.id, { ape: apeValue });
      console.log(`  UPDATED: ${apt.name} → ape = "${apeValue}"`);
    }
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}${DRY_RUN ? ' (DRY RUN)' : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
