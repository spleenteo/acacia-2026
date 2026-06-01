---
shaping: true
---

# Sezione FAQ — Shaping

**Stato:** Shaping · **Branch:** `feat/faq` · **Data:** 2026-06-01 (Diana + Matteo)

## Source

Estratti dal grilling con Diana (cliente, non sviluppa) e Matteo:

> Sapere cose importanti, come entrare, com'è la casa, le regole. […] Fondamentalmente i clienti non leggono. Alla terza riga non arrivano. Booking non dice niente, non spiega niente delle case.

> Vorrei condividere con loro anche dei tricks della città. Tipo i numeri blu e i numeri rossi a Firenze. Si perdono perché Google non trova bene le case. Noi gli mandiamo l'indirizzo e vanno a finire al cinquanta rosso, sette rosso. Abbiamo fatto un blog post. Magari le FAQ possono essere più divertenti da leggere — come girare una chiave, come si fa un espresso.

> Noi gli mandiamo il link della home acaciafirenze.com. Questa qui è facile che possa diventare la landing, la pagina principale dopo che hanno prenotato. Quando siamo vicini all'arrivo, dieci giorni prima. Per WhatsApp o per mail.

> PRIMA = prima di prenotare, se hanno domande mentre consultano il sito; DURANTE = prima di arrivare, dalla prenotazione al checkin, le domande di preparazione all'arrivo e al viaggio; DOPO = durante il soggiorno, le cose abituali italiane e Firenze.

> Un solo modello con alberatura ad albero e parent, quindi PRIMA, DURANTE e DOPO non sono altro che i primi record. Ogni nodo di fatto risponde a una domanda/risposta (con tutti i suoi link interni) + eventuali altri nodi siblings, navigazione breadcrumb.

> Una pagina per ogni nodo dell'albero. Una pagina, se ha figli, mostrerà l'elenco dei figli. Dovrà esserci una index con i nodi radici (adesso 3). [Lettura figli:] Accordion + indice in cima.

> (Vincolo di processo) Per qualunque ricerca e interazione con DatoCMS NON usare l'MCP, ma il CLI con le skill.

---

## Problem

Le informazioni pratiche esistono già (portali, email, Booking) ma **gli ospiti non le leggono**. Manca un luogo unico, scansionabile e con personalità, che (a) rassicuri chi è ancora indeciso prima di prenotare, (b) prepari all'arrivo chi ha già prenotato, (c) accompagni durante il soggiorno con trucchi su Firenze. Sul sito Next.js non esiste nulla; su DatoCMS esistono il modello `faq` (26 record, IT quasi tutto vuoto) e il singleton `page_faq`.

## Outcome

Una sezione FAQ ad albero per fasi del ciclo di vita dell'ospite (PRIMA / DURANTE / DOPO), mobile-first e divertente da leggere, dove ogni nodo è una domanda/risposta con URL proprio. La fase DURANTE funziona da landing condivisibile da mandare ~10 giorni prima dell'arrivo. Bilingue EN/IT, integrata nel menu, ottimizzata per la SEO.

---

## Requirements (R)

| ID     | Requirement                                                                                                               | Status       |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **R0** | Sezione FAQ che gli ospiti leggano davvero: scansionabile, mobile-first, tono divertente (antidoto a "non leggono")       | Core goal    |
| **R1** | La fase DURANTE deve avere un URL pulito e condivisibile, da mandare via WhatsApp/mail ~10gg prima dell'arrivo            | Core goal    |
| **R2** | **Struttura contenuti**                                                                                                   |              |
| R2.1   | Albero a fasi del ciclo di vita (PRIMA/DURANTE/DOPO come radici), etichette parlanti per l'utente                         | Must-have    |
| R2.2   | Un solo modello: estendere `faq` con `parent` (self-link, tree) + `slug`. Niente modello categoria separato, niente tag   | Must-have    |
| R2.3   | Ogni nodo = una pagina con URL proprio: breadcrumb + domanda + risposta + lista figli + lista fratelli                    | Must-have    |
| R2.4   | Display: accordion sulle sezioni con domande (risposte inline), indice a card sulle sezioni alte                          | Must-have    |
| **R3** | **Contenuto risposte**                                                                                                    |              |
| R3.1   | `answer` in Structured Text con link interni a record (altre FAQ, Service, Post)                                          | Must-have    |
| R3.2   | Migrazione delle 26 risposte esistenti senza perdita di contenuto (audit tabelle/immagini/link)                           | Must-have    |
| R3.3   | Bilingue EN/IT; i contenuti IT (oggi quasi tutti vuoti) vanno scritti — workstream separato di proprietà di Diana         | Must-have    |
| **R4** | **Routing / i18n**                                                                                                        |              |
| R4.1   | Catch-all `/faq/[...slug]` che risolve un nodo dal path completo (ancestry) e genera il breadcrumb                        | Must-have    |
| R4.2   | Segmento `faq` tradotto per locale + `recordInfo.ts` mappa un record `faq` al suo URL gerarchico (Web Preview/SEO plugin) | Must-have    |
| **R5** | **SEO**                                                                                                                   |              |
| R5.1   | `generateMetadata` con `_seoMetaTags` per ogni nodo                                                                       | Must-have    |
| R5.2   | JSON-LD `FAQPage` sulle pagine che contengono Q&A                                                                         | Nice-to-have |
| **R6** | Voce di navigazione (header e/o footer), ben visibile anche per gli indecisi                                              | Must-have    |
| **R7** | Coerenza con draft mode / stega / realtime preview e visual editing del resto del sito                                    | Must-have    |
| **R8** | Lancio essenziale: tutte e 3 le aree online, ma con poche FAQ per area (le più importanti)                                | Must-have    |

---

## Shape A: Albero `faq` unico esteso + pagine ricorsive catch-all

Approccio selezionato (le decisioni di prodotto sono già prese nel grilling). Estende il modello esistente invece di crearne uno nuovo; le pagine sono ricorsive su un catch-all.

| Part   | Mechanism                                                                                                                                                                                                                                                               | Flag |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| **A1** | **Schema DatoCMS (migration CLI)**                                                                                                                                                                                                                                      |      |
| A1.1   | 🟡 Aggiungere campo `slug` a `faq` (slug type, **localizzato EN/IT** — C-slug-A), auto-fill da `question`                                                                                                                                                               |      |
| A1.2   | 🟡 Abilitare `tree: true` su `faq` (**parent/children nativi DatoCMS — niente self-link**) + `sortable:false`; `position` esiste già                                                                                                                                    |      |
| A1.3   | 🟡 `answer` è `text`: DatoCMS non permette il cambio di `field_type` → **nuovo campo `answer_structured`** (structured_text). Allowlist link = `faq`, `post`, `page` (C-st); **nessun block**. Vecchio `answer` resta legacy; `services` resta come "servizi correlati" |      |
| A1.4   | Rigenerare schema + gql.tada output + CMA types (`npm run generate-schema`, `npm run generate-cma-types`)                                                                                                                                                               |      |
| **A2** | **Migrazione contenuti (script CMA via CLI)**                                                                                                                                                                                                                           |      |
| A2.1   | Audit delle 26 risposte: confermare assenza tabelle/immagini (dump preliminare: solo 3 con `<a>`, nessuna tabella/immagine), mappare i link                                                                                                                             |  ⚠️  |
| A2.2   | Script HTML→DAST per le risposte esistenti (EN); validare il DAST contro l'allowlist                                                                                                                                                                                    |  ⚠️  |
| A2.3   | Seed dei 3 nodi radice (PRIMA/DURANTE/DOPO) + sotto-temi; assegnare `parent`/`slug`/`position` alle 26 esistenti secondo la mappa del grilling                                                                                                                          |      |
| **A3** | **Routing catch-all + i18n**                                                                                                                                                                                                                                            |      |
| A3.1   | Route `src/app/[locale]/faq/[[...slug]]/page.tsx` (index quando slug vuoto)                                                                                                                                                                                             |      |
| A3.2   | Resolver: dato il path di slug, risolvere il nodo finale verificando la catena di antenati (`parent`) per validare l'URL                                                                                                                                                |  ⚠️  |
| A3.3   | `paths.ts`: aggiungere `faq` a `pathSegments` (en `faq` / it `faq` o `domande` → vedi C-seg); helper per il path gerarchico di un nodo                                                                                                                                  |  ⚠️  |
| A3.4   | `recordInfo.ts`: mappare un record `faq` al suo URL gerarchico (richiede risalita degli antenati)                                                                                                                                                                       |  ⚠️  |
| **A4** | **Rendering pagine**                                                                                                                                                                                                                                                    |      |
| A4.1   | Index (`/faq`): usa il singleton `page_faq` (title/subtitle/intro/featured_image/seo) + card dei nodi radice                                                                                                                                                            |      |
| A4.2   | Pagina nodo branch (ha figli): breadcrumb + domanda + risposta + indice a card dei figli                                                                                                                                                                                |      |
| A4.3   | Pagina nodo che contiene domande: breadcrumb + risposta + accordion dei figli (Q&A inline) + lista fratelli                                                                                                                                                             |      |
| A4.4   | 🟡 Renderer Structured Text (`react-datocms`) con `renderInlineRecord`/`renderLinkToRecord` per `faq`/`post`/`page` → href via `recordInfo`/`modelPath`                                                                                                                 |      |
| **A5** | **SEO**                                                                                                                                                                                                                                                                 |      |
| A5.1   | `generateMetadata` per nodo con `_seoMetaTags` + `alternates` canonical/languages sul path gerarchico                                                                                                                                                                   |      |
| A5.2   | JSON-LD `FAQPage` (script) costruito dalle Q&A del nodo — usare `stripStega` sui testi                                                                                                                                                                                  |      |
| **A6** | **Navigazione + label**                                                                                                                                                                                                                                                 |      |
| A6.1   | Voce FAQ in `SiteHeader`/`SiteFooter` con `modelPath`/`localizedPath`                                                                                                                                                                                                   |      |
| A6.2   | Etichette parlanti delle 3 fasi via record DatoCMS (`question` del nodo radice) — niente stringhe hardcoded                                                                                                                                                             |      |
| **A7** | **Draft / realtime / stega**                                                                                                                                                                                                                                            |      |
| A7.1   | `RealtimeWrapper` + `getDraftRealtimeOptions` come nelle detail esistenti; `executeQuery` con `includeDrafts`                                                                                                                                                           |      |
| A7.2   | `stripStega` su tutti i valori fuori dal render path (confronti slug, JSON-LD, meta, cache key)                                                                                                                                                                         |      |

---

## Decisioni di componente (risolte 2026-06-01)

### 🟡 C-slug → **C-slug-A: slug localizzato EN/IT**

Slug diverso per lingua, auto-generato dalla `question` localizzata. URL nativi (`/it/faq/durante/come-arrivare`, `/en/faq/during/how-to-arrive`). Coerente con `pathSegments`; il resolver matcha lo slug nella lingua corrente. _Implica: il resolver di A3.2 risolve per locale._

### 🟡 C-st → **Solo link a record (faq / post / page), nessun block**

L'allowlist dei link/inline item dello Structured Text di `answer` è: **`faq`, `post`, `page`**. Nessun block (niente immagine, niente tabella) — le 26 risposte non ne hanno. Il campo relazione `services` resta disponibile come "servizi correlati", ma **non** è un target di link inline. Estendibile in futuro se servono visual.

### 🟡 C-seg → **C-seg-A: `faq` in entrambe le lingue**

`/en/faq` e `/it/faq`. "FAQ" è immediato anche in italiano, zero attrito.

---

## Fit Check

| Req  | Requirement                                                | Status       | A   |
| ---- | ---------------------------------------------------------- | ------------ | --- |
| R0   | FAQ scansionabile, mobile-first, divertente                | Core goal    | ✅  |
| R1   | DURANTE = URL pulito condivisibile                         | Core goal    | ✅  |
| R2.1 | Albero a fasi ciclo-di-vita, etichette parlanti            | Must-have    | ✅  |
| R2.2 | Modello unico `faq` esteso (parent+slug), no categoria/tag | Must-have    | ✅  |
| R2.3 | Ogni nodo = pagina (breadcrumb + Q&A + figli + fratelli)   | Must-have    | ✅  |
| R2.4 | Accordion foglie + indice card alte                        | Must-have    | ✅  |
| R3.1 | Structured Text con link interni a record                  | Must-have    | ✅  |
| R3.2 | 🟡 Migrazione 26 risposte senza perdita                    | Must-have    | ✅  |
| R3.3 | 🟡 Bilingue EN/IT (capability)                             | Must-have    | ✅  |
| R4.1 | 🟡 Catch-all risolve nodo dal path (ancestry)              | Must-have    | ✅  |
| R4.2 | 🟡 Segmento tradotto + recordInfo gerarchico               | Must-have    | ✅  |
| R5.1 | generateMetadata per nodo                                  | Must-have    | ✅  |
| R5.2 | JSON-LD FAQPage                                            | Nice-to-have | ✅  |
| R6   | Voce in menu visibile                                      | Must-have    | ✅  |
| R7   | Draft/stega/realtime coerenti                              | Must-have    | ✅  |
| R8   | Lancio: 3 aree essenziali                                  | Must-have    | ✅  |

**Note (i ❌ iniziali sono stati risolti dagli spike S1/S2 — vedi sotto):**

- **R3.2 ✅** — S1 conferma: nelle answer solo `p/br/span/ul/li/div/a`, nessuna tabella/immagine/heading; 2 soli link, entrambi esterni (vecchio CMS) → migrazione HTML→DAST pulita con `datocms-html-to-structured-text`.
- **R3.3 ✅** — la shape supporta il bilingue (modello localizzato). Resta la **dipendenza esterna**: 20/26 risposte IT da scrivere (workstream di Diana) — vedi Rischi, non è un blocco di codice.
- **R4.1 / R4.2 ✅** — S2: `recordToWebsiteRoute` è già async; si aggiunge un ramo `faq` che risale gli antenati via util `faqTree` (query flat `allFaqs { id slug parent { id } }` + ricostruzione in JS). Stesso util alimenta catch-all, breadcrumb, recordInfo, sitemap, generateStaticParams.

---

## Spikes

### S1 — Migrazione HTML→Structured Text delle 26 risposte ✅ RISOLTO (env `acacia-2026`)

**Context.** `answer` è oggi `text` WYSIWYG; va portato a Structured Text (DAST) con link a record. R3.2 richiede zero perdita.

**Esiti.**

| #     | Question / Risposta                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-Q1 | Tag presenti nelle answer: `p`(89), `br`(19), `span`(18), `ul`(3)/`li`(9), `div`(16), `a`(2). **Nessuna tabella, immagine, heading.**                                           |
| S1-Q2 | Solo **2 link**, entrambi **esterni** (vecchio CMS `remixto.com`) → nessun link interno a record da migrare. I link a faq/post/page li aggiungono gli editor dopo.              |
| S1-Q3 | `datocms-html-to-structured-text`: `p`→paragraph, `ul/li`→list, `br`→split; `span`/`div`→unwrap (tieni testo); i 2 link esterni → `link` node (o rimossi nel rework contenuti). |
| S1-Q4 | **EN: 26/26 piene. IT: 6/26** → **20 risposte IT da scrivere** (dipendenza contenuti, non codice).                                                                              |

**Acceptance: raggiunta.** Conversione semplice e a basso rischio; il vero lavoro è il contenuto IT.

### S2 — Routing gerarchico e mappatura record→URL ✅ RISOLTO

**Context.** Gli URL dei nodi sono multi-segmento e dipendono dalla catena di `parent`. Gli helper attuali sono a segmento singolo (R4.1/R4.2).

**Esiti.**

| #     | Question / Risposta                                                                                                                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-Q1 | Dopo `tree: true`, il `FaqRecord` CDA espone `parent`/`children`. Strategia robusta: query **flat** `allFaqs { id slug parent { id } _updatedAt }` per locale e **ricostruzione dell'albero in JS** (no nesting a profondità fissa).    |
| S2-Q2 | Nuovo util `src/lib/faq/faqTree.ts`: `pathForNode(nodeId, locale)` → catena di slug; `nodeForPath(slugs[], locale)` → nodo (valida l'ancestry). `localizedPath` resta invariato; il path FAQ è `/${locale}/faq/${slugChain.join('/')}`. |
| S2-Q3 | `recordToWebsiteRoute` (già `async`) → ramo per `api_key === 'faq'`: usa `faqTree.pathForNode` per costruire l'URL gerarchico risalendo i `parent`.                                                                                     |
| S2-Q4 | `generateStaticParams`: una query flat, costruisci tutti i path dell'albero × locale → `{ slug: string[] }`. `sitemap.ts`: stessa sorgente, aggiungi gli entry FAQ con `_updatedAt`.                                                    |

**Punti da toccare:** `src/app/[locale]/faq/[[...slug]]/page.tsx` (nuovo), `src/lib/faq/faqTree.ts` (nuovo), `src/i18n/paths.ts` (segmento `faq`), `src/lib/datocms/recordInfo.ts` (ramo faq), `src/app/sitemap.ts` (entry faq).

**Acceptance: raggiunta.** Meccanismo unico (`faqTree`) per resolver, breadcrumb, recordInfo, sitemap, staticParams.

---

## Rischi / dipendenze

- **Contenuto IT (R3.3)** — è il rischio numero uno per l'urgenza: il codice può essere pronto, ma il lancio bilingue dipende dalla scrittura/traduzione delle FAQ (workstream di Diana). Lo sviluppo procede in parallelo.
- **Vincolo di processo** — ogni interazione DatoCMS via CLI + datocms skills, mai MCP.

## Prossimi passi

1. ~~Decidere C-slug / C-st / C-seg~~ ✅ fatto.
2. ~~Eseguire **S1** e **S2**~~ ✅ fatto — fit check tutto verde.
3. ~~Breadboard + slicing~~ ✅ fatto → **[`faq-slices.md`](./faq-slices.md)** (5 slice: V1 DURANTE end-to-end → V5 draft/realtime).
4. Implementare **V1** (slice end-to-end ramo DURANTE).
5. Avviare in parallelo il **workstream contenuti IT** (Diana) — dipendenza esterna per il lancio bilingue.
