import { buildClient } from '@datocms/cma-client-node';
import { parse5ToStructuredText } from 'datocms-html-to-structured-text';
import { parse } from 'parse5';

const client = buildClient({
  apiToken: process.env.DATOCMS_CMA_TOKEN,
  environment: process.env.DATOCMS_ENVIRONMENT,
});
const LOCALES = ['en', 'it'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// structured_text `description`, identical to index_apartment's EXCEPT not required
// (faq has an empty intro and index_event has no record — a required empty
// structured text would break published reads).
const DESC_FIELD = {
  label: 'Description',
  api_key: 'description',
  field_type: 'structured_text',
  localized: true,
  validators: {
    structured_text_blocks: { item_types: [] },
    structured_text_inline_blocks: { item_types: [] },
    structured_text_links: {
      item_types: [],
      on_publish_with_unpublished_references_strategy: 'fail',
      on_reference_unpublish_strategy: 'delete_references',
      on_reference_delete_strategy: 'delete_references',
    },
  },
  appearance: {
    addons: [],
    editor: 'structured_text',
    parameters: {
      marks: ['strong', 'emphasis', 'underline', 'strikethrough', 'highlight'],
      nodes: ['blockquote', 'heading', 'list', 'thematicBreak'],
      heading_levels: [2, 3],
      blocks_start_collapsed: false,
      show_links_meta_editor: false,
      show_links_target_blank: true,
    },
  },
};

const TARGETS = [
  ['index_guestbook', 'intro'],
  ['index_faq', 'intro'],
  ['index_service', 'intro'],
  ['index_blog', 'intro'],
  ['index_offer', 'intro'],
  ['index_event', 'intro'],
  ['index_mood', 'description'],
  ['index_district', 'description'],
];

async function htmlToDast(html) {
  if (!html || !String(html).trim()) return null;
  return await parse5ToStructuredText(parse(String(html)));
}
async function updateWithRetry(fn, attempts = 10, delay = 3000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      const m = e?.message || String(e);
      if (!/ITEM_LOCKED|INVALID_DRAFT/.test(m) || i === attempts - 1) throw e;
      await sleep(delay);
    }
  }
}

const itemTypes = await client.itemTypes.list();

// Phase 1: read + convert all source content BEFORE any destructive change.
const plan = [];
for (const [model, source] of TARGETS) {
  const it = itemTypes.find((t) => t.api_key === model);
  const fields = await client.fields.list(it.id);
  const [record] = await client.items.list({ filter: { type: it.id } });
  const srcVal = record ? record[source] || {} : {};
  const desc = {};
  for (const loc of LOCALES) desc[loc] = await htmlToDast(srcVal[loc]);
  plan.push({ it, model, source, fields, record, desc });
}

// Phase 2: mutate.
for (const { it, model, source, fields, record, desc } of plan) {
  if (source === 'description') {
    const existing = fields.find((f) => f.api_key === 'description');
    if (existing && existing.field_type !== 'structured_text') {
      await client.fields.destroy(existing.id);
      await sleep(2000);
    }
  }
  const after = await client.fields.list(it.id);
  if (!after.some((f) => f.api_key === 'description')) {
    await client.fields.create(it.id, DESC_FIELD);
    await sleep(4000);
  }
  if (record) {
    const value = {};
    let any = false;
    for (const loc of LOCALES) {
      if (desc[loc]) {
        value[loc] = desc[loc];
        any = true;
      } else {
        value[loc] = null;
      }
    }
    if (any) {
      await updateWithRetry(() => client.items.update(record.id, { description: value }));
      if (it.draft_mode_active) await client.items.publish(record.id);
    }
    console.log(`✓ ${model}: description ${any ? 'populated' : 'empty'} (from ${source})`);
  } else {
    console.log(`✓ ${model}: field created (no record)`);
  }
}
console.log('done');
