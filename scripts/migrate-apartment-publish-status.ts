/**
 * A2: Migrate apartment records from boolean `published` field to native DatoCMS publish/draft status.
 *
 * For each apartment:
 * - published: true  → client.items.publish(id)
 * - published: false → client.items.unpublish(id)
 *
 * Run with: npx tsx scripts/migrate-apartment-publish-status.ts
 * Requires DATOCMS_CMA_TOKEN in .env.local
 */

import { buildClient, ApiError } from '@datocms/cma-client';

const APARTMENT_MODEL_ID = '2726';

async function main() {
  const apiToken = process.env.DATOCMS_CMA_TOKEN;
  if (!apiToken) {
    console.error('Missing DATOCMS_CMA_TOKEN in environment');
    process.exit(1);
  }

  const client = buildClient({ apiToken });

  console.log('Fetching all apartments...');

  let publishedCount = 0;
  let draftCount = 0;
  let errorCount = 0;

  for await (const item of client.items.listPagedIterator({
    filter: { type: APARTMENT_MODEL_ID },
    version: 'current',
  })) {
    const name = item.name || item.id;
    const isPublished = item.published === true;

    try {
      if (isPublished) {
        await client.items.publish(item.id);
        publishedCount++;
        console.log(`  ✅ Published: ${name}`);
      } else {
        await client.items.unpublish(item.id);
        draftCount++;
        console.log(`  📝 Draft: ${name}`);
      }
    } catch (error) {
      errorCount++;
      if (error instanceof ApiError) {
        console.error(`  ❌ Error on ${name}: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  console.log('\n--- Results ---');
  console.log(`Published: ${publishedCount}`);
  console.log(`Draft:     ${draftCount}`);
  console.log(`Errors:    ${errorCount}`);
  console.log(`Total:     ${publishedCount + draftCount + errorCount}`);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
