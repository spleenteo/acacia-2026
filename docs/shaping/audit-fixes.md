---
shaping: true
---

# Audit fixes — Shaping

**Stato:** Shaping · **Branch suggerito:** `chore/audit-fixes` · **Data:** 2026-06-17 (Matteo)

## Source

Audit del progetto (skill `next-best-practices` + DatoCMS) del 2026-06-17. Sintesi dei rilievi:

> **Sicurezza** — Open redirect via URL protocol-relative in `isRelativeUrl` (`src/app/api/utils.ts:103`): `//evil.com` e `/\evil.com` passano come "relativi"; la route `draft-mode/disable` non controlla il token → open redirect non autenticato. `handleUnexpectedError` (`utils.ts:24-36`) rimanda al client `ApiError.request/response` (può contenere `Authorization: Bearer <CMA_TOKEN>`) e lo stack via `serializeError`. JSON-LD in `FaqNodeContent.tsx:93` senza escape di `</script>`. Draft CDA token passato come prop al client in draft mode (pattern DatoCMS, gated da secret).

> **Ripetizioni** — Boilerplate `metaQuery → generateMetadata → query → draftMode → RealtimeWrapper` in ~11 `page.tsx`; `alternates/canonical` in 6 index; `generateStaticParams` in ~6 detail; blocco immagine card duplicato (4 card); `AmenitiesList/ComfortsList/EssentialsList` ~67% identici; `excerpt()` duplicato; `cubic-bezier(0.19,1,0.22,1)` ×8.

> **Slot/Slop** — `'use client'` inutile in `HomeContent` e `FaqIndexContent` (nessun hook).

> **Spaghetti** — `faq/[[...slug]]/page.tsx` ibrida index+nodo (albero fetchato più volte, due rami); `ApartmentDetailContent.tsx` ~477 righe + query sequenziali nel page.

> **Ottimizzazioni** — Query waterfall in `accommodations/[slug]/page.tsx` (→ `Promise.all`); invalidazione cache a tag unico `datocms` (coarse, documentata).

---

## Problem

L'audit ha trovato una falla di sicurezza concreta (open redirect non autenticato + possibile leak del token CMA negli errori) e un debito di manutenibilità (ripetizioni, due client component inutili, due file "spaghetti"). Serve un piano che (1) chiuda subito la sicurezza con rischio minimo, e (2) decida quanto refactoring di de-duplicazione/struttura affrontare ora vs dopo, senza regressioni visibili.

## Outcome

- Le route pubbliche non permettono redirect esterni e gli errori non espongono token/dettagli interni.
- Le pagine caricano i dati senza waterfall evitabili.
- Il codice è più asciutto (meno boilerplate/duplicazione) **senza** cambiare l'output renderizzato.
- Il sito si comporta esattamente come prima per l'utente finale.

---

## Requirements (R)

| ID     | Requirement                                                                                                                                                    | Status       |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **R0** | [Sicurezza] Le route `draft-mode/*` e `preview-links` non devono permettere redirect verso host esterni (no `//host`, `/\host`, schemi assoluti)               | Must-have    |
| **R1** | [Sicurezza] Le risposte d'errore delle route API non devono esporre token, header `Authorization`, body di richiesta/risposta o stack trace al chiamante       | Must-have    |
| **R2** | [Sicurezza] Hardening minori: escape di `</script>` nel JSON-LD FAQ                                                                                            | Nice-to-have |
| **R3** | [Performance] Le query indipendenti di una pagina vengono eseguite in parallelo, non in sequenza (no waterfall)                                                | Must-have    |
| **R4** | [Manutenibilità] Il boilerplate ripetuto delle pagine (metadata/alternates, `generateStaticParams`, render+draft+realtime) è centralizzato in helper riusabili | Leaning yes  |
| **R5** | [Manutenibilità] La duplicazione nei componenti è estratta (immagine card, `WidgetList` per Amenities/Comforts/Essentials, `excerpt`, easing)                  | Leaning yes  |
| **R6** | [Qualità RSC] I component senza feature client non sono marcati `'use client'` (HomeContent, FaqIndexContent)                                                  | Nice-to-have |
| **R7** | [Struttura] I file ad alta complessità sono semplificati: split della pagina FAQ index/nodo, alleggerimento di ApartmentDetail                                 | Undecided    |
| **R8** | [Vincolo] Nessuna regressione visibile: a parità di contenuto l'output renderizzato e il comportamento restano identici (verifica EN+IT)                       | Must-have    |

---

## Shapes (scope/sequenza)

Le shape sono **tier di scope cumulativi**: si sceglie il bersaglio. A è il minimo indispensabile; B aggiunge i quick-win a basso rischio; C completa con i refactor strutturali.

### A: Hotfix sicurezza (solo R0+R1, +R2)

| Part | Mechanism                                                                                                                                       | Flag |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| A1   | `isRelativeUrl`: ritorna true solo se `path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')`                               |      |
| A2   | `handleUnexpectedError`: logga server-side; al client solo `{ success:false, error: <messaggio generico> }` (niente `request`/`response`/stack) |      |
| A3   | JSON-LD FAQ: `JSON.stringify(...).replace(/</g, '\\u003c')`                                                                                     |      |

Branch: corrente. Commit + deploy immediato. Nessun cambiamento di UI/comportamento.

### B: Sicurezza + quick wins low-risk (A + R3 + R6)

| Part | Mechanism                                                                                                                 | Flag |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | :--: |
| B1   | = A1+A2+A3                                                                                                                |      |
| B2   | `accommodations/[slug]/page.tsx`: raggruppare le query indipendenti in `Promise.all([...])`                               |      |
| B3   | Rimuovere `'use client'` da `HomeContent` e `FaqIndexContent` (verificare che non servano hook) e adattare il page parent |      |

Modifiche mirate, nessun refactor di API/markup condiviso. Un branch, verifica EN+IT.

### C: Remediation completa (B + R4 + R5 + R7)

| Part | Mechanism                                                                                                                 | Flag |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | :--: |
| C1   | = tutte le parti di B                                                                                                     |      |
| C2   | Helper `indexAlternates(locale, path)` + `datoPage()`/`createDetailParams()` per togliere il boilerplate dalle ~11 pagine |  ⚠️  |
| C3   | `<CardImage>` (blocco immagine+hover condiviso) applicato a 4 card; `excerpt` in `src/lib/text`; easing come token CSS    |      |
| C4   | `<WidgetList>` generico al posto di Amenities/Comforts/Essentials                                                         |  ⚠️  |
| C5   | Split `faq/[[...slug]]` in `/faq` (index) + `/faq/[...slug]` (nodo), albero fetchato una volta per ramo                   |  ⚠️  |
| C6   | Alleggerire `ApartmentDetailContent` spostando fetch/trasformazioni nel server component                                  |  ⚠️  |

Branch dedicato, da affrontare **a slice** (un'area per volta, ognuna verificabile). Parti ⚠️ = meccanismo descritto ma da spike/verifica su rischio-regressione.

---

## Fit Check

| Req | Requirement                                       | Status       | A   | B   | C   |
| --- | ------------------------------------------------- | ------------ | --- | --- | --- |
| R0  | [Sicurezza] No redirect esterni dalle route       | Must-have    | ✅  | ✅  | ✅  |
| R1  | [Sicurezza] Errori senza token/dettagli interni   | Must-have    | ✅  | ✅  | ✅  |
| R2  | [Sicurezza] Escape `</script>` nel JSON-LD        | Nice-to-have | ✅  | ✅  | ✅  |
| R3  | [Performance] Query in parallelo                  | Must-have    | ❌  | ✅  | ✅  |
| R4  | [Manutenibilità] Boilerplate pagine centralizzato | Leaning yes  | ❌  | ❌  | ✅  |
| R5  | [Manutenibilità] Duplicazione componenti estratta | Leaning yes  | ❌  | ❌  | ✅  |
| R6  | [RSC] No `'use client'` inutili                   | Nice-to-have | ❌  | ✅  | ✅  |
| R7  | [Struttura] Split FAQ + ApartmentDetail           | Undecided    | ❌  | ❌  | ✅  |
| R8  | [Vincolo] Nessuna regressione visibile            | Must-have    | ✅  | ✅  | ✅  |

**Note:**

- A non tocca performance/manutenibilità: chiude solo la sicurezza (R0-R2) — il più urgente, rischio quasi nullo.
- B aggiunge due quick-win sicuri (parallelizzazione, RSC) senza refactor condivisi.
- C è l'unica che soddisfa R4/R5/R7 ma introduce parti ⚠️ (toccano markup/route condivisi → vanno verificate a slice per garantire R8).

---

## Raccomandazione

1. **Adesso → A** sul branch corrente: chiude la sicurezza, deploy immediato.
2. **Poi → B** (o A+B insieme): quick-win a rischio minimo.
3. **C come follow-up sliceato** su `chore/audit-fixes`, una slice per area (C2 → C3 → C4 → C5 → C6), ciascuna con verifica EN+IT, perché tocca codice condiviso.

Decisione aperta: confermare il bersaglio (A, B o C) e se procedere subito con lo slicing di C.
