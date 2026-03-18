---
shaping: true
---

# Web Previews & Visual Editing — Shaping

## Source

> Voglio configurare nel progetto l'uso del plugin Web Preview dentro DatoCMS.
> Sono certo che il codebase originale già lo prevedeva e quindi dovrebbe essere
> pronto lato nextjs, ma ancora non funziona lato CMS. Voglio verificare,
> controllare e abilitare il visual editing sul CMS.

---

## Problem

Il codebase Next.js include già tutta l'infrastruttura per Web Previews e Visual Editing
(endpoint preview-links, draft mode, ContentLink component, stega encoding). Tuttavia
il plugin lato DatoCMS non è configurato/funzionante, quindi gli editor non possono:

- Vedere anteprime draft/published dei contenuti dalla sidebar di DatoCMS
- Usare il tab Visual Editing per modificare visivamente i contenuti
- Cliccare sugli elementi per navigare al campo corrispondente nell'editor

---

## Outcome

Gli editor in DatoCMS possono:
1. Vedere link di anteprima (draft e published) nella sidebar di ogni record mappato
2. Aprire il tab Visual Editing e navigare il sito in draft mode dentro DatoCMS
3. Cliccare su qualsiasi testo per aprire il campo corrispondente nel side panel

---

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| R0 | Plugin Web Previews installato e configurato in DatoCMS con URL corretti | Core goal |
| R1 | Preview links funzionanti per Apartment, District, Mood (draft + published) | Core goal |
| R2 | Visual Editing tab funzionante con draft mode automatico nell'iframe | Core goal |
| R3 | Content Link overlay (click-to-edit) funzionanti nel Visual tab | Core goal |
| R4 | Variabili d'ambiente allineate tra Next.js e plugin DatoCMS | Must-have |
| R5 | Supporto bilingue: preview links generati nella lingua corretta (en/it) | Must-have |
| R6 | Sicurezza: token validato su tutti gli endpoint, redirect solo relativi | Must-have |
| R7 | CSP header permette iframe da `plugins-cdn.datocms.com` | Out |

**R7 Note:** Nessun CSP header è configurato nel progetto (né in next.config, né middleware, né vercel.json). Senza CSP, l'iframe del plugin può caricare il sito senza restrizioni. Non è un blocker — è una hardening opzionale da valutare in futuro.

---

## Spike findings

### Plugin DatoCMS
Il plugin Web Previews è **installato** ma **non configurato** — nessun frontend/URL impostato.

### Post-deploy endpoint
Lo script `/api/post-deploy` usa `client.plugins.create()` che **fallisce se il plugin è già installato** (HTTP 422). Non è utilizzabile per riconfigurare il plugin esistente.

### CSP
Nessun header CSP configurato → l'iframe funziona senza restrizioni. Non è un blocker.

### Env vars
Tutte le variabili necessarie sono definite in `.env.local.example`. L'uso nel codice è corretto.

---

## CURRENT: Stato attuale

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **C1** | **Endpoint `/api/preview-links`** — riceve POST dal plugin, usa `recordToWebsiteRoute()` per mappare record→URL, genera link draft/published | |
| **C2** | **Endpoint `/api/draft-mode/enable`** — abilita Draft Mode Next.js, fix cookie `partitioned: true` per iframe, redirect a URL di preview | |
| **C3** | **Endpoint `/api/draft-mode/disable`** — disabilita Draft Mode, stessi workaround cookie | |
| **C4** | **`recordInfo.ts`** — mapping: Apartment (2726)→`/[locale]/florence/accommodations/[slug]`, District (2735)→`/[locale]/florence/districts/[slug]`, Mood (2738)→`/[locale]/moods/[slug]` | |
| **C5** | **`ContentLink` component** — `@datocms/content-link` controller con `onNavigateTo`, `setCurrentPath`, hover-only overlays, fallback standalone | |
| **C6** | **`executeQuery.ts`** — switch CDA token published/draft, `contentLink: 'v1'` + `baseEditingUrl` solo in draft | |
| **C7** | **`/api/post-deploy`** — script CMA one-shot, usa `plugins.create()` → non riutilizzabile con plugin già installato | |

---

## A: Configurazione manuale via UI DatoCMS

Configurare il plugin Web Previews direttamente dalla UI di DatoCMS, inserendo gli URL corretti.

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **A1** | **Configurare frontend nel plugin** — Aprire Settings → Plugins → Web Previews, aggiungere un frontend "Production" con: Preview webhook = `https://acacia-firenze.com/api/preview-links?token={SECRET_API_TOKEN}` | |
| **A2** | **Configurare Visual Editing** — Nello stesso frontend, impostare Draft mode URL = `https://acacia-firenze.com/api/draft-mode/enable?token={SECRET_API_TOKEN}`, Initial path = `/` | |
| **A3** | **Verificare env vars su Vercel** — Controllare che `SECRET_API_TOKEN`, `DATOCMS_DRAFT_CONTENT_CDA_TOKEN`, `DATOCMS_BASE_EDITING_URL` siano configurati nell'environment Vercel | |
| **A4** | **Test end-to-end** — Aprire un Apartment in DatoCMS, verificare sidebar preview links e Visual tab | |

---

## B: Script CMA per configurare plugin esistente

Creare uno script che trova il plugin già installato e lo configura via CMA API (`plugins.update()`).

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **B1** | **Script CMA `configure-web-previews.ts`** — usa `client.plugins.list()` per trovare il plugin, poi `client.plugins.update()` con i parametri corretti (frontends, visualEditing, startOpen) | |
| **B2** | **Parametri identici a post-deploy** — stessa struttura: previewWebhook, enableDraftModeUrl, initialPath | |
| **B3** | **Idempotente** — può essere rieseguito senza errori (update, non create) | |
| **B4** | **Verificare env vars su Vercel** — come A3 | |
| **B5** | **Test end-to-end** — come A4 | |

---

## Fit Check: R × A × B

| Req | Requirement | Status | A | B |
|-----|-------------|--------|:-:|:-:|
| R0 | Plugin Web Previews installato e configurato in DatoCMS con URL corretti | Core goal | ✅ | ✅ |
| R1 | Preview links funzionanti per Apartment, District, Mood (draft + published) | Core goal | ✅ | ✅ |
| R2 | Visual Editing tab funzionante con draft mode automatico nell'iframe | Core goal | ✅ | ✅ |
| R3 | Content Link overlay (click-to-edit) funzionanti nel Visual tab | Core goal | ✅ | ✅ |
| R4 | Variabili d'ambiente allineate tra Next.js e plugin DatoCMS | Must-have | ✅ | ✅ |
| R5 | Supporto bilingue: preview links generati nella lingua corrente (en/it) | Must-have | ✅ | ✅ |
| R6 | Sicurezza: token validato su tutti gli endpoint, redirect solo relativi | Must-have | ✅ | ✅ |

**Notes:**
- Entrambi gli shape passano tutti i requisiti — la differenza è operativa:
  - **A** è immediato, zero codice, ma manuale e non ripetibile (se si ricrea il progetto o l'environment)
  - **B** è ripetibile/idempotente, documentato nel codice, ma richiede scrivere lo script
