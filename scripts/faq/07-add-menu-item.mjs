/**
 * Aggiunge la voce "FAQ" al menu principale (campo `nav_items` del singleton `app`),
 * puntando alla pagina singleton `page_faq`. Idempotente. Env acacia-2026.
 *
 * `nav_items` è Modular Content localizzato: i blocchi esistenti si mantengono
 * passando i loro ID; si appende un nuovo blocco `menu_item` per locale.
 *
 * Eseguire: node scripts/faq/07-add-menu-item.mjs
 */
import { buildClient, buildBlockRecord } from '@datocms/cma-client-node';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: 'acacia-2026' });

const MENU_ITEM = 'QvVizRpcSBioYs3t8o5vDQ'; // block model menu_item
const PAGE_FAQ_ITEM = '23571'; // page_faq singleton record

async function alreadyLinksFaq(ids) {
  // resolve block ids → check if any menu_item already points to page_faq
  for (const id of ids) {
    if (typeof id !== 'string') continue;
    const block = await client.items.find(id).catch(() => null);
    if (block?.page === PAGE_FAQ_ITEM) return true;
  }
  return false;
}

async function main() {
  const app = (await client.items.list({ filter: { type: 'app' }, page: { limit: 1 } }))[0];
  const raw = await client.items.find(app.id);
  const en = Array.isArray(raw.nav_items?.en) ? raw.nav_items.en : [];
  const it = Array.isArray(raw.nav_items?.it) ? raw.nav_items.it : [];

  const enHasFaq = await alreadyLinksFaq(en);
  const itHasFaq = await alreadyLinksFaq(it);
  if (enHasFaq && itHasFaq) {
    console.log('• voce FAQ già presente in entrambe le locale — niente da fare');
    return;
  }

  const faqBlock = () =>
    buildBlockRecord({
      item_type: { type: 'item_type', id: MENU_ITEM },
      label: 'FAQ',
      page: PAGE_FAQ_ITEM,
    });

  await client.items.update(app.id, {
    nav_items: {
      en: enHasFaq ? en : [...en, faqBlock()],
      it: itHasFaq ? it : [...it, faqBlock()],
    },
  });
  console.log(
    `✔ voce FAQ aggiunta dove mancava (en:${enHasFaq ? 'già' : 'aggiunta'}, it:${itHasFaq ? 'già' : 'aggiunta'})`,
  );

  await client.items.publish(app.id);
  console.log('✔ app pubblicato');
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
