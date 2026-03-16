/**
 * A4: Find orphan gallery_image records (model ID 2729) not linked to any apartment or district.
 *
 * This script:
 * 1. Lists all gallery_image records
 * 2. For each, checks if it has any incoming references (via items.references())
 * 3. Reports orphans and optionally deletes them
 *
 * Run with: npx dotenv -c -- npx tsx scripts/find-orphan-gallery-images.ts
 * Add --delete flag to actually delete orphans:
 *   npx dotenv -c -- npx tsx scripts/find-orphan-gallery-images.ts --delete
 */

import { buildClient, ApiError } from '@datocms/cma-client';

const GALLERY_IMAGE_MODEL_ID = '2729';

async function main() {
  const apiToken = process.env.DATOCMS_CMA_TOKEN;
  if (!apiToken) {
    console.error('Missing DATOCMS_CMA_TOKEN in environment');
    process.exit(1);
  }

  const shouldDelete = process.argv.includes('--delete');
  const client = buildClient({ apiToken });

  console.log('Fetching all gallery_image records...\n');

  let totalCount = 0;
  let orphanCount = 0;
  let linkedCount = 0;
  const orphans: { id: string; description?: string }[] = [];

  for await (const item of client.items.listPagedIterator({
    filter: { type: GALLERY_IMAGE_MODEL_ID },
    version: 'current',
  })) {
    totalCount++;

    // Check incoming references
    const references = await client.items.references(item.id);

    if (references.length === 0) {
      orphanCount++;
      const desc =
        typeof item.description === 'object' && item.description
          ? (item.description as Record<string, string>).en ||
            (item.description as Record<string, string>).it ||
            ''
          : '';
      orphans.push({ id: item.id, description: desc });
      console.log(`  🗑️  Orphan: ${item.id} ${desc ? `(${desc.substring(0, 50)})` : ''}`);
    } else {
      linkedCount++;
      console.log(`  ✅ Linked: ${item.id} (${references.length} references)`);
    }
  }

  console.log('\n--- Results ---');
  console.log(`Total gallery_image records: ${totalCount}`);
  console.log(`Linked (keep):              ${linkedCount}`);
  console.log(`Orphans (to delete):        ${orphanCount}`);

  if (orphanCount === 0) {
    console.log('\nNo orphans found. Nothing to do.');
    return;
  }

  if (!shouldDelete) {
    console.log('\nOrphan IDs:');
    orphans.forEach((o) => console.log(`  ${o.id}`));
    console.log('\nRun with --delete flag to delete orphans.');
    return;
  }

  console.log('\nDeleting orphans...');
  let deletedCount = 0;
  let deleteErrors = 0;

  for (const orphan of orphans) {
    try {
      await client.items.destroy(orphan.id);
      deletedCount++;
      console.log(`  ❌ Deleted: ${orphan.id}`);
    } catch (error) {
      deleteErrors++;
      if (error instanceof ApiError) {
        console.error(`  ⚠️  Error deleting ${orphan.id}: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  console.log(`\nDeleted: ${deletedCount}, Errors: ${deleteErrors}`);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
