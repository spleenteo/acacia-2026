---
shaping: true
---

# Spike — DatoCMS Site Search (setup + query + esclusioni)

Relativo a `home-search.md`, parti flaggate **A1** e **A2**.

### Context

Il Site Search di DatoCMS è scelto come motore (vedi shaping doc) ma **non è configurato** (0 build trigger nel progetto). Prima di slicing/implementazione dobbiamo sapere concretamente: come si crea e si attiva l'indicizzazione, come si interroga dal frontend (e da localhost), e come si tiene pulito l'indice (escludere pagine non-dettaglio e nav/footer). Questi punti toccano il Core goal, quindi vanno chiusi.

### Goal

Sapere esattamente i passi per (1) configurare il build trigger e far indicizzare `acacia-2026.vercel.app`, (2) interrogare l'indice dal frontend con highlight e per-locale, (3) escludere dal risultato/indice ciò che non vogliamo.

### Questions

| #         | Question                                                                                                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1-Q1** | Via CLI/CMA: quali campi servono per creare un build trigger con `indexing_enabled` (adapter, `frontend_url`, settings)? Si può creare un trigger "manuale" senza collegare un provider di deploy reale?              |
| **A1-Q2** | Come si avvia/forza una **ri-indicizzazione** e come si legge lo stato del crawl (quante pagine, errori)?                                                                                                             |
| **A1-Q3** | Qual è l'API/hook di interrogazione? Parametri di `useSiteSearch` (`buildTriggerId`, token, `fuzzySearch`, `locale`, paginazione) e shape della risposta (URL, title, body excerpt, **highlight/matchingFragments**). |
| **A1-Q4** | Quale **token** serve per interrogare il Site Search? È sufficiente un CDA token (read-only) o serve un token dedicato? Va tenuto server-side (route handler proxy)?                                                  |
| **A1-Q5** | L'interrogazione funziona da **localhost** contro l'indice del deploy? I risultati riportano URL assoluti del `frontend_url` → confermare la riscrittura a path relativo.                                             |
| **A2-Q1** | Come si **escludono pagine** dal crawl del Site Search? (`<meta name="robots" content="noindex">`, `X-Robots-Tag`, impostazioni del trigger, o filtro client per pattern URL come fallback)                           |
| **A2-Q2** | Come si **escludono regioni** della pagina (nav/footer) dal testo indicizzato? Esiste un'annotazione `data-datocms-*` o un meccanismo equivalente?                                                                    |
| **A2-Q3** | Il crawler segue la **sitemap** esistente (`/sitemap.xml`)? Copre entrambe le locale e tutti e 5 i tipi di dettaglio?                                                                                                 |

### Acceptance

Lo spike è completo quando possiamo descrivere: i comandi/CLI per creare e attivare il build trigger su `acacia-2026.vercel.app`, come interrogare l'indice dal frontend (hook, token, highlight, per-locale) anche da localhost, e i meccanismi concreti per escludere pagine non-dettaglio e regioni nav/footer dall'indice.

---

## Findings (spike chiuso — 2026-06-21)

> **Correzione chiave:** non è un _build trigger_ ma una **Search Index** (risorsa `searchIndexes`). I build trigger servono solo a far ri-crawlare su deploy. **Indice già presente:** id `38576` ("website", enabled, `frontend_url = acacia-2026.vercel.app`) — l'utente l'aveva configurato. Ma i **crawl falliscono** (`Connection refused localhost:3000`) perché lo staging emette sitemap/robots con URL localhost → vedi gotcha `NEXT_PUBLIC_SITE_URL`.

### A1 — Setup + query

- **A1-Q1 (create):** `client.searchIndexes.create({ name, enabled: true, frontend_url: 'https://acacia-2026.vercel.app/', user_agent_suffix: null })`. Nessun provider di deploy obbligatorio.
- **A1-Q2 (re-index/stato):** `client.searchIndexes.trigger(id)` avvia il crawl; lo stato si legge via `searchIndexEvents`. Il re-index automatico su pubblicazione si ottiene legando un `build_trigger` (opzionale, fase 2).
- **A1-Q3 (query):** `client.searchResults.rawList({ filter: { query, fuzzy, search_index_id, locale }, page: { limit, offset } })`. Default 20, **max 100**, `meta.total_count` = totale. C'è `listPagedIterator` per il **fetch-all**. Risposta: `title`, `body_excerpt` (200 char), `url`, `score`, `highlight.{title,body}`. **Gli highlight usano marker `[h]…[/h]`** (non `<mark>`) → converto io in markup.
- **A1-Q4 (token):** serve un **ruolo least-privilege con solo `can_perform_site_search`** + un **API token** per quel ruolo. È un token "public search", read-only. **Scelta:** lo tengo **server-side** in un **route handler `/api/search`** (no token nel browser), che fa anche fetch-all + bucketing per tipo. → niente `useSiteSearch` (l'hook pagina 8/volta e non fa i facet che ci servono).
- **A1-Q5 (localhost):** la query è una chiamata API → **funziona da localhost** contro l'indice del deploy. Gli `url` dei risultati sono assoluti su `frontend_url` → li **riscrivo a path relativo** in presentazione.

### A2 — Esclusioni (il crawler `DatoCmsSearchBot`)

- **A2-Q1 (escludere pagine):** **solo via `robots.txt`**. Direttive supportate: `User-agent`/`Allow`/`Disallow` con `*` e `$`. **First-match wins** → `Allow` dei 5 pattern di dettaglio **prima** di `Disallow: /`. ⚠️ **`noindex` per pagina NON è supportato** dal crawler. Quindi aggiungo un gruppo `DatoCmsSearchBot` in `robots.ts` con gli `Allow` dei dettagli (entrambe le locale) poi `Disallow: /`.
- **A2-Q2 (escludere regioni nav/footer):** ❌ **non supportato** — niente esclusione di porzioni di pagina. **Il testo di nav/footer verrà indicizzato** (rumore). **Per il POC si accetta**; mitigazione in fase 2 (markdown-twin / indice custom).
- **A2-Q3 (sitemap):** il crawler legge `Sitemap:` da robots o `/sitemap.xml`. La `sitemap.ts` attuale **copre già tutti e 5 i tipi** di dettaglio in **entrambe le locale** (appartamenti, district, mood, magazine post, nodi FAQ). ✅

### Gotcha emersi (da gestire in setup)

1. **`NEXT_PUBLIC_SITE_URL` sullo staging deve = `https://acacia-2026.vercel.app`**: la sitemap emette URL basati su quella env e _il crawler ignora URL fuori dal dominio configurato_. Se lo staging punta a un dominio diverso, il crawler **non indicizza nulla**.
2. **Ordine di setup:** prima deployo `robots.txt` (Allow detail + Disallow /) sullo staging, **poi** creo la search index e lancio `trigger` — altrimenti il primo crawl indicizza tutto.
3. **Nav/footer noise** è strutturale (vedi A2-Q2): scelta da confermare con l'utente (accettare per il POC).
