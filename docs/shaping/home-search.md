---
shaping: true
---

# Home Search (DatoCMS Site Search) — Shaping

**Stato:** Implementazione V1 · **Branch:** `feat/site-search` · **Data:** 2026-06-21 (Matteo)

## Source

Estratti verbatim dalla richiesta e dal grilling:

> Voglio mettere in home page (e poi riutilizzare la funzionalità in altri punti) un input di ricerca. Voglio modificare l'em del grande titolo, affinché abbia uno sfondo animato sulla parola, distorto, come sul menu principale. Voglio che la label dell'input sia un set di circa 10 domande animate con l'effetto typewriting. Queste domande al momento non vengono dal CMS. L'input genera una ricerca su una pagina dedicata.

> Attraverso CLI e skill di Dato, voglio implementare una ricerca che sfrutti il sitesearch di DatoCMS, che ho già configurato (ma non sono sicuro sia corretto). La ricerca è un full text su appartamenti (description, nome, categoria, district, mood), Mood (testo descrittivo, nome); District (descrizione); FAQ (answer, description long e short); Magazine (tutto). Nella pagina di ricerca devono esserci dei filtri, counter, simile a Multimage (sistema sviluppato sempre con Dato search).

> Sono consapevole che questo sia un primo POC, un tentativo per iniziare un percorso che probabilmente porterà a strumenti più evoluti come Algolia, o un RAG per fare richieste a una AI sui contenuti del sito, export di file markdown ecc.

> Ho impostato la configurazione di Dato per puntare al momento a https://acacia-2026.vercel.app/ che è lo staging legato all'environment che stiamo usando. Rimane fondamentale per me testare la feature in localhost.

> Vorrei la ricerca nell'hero, al posto degli attuali due bottoni che non servono. Solo un po' più di vertical spacing. Il punto è, la ricerca è above the fold.

### Esiti del grilling (decisioni)

- Backend = **DatoCMS Site Search** (crawler di pagine). Motivazione decisiva: gran parte del contenuto cercabile è **Structured Text** (answer FAQ, descrizioni, corpo Magazine) e il filtro `matches` della CDA **non** cerca nello structured text → una ricerca record-based non potrebbe coprire lo scope.
- 🟡 **Correzione (post-implementazione):** una **Search Index ESISTE** (id `38576`, "website", enabled, `frontend_url = acacia-2026.vercel.app`) — l'utente l'aveva configurata. Il problema non è la mancanza dell'indice ma che **i crawl falliscono** (`indexing_failure: Connection refused localhost:3000`) perché lo staging serve sitemap/robots con URL `localhost` → vedi gotcha `NEXT_PUBLIC_SITE_URL`.
- Scope = **5 tipi di dettaglio**; niente home/indici/guestbook/landing (le landing non esistono ancora). Facet derivati dal **prefisso URL**.
- "Appartamento per mood" **funziona** già: `ApartmentDetailContent` renderizza i `relatedMoods` reali (relazione inversa via `mood.boxes`), quindi i nomi dei mood associati sono in pagina e vengono indicizzati.
- Test in locale ✅: l'**interrogazione** è una chiamata API (hook `useSiteSearch`) eseguibile da localhost; l'**indice** riflette il crawl del deploy. Link dei risultati riscritti a path relativi.
- Pagina di ricerca: live ≥3 char, debounce, contatori via **fetch-all + raggruppamento client**, **niente** toggle "Ricerca esatta", niente paginazione utente.
- Input nell'**hero**, al posto dei bottoni, **above the fold**, con più spaziatura verticale.

---

## Problem

Il sito non ha alcuna ricerca. Un ospite (o un curioso) non può trovare trasversalmente contenuti — un appartamento per nome/zona, una FAQ, un articolo del Magazine, un mood — se non navigando i menu. Manca un punto d'ingresso unico, sopra la piega in home, che porti a una pagina di risultati filtrabile. Inoltre il Site Search di DatoCMS, che dovrebbe abilitare tutto questo, **non è realmente configurato**.

## Outcome

Dalla home, sopra la piega, l'ospite digita una domanda in linguaggio naturale e atterra su una pagina di ricerca che, in tempo reale, mostra risultati full-text su appartamenti, district, mood, FAQ e Magazine, filtrabili per tipo con contatori. È un **POC** deliberatamente semplice, primo passo verso strumenti più evoluti (Algolia / RAG / export markdown), costruito tutto su DatoCMS Site Search e testabile in locale.

---

## Requirements (R)

| ID  | Requirement                                                                                                                                                                                                                               | Status    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| R0  | Da home e da una pagina dedicata, l'utente cerca full-text nei contenuti del sito e raggiunge la pagina di dettaglio corrispondente                                                                                                       | Core goal |
| R1  | La ricerca copre i 5 tipi di dettaglio: Appartamenti (nome, descrizione, categoria, district, mood), District (descrizione), Mood (nome, testo), FAQ (short+long answer, descrizione), Magazine (tutto) — e **non** home/indici/guestbook | Must-have |
| R2  | I risultati sono filtrabili per **tipo** con **contatori** per tipo, derivati dal pattern URL                                                                                                                                             | Must-have |
| R3  | La ricerca è usabile **dall'hero della home, above the fold**, al posto degli attuali CTA                                                                                                                                                 | Must-have |
| R4  | La parola in `<em>` del titolo hero ha uno **sfondo "wonky" animato** (come l'highlight del menu)                                                                                                                                         | Must-have |
| R5  | Il campo in home mostra ~10 **domande prompt** hardcoded e **bilingue** con effetto **typewriter** (no AI)                                                                                                                                | Must-have |
| R6  | La pagina di ricerca aggiorna **live mentre si digita** (≥3 char, debounce, no reload) ed è **condivisibile via `?q=`**                                                                                                                   | Must-have |
| R7  | Tutto **testabile in localhost** (query all'indice remoto; link risolti in locale)                                                                                                                                                        | Must-have |
| R8  | Il componente di input è **riutilizzabile** altrove, non solo in home                                                                                                                                                                     | Must-have |

---

## CURRENT: nessuna ricerca

| Part | Stato attuale                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| C0   | Nessun input di ricerca, nessuna pagina risultati                                                                                                     |
| C1   | Hero home (`src/components/Hero`) rende titolo + sottotitolo + **bottoni** CMS (`homePage.buttons`)                                                   |
| C2   | `<em>` dei titoli: italic rust + underline che fa wipe-in on-view (`global.css`, `h1/h2/h3 em::after`)                                                |
| C3   | `wonkyClip` (parallelogramma) usato come highlight hover del menu (`SiteHeader`)                                                                      |
| C4   | 🟡 DatoCMS: Search Index `38576` **esiste** (enabled, `frontend_url` acacia-2026.vercel.app) ma **i crawl falliscono** (staging serve URL localhost)  |
| C5   | 🟡 `robots.ts` ha solo `User-agent: *` (nessun gruppo `DatoCmsSearchBot`); `sitemap.ts` copre già tutti e 5 i tipi di dettaglio in entrambe le locale |

---

## A: DatoCMS Site Search + input nell'hero (SELEZIONATA)

| Part   | Mechanism                                                                                                                                                                                                                                                                                                                                                             | Flag |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| **A1** | 🟡 **Motore di ricerca (Search Index)**                                                                                                                                                                                                                                                                                                                               |      |
| A1.1   | 🟡 `searchIndexes.create({ name, enabled: true, frontend_url: 'https://acacia-2026.vercel.app/' })` + `searchIndexes.trigger(id)` (CLI/CMA, one-shot setup). Prerequisito deploy: `NEXT_PUBLIC_SITE_URL = https://acacia-2026.vercel.app` (sennò la sitemap emette URL off-domain e il crawler ignora tutto)                                                          |      |
| A1.2   | 🟡 Ruolo least-privilege `can_perform_site_search` + API token dedicato (`DATOCMS_SITE_SEARCH_TOKEN`, server-side)                                                                                                                                                                                                                                                    |      |
| A1.3   | 🟡 Route handler **`/api/search?q=&locale=`** (server): `searchResults.rawList({ filter: { query, fuzzy, search_index_id, locale }, page })` con `listPagedIterator` per fetch-all (cap ~100), raggruppa per tipo dal prefisso URL, riscrive `url` a path relativo, converte highlight `[h]…[/h]` → markup. (Niente `useSiteSearch`: non fa i facet né il fetch-all.) |      |
| **A2** | 🟡 **Indice pulito (robots `DatoCmsSearchBot`)**                                                                                                                                                                                                                                                                                                                      |      |
| A2.1   | 🟡 In `robots.ts` aggiungere gruppo `User-agent: DatoCmsSearchBot` con `Allow` dei 5 pattern di dettaglio (entrambe le locale) **prima** di `Disallow: /` (first-match wins). `noindex` per pagina NON è supportato dal crawler → robots è l'unica via                                                                                                                |      |
| A2.2   | 🟡 Esclusione di **regioni** (nav/footer) **non supportata** dal crawler → il loro testo verrà indicizzato (rumore). **Accettato per il POC**; mitigazione in fase 2 (markdown-twin / indice custom)                                                                                                                                                                  |      |
| **A3** | **Pagina di ricerca `/{locale}/cerca` · `/search`**                                                                                                                                                                                                                                                                                                                   |      |
| A3.1   | Segmento localizzato in `pathSegments` (it `cerca` / en `search`); proxy già riscrive                                                                                                                                                                                                                                                                                 |      |
| A3.2   | Client component: input live, ≥3 char, debounce ~250ms; sync `?q=` con `window.history.replaceState` (no hook router — workaround Turbopack); `useSearchParams` in `Suspense` per leggere `q` iniziale                                                                                                                                                                |      |
| A3.3   | Fetch-all dei risultati (paginazione interna, cap ~100) → raggruppamento client per tipo (da prefisso URL) = **contatori**                                                                                                                                                                                                                                            |      |
| A3.4   | Chip filtro "Tutti" + 5 tipi con contatore; result card = kicker-tipo + titolo serif + **excerpt con highlight** + link **riscritto a path relativo**                                                                                                                                                                                                                 |      |
| A3.5   | Stati: hint "≥3 caratteri", loading, vuoto                                                                                                                                                                                                                                                                                                                            |      |
| **A4** | **`SearchBox` riutilizzabile**                                                                                                                                                                                                                                                                                                                                        |      |
| A4.1   | Componente client autonomo: label (typewriter) + input + bottone; `onSubmit` → `window.location.assign('/{locale}/cerca?q=...')`                                                                                                                                                                                                                                      |      |
| A4.2   | Riuso: si droppa il componente passando locale                                                                                                                                                                                                                                                                                                                        |      |
| **A5** | **Typewriter prompt**                                                                                                                                                                                                                                                                                                                                                 |      |
| A5.1   | File costanti con ~10 domande per locale (`searchPrompts.ts`, EN/IT) — hardcoded, no CMS                                                                                                                                                                                                                                                                              |      |
| A5.2   | Effetto typewriter che digita/cancella ciclando le domande; rispetta `prefers-reduced-motion`                                                                                                                                                                                                                                                                         |      |
| **A6** | **Hero: input al posto dei bottoni**                                                                                                                                                                                                                                                                                                                                  |      |
| A6.1   | Home smette di passare `buttons`; passa `<SearchBox/>` come contenuto dell'hero; +spaziatura verticale; resta above the fold                                                                                                                                                                                                                                          |      |
| A6.2   | `homePage.buttons` resta in CMS (reversibile), solo non renderizzato in home                                                                                                                                                                                                                                                                                          |      |
| **A7** | **`<em>` con sfondo wonky animato**                                                                                                                                                                                                                                                                                                                                   |      |
| A7.1   | Variante hero del titolo: pannello `wonkyClip` (tinta `surface-alt`/sage) dietro la parola in `<em>`, wipe-in on-view (`useInView`/`.in-view`)                                                                                                                                                                                                                        |      |
| A7.2   | Scoped al titolo hero della home; l'underline globale degli altri `<em>` resta invariato                                                                                                                                                                                                                                                                              |      |

**Note:** 🟡 A1/A2 **risolti** dallo spike (`spike-site-search.md`) — niente più flag. Meccanismi concreti: Search Index (non build trigger), query via route handler server-side con token `can_perform_site_search`, esclusione solo via robots `DatoCmsSearchBot`. **Limite noto accettato:** nav/footer indicizzati (no esclusione di regioni).

---

## B: Ricerca record-based via CDA (RIFIUTATA)

| Part | Mechanism                                                                                                                                  | Flag |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | :--: |
| B1   | Query GraphQL per modello con filtri `matches` su campi string/text; OR tra campi; `_allXMeta { count }` per i contatori per tipo (nativi) |      |
| B2   | Merge/ranking lato client dei risultati dei 5 modelli                                                                                      |      |
| B3   | Niente crawl, sempre fresco; facet nativi                                                                                                  |      |

**Perché è rifiutata:** il filtro `matches` della CDA opera **solo su campi `string`/`text`**, non sullo **Structured Text**. FAQ (answer), descrizioni e corpo Magazine sono structured text → **non cercabili**. Copre quindi solo una frazione dello scope (R1). Inoltre niente fuzzy/typo-tolerance/highlight.

---

## Fit Check

| Req | Requirement                                                  | Status    | A   | B   |
| --- | ------------------------------------------------------------ | --------- | --- | --- |
| R0  | Da home e pagina dedicata, full-text → pagina di dettaglio   | Core goal | ✅  | ✅  |
| R1  | Copre i 5 tipi (inclusi i campi structured text) e non altro | Must-have | ✅  | ❌  |
| R2  | Filtri per tipo con contatori                                | Must-have | ✅  | ✅  |
| R3  | Usabile dall'hero home, above the fold                       | Must-have | ✅  | ✅  |
| R4  | `<em>` con sfondo wonky animato                              | Must-have | ✅  | ✅  |
| R5  | Prompt typewriter bilingue (no AI)                           | Must-have | ✅  | ✅  |
| R6  | Pagina live ≥3 char + condivisibile via `?q=`                | Must-have | ✅  | ✅  |
| R7  | Testabile in localhost                                       | Must-have | ✅  | ✅  |
| R8  | Input riutilizzabile                                         | Must-have | ✅  | ✅  |

**Notes:**

- B fallisce R1: `matches` non cerca nello structured text → FAQ answer, descrizioni, corpo Magazine non indicizzabili lato CDA. È il motivo per cui A vince.
- A passa R0–R2 a livello di approccio (Site Search fa full-text + ricaviamo i facet dall'URL); i dettagli di **configurazione** (A1/A2) sono flaggati e de-rischiati dallo spike, non sono incognite di fattibilità.

---

## Unknowns / Spike

🟡 **Spike chiuso** (`spike-site-search.md`). Tutti i meccanismi di A1/A2 sono concreti. **Decisione presa:** il rumore nav/footer nell'indice è **accettato per il POC** (l'esclusione di regioni non è supportata dal crawler; mitigazione in fase 2).

## Next

1. 🟡 ~~Spike~~ ✅ fatto. ~~Decisione nav/footer noise~~ ✅ accettato (POC).
2. 🟡 ~~`/breadboarding`~~ ✅ fatto → **`home-search-slices.md`** (Detail A: affordance UI/Non-UI + wiring + slice).
3. 🟡 Slice (ground truth in `home-search-slices.md`). Il setup (ex-V0) è **assorbito in V1**. **Tutte fatte** sul branch `feat/site-search`:
   - **V1** ✅ (`2defb83`) — Backend (robots + `searchIndexes` + token riusato `DATOCMS_CMA_TOKEN`) + route handler `/api/search` + pagina `/{locale}/cerca` (input live, highlight, link relativi).
   - **V2** ✅ (`85d1aba`) — facet per tipo (da URL) + contatori (bucketing) + card pulite (kicker, titolo, excerpt).
   - **V3** ✅ (`abfdd82`) — `SearchBox` nell'hero (al posto dei bottoni) + typewriter prompt bilingue.
   - **V4** ✅ (`9bb7836`) — `<em>` wonky animato + `?q=` condivisibile (replaceState).

### Note finali / fase 2

- **Indice** `38576` popolato (crawl ok dopo `NEXT_PUBLIC_SITE_URL` su staging). Re-crawl automatico su pubblicazione: legare un build trigger (non fatto).
- **Rumore nav/footer/"Attiva Draft Mode"** ancora negli excerpt — limite strutturale del Site Search. Mitigazione fase 2: markdown-twin / indice custom (Algolia/RAG).
- Cap a 100 risultati recuperabili (API): i contatori per tipo riflettono i primi 100 quando il totale è maggiore.
- `homePage.buttons` resta in CMS (non renderizzato in home).
