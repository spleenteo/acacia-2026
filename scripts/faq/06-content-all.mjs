/**
 * V3 — Contenuto completo per tutti i rami (env acacia-2026), idempotente.
 *
 * Per OGNI faq che non ha ancora `answer_structured`:
 *  - imposta `slug` (en/it da question) se mancante
 *  - converte `answer` (HTML) → `answer_structured` (DAST) per en e it
 * Salta i record che hanno già `answer_structured` (preserva le conversioni e
 * il link interno demo di V2). Alla fine pubblica tutto il non pubblicato.
 *
 * I parent (albero) sono già impostati da Matteo in UI.
 *
 * Eseguire: node scripts/faq/06-content-all.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import { parse5ToStructuredText } from 'datocms-html-to-structured-text';
import { parse } from 'parse5';
import { validate } from 'datocms-structured-text-utils';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: process.env.DATOCMS_ENVIRONMENT });

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

async function htmlToDast(html) {
  const safe = html && html.trim() ? html : '<p>—</p>';
  const dast = await parse5ToStructuredText(parse(safe));
  if (!validate(dast).valid) throw new Error('DAST non valido: ' + validate(dast).message);
  return dast;
}

const hasStructured = (it) => {
  const en = it.answer_structured?.en;
  return !!en?.document?.children?.length;
};

async function main() {
  const all = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' }, nested: true }))
    all.push(it);

  let converted = 0;
  let skipped = 0;
  for (const it of all) {
    if (hasStructured(it)) {
      skipped++;
      continue;
    }
    const slugEn = it.slug?.en || slugify(it.question?.en);
    const slugIt = it.slug?.it || slugify(it.question?.it) || slugEn;
    const dastEn = await htmlToDast(it.answer?.en);
    const dastIt = await htmlToDast(
      it.answer?.it && it.answer.it.trim().length > 1 ? it.answer.it : null,
    );
    await client.items.rawUpdate(it.id, {
      data: {
        type: 'item',
        id: it.id,
        attributes: {
          slug: { en: slugEn, it: slugIt },
          answer_structured: { en: dastEn, it: dastIt },
        },
      },
    });
    converted++;
    console.log(`✔ ${slugEn}`);
  }
  console.log(`\nConvertiti ${converted}, saltati ${skipped} (già fatti).`);

  // publish all non-published
  const toPublish = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' } })) {
    if (it.meta.status !== 'published') toPublish.push(it.id);
  }
  for (const id of toPublish) await client.items.publish(id);
  console.log(`Pubblicati ${toPublish.length} record.`);
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
