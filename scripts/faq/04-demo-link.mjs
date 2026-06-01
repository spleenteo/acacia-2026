/**
 * V2 — Link interno dimostrativo (env acacia-2026), idempotente.
 *
 * Aggiunge in coda alla risposta della FAQ "how to read door numbers" un
 * paragrafo con un itemLink (Structured Text) verso la FAQ "driving & parking".
 * Dimostra i link interni a record (faq/post/page) nelle risposte.
 *
 * Eseguire: node scripts/faq/04-demo-link.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: 'acacia-2026' });

const SOURCE = 'read numbers of the doors'; // FAQ da modificare
const TARGET = 'driving to Florence'; // FAQ verso cui linkare

async function main() {
  const all = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' }, nested: true }))
    all.push(it);

  const find = (needle) =>
    all.find((i) => (i.question?.en || '').toLowerCase().includes(needle.toLowerCase()));
  const source = find(SOURCE);
  const target = find(TARGET);
  if (!source || !target) {
    console.log('⚠ FAQ sorgente o target non trovata');
    return;
  }

  const enVal = source.answer_structured?.en;
  if (!enVal?.document) {
    console.log('⚠ answer_structured.en mancante sulla sorgente');
    return;
  }

  // idempotenza: già presente un itemLink verso il target?
  const already = JSON.stringify(enVal.document).includes(`"item":"${target.id}"`);
  if (already) {
    console.log('• link già presente — niente da fare');
    return;
  }

  const linkParagraph = {
    type: 'paragraph',
    children: [
      { type: 'span', value: 'See also: ' },
      {
        type: 'itemLink',
        item: target.id,
        children: [{ type: 'span', value: 'driving & parking in Florence' }],
      },
      { type: 'span', value: '.' },
    ],
  };

  const newEn = {
    ...enVal,
    document: { ...enVal.document, children: [...enVal.document.children, linkParagraph] },
  };

  await client.items.rawUpdate(source.id, {
    data: {
      type: 'item',
      id: source.id,
      attributes: {
        // localizzato → fornire entrambe le locale (it invariata)
        answer_structured: { en: newEn, it: source.answer_structured?.it ?? null },
      },
    },
  });
  console.log(`✔ aggiunto itemLink: "${source.question.en.slice(0, 40)}…" → faq ${target.id}`);
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
