import { Client, buildBlockRecord } from 'datocms/lib/cma-client-node';

/**
 * Standardize the index singletons:
 *  1. Rename every `page_*` single-instance model to `index_*` (singular —
 *     DatoCMS rejects plural model api_keys with VALIDATION_PLURAL).
 *  2. Add a `hero` field to each — a frameless single block restricted to the
 *     `hero_index` block, required + localized — an exact copy of the existing
 *     `index_apartment.hero`.
 *  3. Copy each page's `title`/`subtitle` into a new `hero_index` block per
 *     locale, with a per-section `color` tone.
 *
 * The legacy `title`/`subtitle` fields are left in place (copied, not moved) so
 * the existing index pages keep rendering until each is migrated to the block.
 *
 * Idempotent: a model already renamed (or already carrying a `hero` field) is
 * detected and the corresponding step is skipped, so the script is safe to
 * re-run and to replay on a pristine environment (e.g. master).
 */

const LOCALES = ['en', 'it'] as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Adding a required field kicks off a background re-validation job that briefly
 * locks the model's records (ITEM_LOCKED) and, until it settles, rejects the
 * populating update (INVALID_DRAFT). Both are transient — retry through them.
 */
async function updateWithRetry(
  fn: () => Promise<unknown>,
  attempts = 10,
  delayMs = 3000,
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const transient = /ITEM_LOCKED|INVALID_DRAFT/.test(message);
      if (!transient || i === attempts - 1) throw err;
      await sleep(delayMs);
    }
  }
}

/** legacy api_key → { singular renamed api_key, hero color tone }. */
const MODELS: { from: string; to: string; color: string }[] = [
  { from: 'page_moods', to: 'index_mood', color: 'gold' },
  { from: 'page_districts', to: 'index_district', color: 'slate' },
  { from: 'page_faq', to: 'index_faq', color: 'sage' },
  { from: 'page_guestbook', to: 'index_guestbook', color: 'gold' },
  { from: 'page_services', to: 'index_service', color: 'rust' },
  { from: 'page_blog', to: 'index_blog', color: 'sage' },
  { from: 'page_offers', to: 'index_offer', color: 'rust' },
  { from: 'page_acacialife', to: 'index_acacialife', color: 'primary' },
  { from: 'page_event', to: 'index_event', color: 'navy' },
];

export default async function (client: Client): Promise<void> {
  const itemTypes = await client.itemTypes.list();
  const byApiKey = new Map(itemTypes.map((it) => [it.api_key, it]));

  // Resolve the existing `hero_index` block by api_key — numeric/opaque IDs are
  // not stable across environment forks (see recordInfo.ts), so a hardcoded id
  // would break a replay on a pristine environment.
  const heroIndexBlock = byApiKey.get('hero_index');
  if (!heroIndexBlock?.modular_block) {
    throw new Error('hero_index block model not found — it must exist before this migration');
  }
  const heroIndexBlockId = heroIndexBlock.id;

  for (const { from, to, color } of MODELS) {
    // Tolerate a model already renamed by a previous (partial) run.
    const model = byApiKey.get(from) ?? byApiKey.get(to);
    if (!model) {
      console.log(`! ${from}/${to}: not found, skipping`);
      continue;
    }

    // 1. Read the singleton record (localized title/subtitle).
    const [record] = await client.items.list({ filter: { type: model.id } });

    // 2. Rename the model (skip if already renamed).
    if (model.api_key !== to) {
      await client.itemTypes.update(model.id, { api_key: to });
    }

    // 3. Add the `hero` frameless single-block field (skip if it already exists).
    const fields = await client.fields.list(model.id);
    if (!fields.some((f) => f.api_key === 'hero')) {
      await client.fields.create(model.id, {
        label: 'Hero',
        api_key: 'hero',
        field_type: 'single_block',
        localized: true,
        validators: {
          single_block_blocks: { item_types: [heroIndexBlockId] },
          required: {},
        },
        appearance: { addons: [], editor: 'frameless_single_block', parameters: {} },
      });
      // Let the field-creation background job (which locks records) settle.
      await sleep(5000);
    }

    // 4. Populate the hero block per locale from the page's title/subtitle.
    if (record) {
      const title = (record.title ?? {}) as Record<string, string>;
      const subtitle = (record.subtitle ?? {}) as Record<string, string>;

      const hero: Record<string, ReturnType<typeof buildBlockRecord>> = {};
      for (const loc of LOCALES) {
        hero[loc] = buildBlockRecord({
          item_type: { type: 'item_type', id: heroIndexBlockId },
          color,
          title: title[loc] || title.en || to,
          subtitle: subtitle[loc] || subtitle.en || '',
        });
      }

      await updateWithRetry(() => client.items.update(record.id, { hero }));
      if (model.draft_mode_active) {
        await client.items.publish(record.id);
      }
      console.log(`✓ ${from} → ${to} (hero: ${color})`);
    } else {
      console.log(`✓ ${from} → ${to} (renamed + field; no record to populate)`);
    }
  }
}
