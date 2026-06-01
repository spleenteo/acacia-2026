/**
 * V1 — Migrazione schema FAQ (env acacia-2026), idempotente.
 *
 * - Abilita tree:true sul modello faq (parent/children nativi DatoCMS) + sortable:false
 * - Aggiunge campo `slug` (localizzato, auto da question)
 * - Aggiunge campo `answer_structured` (structured_text, link a faq/post/page, nessun block)
 *
 * NB: DatoCMS non permette di cambiare il field_type di `answer` (text) → nuovo campo.
 * Il vecchio `answer` resta come legacy.
 *
 * Eseguire: node scripts/faq/01-schema.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: 'acacia-2026' });

const FAQ = '2803';
const POST = '2762';
const PAGE = 'U_D3IZZUTcOj76Aaxqk73g';

async function run() {
  // 1) tree:true + sortable:false
  const faq = await client.itemTypes.find(FAQ);
  if (!faq.tree) {
    await client.itemTypes.update(FAQ, { tree: true, sortable: false });
    console.log('✔ faq → tree:true, sortable:false');
  } else {
    console.log('• faq già tree:true');
  }

  const fields = await client.fields.list(FAQ);
  const byKey = Object.fromEntries(fields.map((f) => [f.api_key, f]));
  const questionId = byKey['question'].id;

  // 2) slug localizzato
  if (!byKey['slug']) {
    await client.fields.create(FAQ, {
      label: 'Slug',
      api_key: 'slug',
      field_type: 'slug',
      localized: true,
      validators: {
        slug_format: { predefined_pattern: 'webpage_slug' },
        slug_title_field: { title_field_id: questionId },
      },
      appearance: {
        addons: [],
        editor: 'slug',
        parameters: { url_prefix: null, placeholder: null },
      },
    });
    console.log('✔ creato campo slug (localizzato, auto da question)');
  } else {
    console.log('• campo slug già presente');
  }

  // 3) answer_structured
  if (!byKey['answer_structured']) {
    await client.fields.create(FAQ, {
      label: 'Answer (Structured)',
      api_key: 'answer_structured',
      field_type: 'structured_text',
      localized: true,
      validators: {
        structured_text_blocks: { item_types: [] },
        structured_text_inline_blocks: { item_types: [] },
        structured_text_links: {
          item_types: [FAQ, POST, PAGE],
          on_publish_with_unpublished_references_strategy: 'fail',
          on_reference_unpublish_strategy: 'delete_references',
          on_reference_delete_strategy: 'delete_references',
        },
      },
      appearance: {
        addons: [],
        editor: 'structured_text',
        parameters: {
          marks: ['strong', 'emphasis', 'underline', 'strikethrough', 'highlight', 'code'],
          nodes: [
            'blockquote',
            'heading',
            'link',
            'list',
            'thematicBreak',
            'itemLink',
            'inlineItem',
          ],
          heading_levels: [2, 3, 4],
          blocks_start_collapsed: false,
          show_links_meta_editor: false,
          show_links_target_blank: true,
        },
      },
    });
    console.log('✔ creato campo answer_structured (link a faq/post/page, no block)');
  } else {
    console.log('• campo answer_structured già presente');
  }

  console.log('\nFatto. Schema faq aggiornato su acacia-2026.');
}

run().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
