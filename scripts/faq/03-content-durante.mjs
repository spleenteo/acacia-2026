/**
 * V1 — Contenuto ramo DURANTE (env acacia-2026), idempotente.
 * Solo update di campo (niente parent: la gerarchia la si fa in UI).
 *
 * Per le 6 FAQ del ramo DURANTE: imposta lo `slug` (en) e converte
 * `answer` (HTML) → `answer_structured` (DAST). I nodi strutturali hanno già slug+intro.
 *
 * Eseguire: node scripts/faq/03-content-durante.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import { parse5ToStructuredText } from 'datocms-html-to-structured-text';
import { parse } from 'parse5';
import { validate } from 'datocms-structured-text-utils';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: 'acacia-2026' });

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

async function htmlToDast(html) {
  if (!html || !html.trim()) return null;
  const dast = await parse5ToStructuredText(parse(html));
  if (!validate(dast).valid) throw new Error('DAST non valido: ' + validate(dast).message);
  return dast;
}

const TARGETS = [
  'driving to Florence',
  'read numbers of the doors',
  'get the keys of the apartment',
  'sign anything at check in',
  'check in/out early',
  'AC adaptors',
];

async function main() {
  const all = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' }, nested: true }))
    all.push(it);

  for (const needle of TARGETS) {
    const item = all.find((i) =>
      (i.question?.en || '').toLowerCase().includes(needle.toLowerCase()),
    );
    if (!item) {
      console.log(`⚠ non trovata: "${needle}"`);
      continue;
    }
    const slugEn = item.slug?.en || slugify(item.question?.en);
    // Campo localizzato: bisogna fornire ENTRAMBE le locale altrimenti l'API
    // interpreta la locale mancante come "rimuovi". L'IT è placeholder per ora.
    const itHtml =
      item.answer?.it && item.answer.it.trim().length > 1 ? item.answer.it : '<p>—</p>';
    const dastEn = await htmlToDast(item.answer?.en);
    const dastIt = await htmlToDast(itHtml);
    await client.items.rawUpdate(item.id, {
      data: {
        type: 'item',
        id: item.id,
        attributes: {
          slug: { en: slugEn, it: item.slug?.it ?? '' },
          answer_structured: { en: dastEn, it: dastIt },
        },
      },
    });
    console.log(`✔ "${item.question.en.slice(0, 48)}…" → slug:${slugEn} answer_structured: en+it`);
  }
  console.log('\nFatto. Slug + answer_structured impostati sulle 6 FAQ del ramo DURANTE.');
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
