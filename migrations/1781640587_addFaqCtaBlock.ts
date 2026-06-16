import { Client } from 'datocms/lib/cma-client-node';

/**
 * Add a "FAQ" structured-text block (`cta_faq`) that embeds a single FAQ record,
 * rendered front-end as the coloured question + short-answer card (same look as
 * the mood page's related-FAQ box).
 *
 * 1. Create the `cta_faq` block model with one required `faq` link field
 *    (single FaqRecord).
 * 2. Allow the new block inside the structured-text fields that asked for it:
 *    `post.content` and `page.structured_text`.
 *
 * Idempotent: an existing block model / field is reused, and the block id is
 * only appended to a field's allow-list when not already present.
 */

const FAQ_ITEM_TYPE_ID = '2803';

// Structured-text fields that should accept the new block (field id → label).
const TARGET_FIELDS = [
  { id: 'ROuqlOUlSuS27RyeDi4rqg', label: 'post.content' },
  { id: 'EOZzbknlQ8iV1dYIv56tFw', label: 'page.structured_text' },
];

export default async function (client: Client): Promise<void> {
  // 1. Create (or reuse) the `cta_faq` block model.
  const itemTypes = await client.itemTypes.list();
  let block = itemTypes.find((it) => it.api_key === 'cta_faq' && it.modular_block);

  if (!block) {
    block = await client.itemTypes.create({
      name: 'CTA FAQ',
      api_key: 'cta_faq',
      modular_block: true,
    });
    console.log(`✓ created block model cta_faq (${block.id})`);
  } else {
    console.log(`! block model cta_faq already exists (${block.id})`);
  }

  // 1b. Ensure its required `faq` link field exists.
  const blockFields = await client.fields.list(block.id);
  if (!blockFields.some((f) => f.api_key === 'faq')) {
    await client.fields.create(block.id, {
      label: 'FAQ',
      api_key: 'faq',
      field_type: 'link',
      validators: {
        item_item_type: { item_types: [FAQ_ITEM_TYPE_ID] },
        required: {},
      },
      appearance: { addons: [], editor: 'link_embed', parameters: {} },
    });
    console.log('✓ created field cta_faq.faq');
  }

  // 2. Append the block to each target structured-text field's allow-list.
  for (const { id, label } of TARGET_FIELDS) {
    const field = await client.fields.find(id);
    const validators = { ...(field.validators as Record<string, unknown>) };
    const blocks = (validators.structured_text_blocks as { item_types: string[] }) ?? {
      item_types: [],
    };

    if (blocks.item_types.includes(block.id)) {
      console.log(`! ${label}: already allows cta_faq`);
      continue;
    }

    validators.structured_text_blocks = {
      ...blocks,
      item_types: [...blocks.item_types, block.id],
    };
    await client.fields.update(id, { validators });
    console.log(`✓ ${label}: now allows cta_faq`);
  }
}
