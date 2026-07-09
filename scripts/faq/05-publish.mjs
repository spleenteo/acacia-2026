/**
 * V1/V2 — Pubblica i record faq con modifiche non pubblicate (env acacia-2026).
 *
 * Il modello `faq` ha draft_mode_active: true → gli update CMA creano bozze.
 * Questo script pubblica tutto ciò che non è `published`, così la CDA pubblicata
 * (usata dal sito) riflette gli ultimi contenuti.
 *
 * NB futuro: gli script di migrazione dovrebbero pubblicare dopo ogni write.
 *
 * Eseguire: node scripts/faq/05-publish.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: process.env.DATOCMS_ENVIRONMENT });

async function main() {
  const toPublish = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' } })) {
    if (it.meta.status !== 'published') toPublish.push(it.id);
  }
  if (toPublish.length === 0) {
    console.log('• tutto già pubblicato');
    return;
  }
  for (const id of toPublish) {
    await client.items.publish(id);
    console.log(`✔ pubblicato ${id}`);
  }
  console.log(`\nPubblicati ${toPublish.length} record.`);
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
