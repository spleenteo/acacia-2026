/**
 * V1 — Seed ramo DURANTE + migrazione risposte EN (env acacia-2026), idempotente.
 *
 * - Crea i 3 nodi radice (PRIMA / DURANTE / DOPO) se mancanti
 * - Crea i 2 sotto-temi sotto DURANTE
 * - Riaggancia 6 FAQ esistenti come figlie dei sotto-temi (parent via tree)
 * - Converte la answer.en (HTML) → answer_structured.en (DAST) per i nodi del ramo
 *
 * Eseguire: node scripts/faq/02-seed-durante.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import { parse5ToStructuredText } from 'datocms-html-to-structured-text';
import { parse } from 'parse5';
import { validate } from 'datocms-structured-text-utils';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/DATOCMS_CMA_TOKEN=("?)([^"\n]+)\1/)?.[2];
const client = buildClient({ apiToken: token, environment: process.env.DATOCMS_ENVIRONMENT });
const FAQ = '2803';

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

const wrapP = (text) => `<p>${text}</p>`;

async function main() {
  const all = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' }, nested: true }))
    all.push(it);

  const bySlugEn = new Map(all.filter((i) => i.slug?.en).map((i) => [i.slug.en, i]));
  const byQuestionEn = (needle) =>
    all.find((i) => (i.question?.en || '').toLowerCase().includes(needle.toLowerCase()));

  // crea o riusa un nodo strutturale (root/sotto-tema)
  async function ensureNode({ qEn, qIt, slugEn, slugIt, introEn, introIt, parentId }) {
    const existing = bySlugEn.get(slugEn);
    const htmlEn = wrapP(introEn);
    const htmlIt = wrapP(introIt);
    const dastEn = await htmlToDast(htmlEn);
    const dastIt = await htmlToDast(htmlIt);
    if (existing) {
      await client.items.rawUpdate(existing.id, {
        data: {
          type: 'item',
          id: existing.id,
          attributes: { answer_structured: { en: dastEn, it: dastIt } },
          ...(parentId
            ? { relationships: { parent: { data: { type: 'item', id: parentId } } } }
            : {}),
        },
      });
      console.log(`• riusato nodo "${qEn}" (${existing.id})`);
      return existing.id;
    }
    const created = await client.items.rawCreate({
      data: {
        type: 'item',
        attributes: {
          question: { en: qEn, it: qIt },
          slug: { en: slugEn, it: slugIt },
          answer: { en: htmlEn, it: htmlIt },
          answer_structured: { en: dastEn, it: dastIt },
        },
        relationships: {
          item_type: { data: { type: 'item_type', id: FAQ } },
          ...(parentId ? { parent: { data: { type: 'item', id: parentId } } } : {}),
        },
      },
    });
    bySlugEn.set(slugEn, created);
    console.log(`✔ creato nodo "${qEn}" (${created.id})`);
    return created.id;
  }

  // aggancia una FAQ esistente a un parent + slug + conversione answer
  async function attachFaq(needle, parentId) {
    const item = byQuestionEn(needle);
    if (!item) {
      console.log(`⚠ FAQ non trovata per "${needle}" — salto`);
      return;
    }
    const slugEn = item.slug?.en || slugify(item.question?.en);
    const dast = await htmlToDast(item.answer?.en);
    await client.items.rawUpdate(item.id, {
      data: {
        type: 'item',
        id: item.id,
        attributes: {
          slug: { en: slugEn, it: item.slug?.it ?? '' },
          ...(dast ? { answer_structured: { en: dast } } : {}),
        },
        relationships: { parent: { data: { type: 'item', id: parentId } } },
      },
    });
    console.log(`✔ agganciata FAQ "${item.question.en.slice(0, 50)}…" → parent ${parentId}`);
  }

  // 1) radici
  await ensureNode({
    qEn: 'Before you book',
    qIt: 'Prima di prenotare',
    slugEn: 'before-booking',
    slugIt: 'prima-di-prenotare',
    introEn: 'Everything you may want to know before reserving your Florence apartment.',
    introIt: 'Tutto quello che vuoi sapere prima di prenotare il tuo appartamento a Firenze.',
  });
  const durante = await ensureNode({
    qEn: 'Getting ready for your trip',
    qIt: 'Preparati al viaggio',
    slugEn: 'getting-ready',
    slugIt: 'preparati-al-viaggio',
    introEn: 'You booked — here is how to arrive smoothly and feel at home from minute one.',
    introIt: 'Hai prenotato: ecco come arrivare senza intoppi e sentirti a casa dal primo minuto.',
  });
  await ensureNode({
    qEn: 'During your stay',
    qIt: 'Durante il soggiorno',
    slugEn: 'during-your-stay',
    slugIt: 'durante-il-soggiorno',
    introEn: 'Local tips and practical help while you live your Florentine days.',
    introIt: 'Consigli locali e aiuto pratico mentre vivi le tue giornate fiorentine.',
  });

  // 2) sotto-temi di DURANTE
  const st1 = await ensureNode({
    qEn: 'Getting here & finding the house',
    qIt: 'Come arrivare e trovare casa',
    slugEn: 'getting-here',
    slugIt: 'come-arrivare',
    introEn: 'Trains, driving, the ZTL, and the famous red & blue street numbers of Florence.',
    introIt: 'Treni, auto, la ZTL e i famosi numeri civici rossi e blu di Firenze.',
    parentId: durante,
  });
  const st2 = await ensureNode({
    qEn: 'Check-in & what to bring',
    qIt: 'Check-in e cosa portare',
    slugEn: 'check-in',
    slugIt: 'check-in',
    introEn: 'How check-in works, documents, extra services and what to pack.',
    introIt: 'Come funziona il check-in, i documenti, i servizi extra e cosa mettere in valigia.',
    parentId: durante,
  });

  // 3) aggancio FAQ esistenti
  await attachFaq('driving to Florence', st1);
  await attachFaq('read numbers of the doors', st1);
  await attachFaq('get the keys of the apartment', st1);
  await attachFaq('sign anything at check in', st2);
  await attachFaq('check in/out early', st2);
  await attachFaq('AC adaptors', st2);

  // verifica parent
  console.log('\n--- verifica albero DURANTE ---');
  const after = [];
  for await (const it of client.items.listPagedIterator({ filter: { type: 'faq' }, nested: true }))
    after.push(it);
  const children = (pid) => after.filter((i) => i.parent === pid || i.parent?.id === pid);
  console.log(
    'DURANTE figli:',
    children(durante)
      .map((c) => c.slug?.en)
      .join(', '),
  );
  console.log(
    'ST getting-here figli:',
    children(st1)
      .map((c) => c.slug?.en)
      .join(', '),
  );
  console.log(
    'ST check-in figli:',
    children(st2)
      .map((c) => c.slug?.en)
      .join(', '),
  );
}

main().catch((e) => {
  console.error('ERRORE:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
