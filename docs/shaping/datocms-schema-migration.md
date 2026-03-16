---
shaping: true
---

# DatoCMS Schema & Data Migration — Shaping

## Source

> Il modello "districts" è stato rinominato in "district" secondo le regole di naming di DatoCMS.
> I modelli apartment e district sono passati ad un approccio di publish/draft.
> Il modello apartment ha un campo booleano Published che indica se un record è pubblicato o meno. Voglio, in base al valore di published, settare lo stato del record con il sistema nativo offerto da DatoCMS.
> Voglio verificare tutti i record "orfani" del modello ID 2729 "gallery_image". Ogni record che non è linkato ad un appartamento, può essere eliminato.
> Ho aggiornato il progetto DatoCMS con tutti i product update disponibili, questo può aver introdotto novità e aver rotto qualcosa. Voglio fare una verifica generale.

---

## Problem

Dopo una serie di rinominazioni di modelli e l'introduzione del workflow publish/draft nativo in DatoCMS, il frontend è disallineato con lo schema. Inoltre ci sono record orfani da pulire e product update da verificare.

## Outcome

Frontend funzionante con i nuovi nomi di modello, workflow publish/draft nativo al posto del campo booleano `published`, record orfani eliminati, nessuna regressione da product update.

---

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| **R0** | Il frontend deve funzionare con il modello "district" (ex "districts") | Core goal |
| **R1** | Le query GraphQL devono usare i nuovi tipi (`DistrictRecord` ex `DistrictsRecord`) | Must-have |
| **R2** | Il workflow publish/draft nativo di DatoCMS deve sostituire il campo booleano `published` sugli apartment | Core goal |
| **R3** | I record gallery_image (ID 2729) non linkati ad alcun apartment o district devono essere eliminati | Must-have |
| **R4** | Il plugin Record Bin deve catturare le eliminazioni via API (non solo UI) | Must-have |
| **R5** | Nessuna regressione introdotta dai product update di DatoCMS | Must-have |
| **R6** | Lo schema GraphQL, i tipi gql.tada e i CMA types devono essere rigenerati e coerenti | Must-have |
| **R7** | Le route di Web Preview e SEO Analysis devono funzionare con i nuovi ID/nomi modello | Must-have |

---

## Shape A: Migrazione incrementale controllata

Approccio in 5 parti sequenziali, ciascuna verificabile indipendentemente.

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **A1** | **District rename: adeguamento frontend** | |
| A1.1 | Rigenerare schema (`npm run generate-schema`) + gql.tada output + CMA types | |
| A1.2 | Aggiornare fragment `DistrictCardFragment on DistrictsRecord` → `DistrictRecord` in `src/components/DistrictCard/index.tsx` | |
| A1.3 | Aggiornare query `districts(...)` → `district(...)` (singolare) in `src/app/[locale]/florence/districts/[slug]/page.tsx` | |
| A1.4 | Aggiornare query `allDistricts` (verificare se il nome cambia in `allDistricts` ancora o diventa altro) | |
| A1.5 | Aggiornare `recordInfo.ts` se l'ID modello 2735 cambia (probabilmente no, il rename non cambia l'ID) | |
| A1.6 | Verificare che il campo `district` su `ApartmentRecord` punti al tipo corretto | |
| **A2** | **Publish/draft nativo: migrazione dati** | |
| A2.1 | Verificare che il modello apartment abbia `draftModeActive: true` nella configurazione DatoCMS | |
| A2.2 | Script CMA: leggere TUTTI gli apartment, iterare su ciascuno | |
| A2.3 | Per ogni apartment con `published: true` → invocare `client.items.publish(id)` per settare lo stato nativo DatoCMS a "published" | |
| A2.4 | Per ogni apartment con `published: false` → invocare `client.items.unpublish(id)` per settare lo stato nativo DatoCMS a "draft" | |
| A2.5 | Verificare il risultato: contare quanti record sono in stato published vs draft nativo | |
| A2.6 | Rimuovere il campo booleano `published` dal modello apartment (solo dopo verifica A2.5) | |
| **A3** | **Publish/draft: adeguamento frontend (solo apartment)** | |
| A3.1 | Rimuovere `published: { eq: true }` da TUTTE le query GraphQL degli apartment (6 query) | |
| A3.2 | Affidarsi al token CDA published (che per default ritorna solo i record con stato nativo "published") | |
| A3.3 | Verificare che il token draft (`DATOCMS_DRAFT_CONTENT_CDA_TOKEN`) ritorni anche i draft in draft mode | |
| A3.4 | Rigenerare schema — il campo `published` booleano non esisterà più dopo A2.6, le query con quel filtro falliranno | |
| **A4** | **Pulizia record orfani gallery_image** | |
| A4.1 | Script CMA: query tutti i record del modello 2729 | |
| A4.2 | Per ogni record, verificare se è referenziato in `gallery` di qualche apartment o district | |
| A4.3 | Configurare Record Bin in modalità Lambda per catturare eliminazioni API | |
| A4.4 | Eliminare i record orfani via CMA API | |
| **A5** | **Verifica product update** | |
| A5.1 | Rigenerare schema e verificare diff con lo schema precedente | |
| A5.2 | Verificare che il build (`npm run build`) passi senza errori | |
| A5.3 | Verificare che le API route (invalidate-cache, preview-links, seo-analysis, draft-mode) funzionino | |
| A5.4 | Verificare che i webhook DatoCMS siano configurati correttamente | |

---

## Impact Analysis

### A1 — District rename

**File impattati:**

| File | Cosa cambia |
|------|-------------|
| `schema.graphql` | Rigenerato automaticamente |
| `src/lib/datocms/graphql-env.d.ts` | Rigenerato automaticamente |
| `src/lib/datocms/cma-types.ts` | Rigenerato automaticamente |
| `src/components/DistrictCard/index.tsx:9` | Fragment: `on DistrictsRecord` → `on DistrictRecord` |
| `src/app/[locale]/florence/districts/[slug]/page.tsx:56` | Query field: `districts(...)` → `district(...)` |
| `src/app/[locale]/florence/districts/[slug]/page.tsx:90` | Query field: `allDistricts` → verificare nuovo nome |
| `src/app/[locale]/florence/districts/page.tsx:52` | Query field: `allDistricts` → verificare nuovo nome |
| `src/app/sitemap.ts:13` | Query field: `allDistricts` → verificare nuovo nome |
| `src/lib/datocms/recordInfo.ts:46` | ID 2735 — probabile che non cambi, ma verificare |

**Nota:** I nomi delle query DatoCMS seguono il nome API del modello. Se il modello si chiama "district" (singolare), le query saranno:
- `district(...)` — singolo record (prima era `districts(...)`)
- `allDistricts(...)` — collezione (resta invariata, DatoCMS pluralizza automaticamente)

### A2+A3 — Publish/draft

**File impattati dalle query con filtro `published`:**

| File | Riga | Query | Azione |
|------|------|-------|--------|
| `src/app/[locale]/florence/accommodations/page.tsx` | 69 | allApartments | Rimuovere `published: { eq: true }` |
| `src/app/[locale]/page.tsx` | 71 | allApartments | Rimuovere `published: { eq: true }` |
| `src/app/[locale]/florence/accommodations/[slug]/page.tsx` | 169 | similarQuery | Rimuovere `published: { eq: true }` |
| `src/app/[locale]/florence/accommodations/[slug]/page.tsx` | 211 | allSlugsQuery | Rimuovere `published: { eq: true }` |
| `src/app/[locale]/florence/districts/[slug]/page.tsx` | 77 | allApartments | Rimuovere `published: { eq: true }` |
| `src/app/sitemap.ts` | 10 | allApartments | Rimuovere `published: { eq: true }` |

**Importante:** Il token CDA "published" di DatoCMS ritorna solo record con stato `published`. Non serve filtrare esplicitamente — il comportamento è nativo. Il token draft ritorna tutti i record (published + draft).

**Anche Mood usa `published: { eq: true }`:**

| File | Riga |
|------|------|
| `src/app/sitemap.ts` | 16 |
| `src/app/[locale]/moods/page.tsx` | 52 |
| `src/app/[locale]/moods/[slug]/page.tsx` | 16, 50, 79 |
| `src/app/[locale]/florence/accommodations/[slug]/page.tsx` | 150 (guestbooks) |

→ **Mood e Guestbook non vengono toccati** in questa migrazione. Le loro query con `published: { eq: true }` restano invariate.

### A4 — Gallery image orfani

**Modello 2729 (`gallery_image`)** è usato come link in:
- `apartment.gallery` (link field su apartment)
- `district.gallery` (link field su district)

Lo script deve verificare ENTRAMBI i contesti.

**Record Bin:** In modalità lambda-less (default), le eliminazioni via CMA API NON vengono catturate. Bisogna:
1. Verificare se il plugin è in modalità Lambda
2. Se no, o attivare Lambda, o eliminare dalla UI, o fare un backup manuale prima

---

## Ordine di esecuzione consigliato

```
A5.1 (verifica schema post-update)
  ↓
A1 (district rename — solo frontend)
  ↓
A2 (publish/draft — migrazione dati CMA)
  ↓
A3 (publish/draft — adeguamento frontend)
  ↓
A4 (pulizia orfani)
  ↓
A5.2-A5.4 (verifica finale)
```

**Motivazione:** Prima allineiamo lo schema (A1), poi migriamo i dati (A2), poi il frontend (A3), poi puliamo (A4). La verifica update (A5) wrappa tutto.

---

## Spike necessari

### Spike 1: Verificare nomi query post-rename district

**Goal:** Capire esattamente come DatoCMS nomina le query dopo il rename da "districts" a "district".

| # | Question |
|---|----------|
| S1-Q1 | La query singola diventa `district(...)` ? |
| S1-Q2 | La query collezione resta `allDistricts(...)` ? |
| S1-Q3 | Il tipo diventa `DistrictRecord` ? |

→ Risolvibile rigenerando lo schema e verificando il diff.

### Spike 2: Stato attuale del plugin Record Bin

| # | Question |
|---|----------|
| S2-Q1 | Il plugin è installato in modalità Lambda o Lambda-less? |
| S2-Q2 | Se Lambda-less, possiamo attivare Lambda? |
| S2-Q3 | Alternativa: fare export/backup dei record prima di eliminarli? |

### ~~Spike 3~~ — Risolto

Mood e Guestbook non vengono toccati in questa migrazione. Il campo `published` booleano viene rimosso solo da Apartment. Le query Mood/Guestbook con `published: { eq: true }` restano invariate.

---

## Rischi

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| Query field names diversi da quelli attesi dopo rename | Build rotto | Spike 1 — rigenerare e verificare prima di toccare codice |
| Record Bin non cattura eliminazioni API | Record persi | Verificare modalità Lambda o fare backup CMA prima |
| Rimozione filtro `published` espone draft in produzione | Contenuti non pronti visibili | Il token CDA published filtra nativamente — testare prima |
| Product update rompono qualcosa | Regressioni varie | Build + verifica completa (A5) |
| Eliminazione campo `published` prima della migrazione dati | Stato perso | Ordine: PRIMA migrare dati (A2), POI rimuovere campo (A2.4) |
