---
shaping: true
---

# Audit fixes — Slices

**Stato:** Slicing/Implementing · **Branch:** `chore/audit-fixes` · Shape: **C** (vedi [audit-fixes.md](./audit-fixes.md))

Ogni slice è verificabile in isolamento (`tsc` + lint, e runtime EN+IT dove tocca rendering). Vincolo trasversale **R8**: nessuna regressione visibile.

| Slice  | Copre                        | Aree toccate                                                    | Rischio | Stato |
| ------ | ---------------------------- | --------------------------------------------------------------- | ------- | ----- |
| **V1** | R0, R1, R2 — sicurezza       | `api/utils.ts`, `FaqNodeContent.tsx`                            | basso   | ✅    |
| **V2** | R3 (R6 _Out_) — quick wins   | `accommodations/[slug]/page.tsx`                                | basso   | ✅    |
| **V3** | R5 — de-dup componenti       | nuovo `CardImage`, `lib/text/excerpt`, easing token, 4 card     | medio   | ☐     |
| **V4** | R5 — `WidgetList` generico   | nuovo `WidgetList`, Amenities/Comforts/Essentials + consumer    | medio   | ☐     |
| **V5** | R4 — helper anti-boilerplate | `i18n/paths` (indexAlternates), pagine index                    | medio   | ☐     |
| **V6** | R7 — split FAQ               | `faq/[[...slug]]` → `/faq` + `/faq/[...slug]`                   | alto    | ☐     |
| **V7** | R7 — slim ApartmentDetail    | `accommodations/[slug]/page.tsx` + `ApartmentDetailContent.tsx` | alto    | ☐     |

Ordine: V1 → V2 → V3 → V4 → V5 → V6 → V7 (rischio crescente; le ultime toccano route/markup condivisi).

**Nota su R6 (Out):** `HomeContent` e `FaqIndexContent` sono passati come `contentComponent` al `RealtimeWrapper` (client), quindi **devono** restare `'use client'` — un Server Component non può essere renderizzato attraverso un boundary client. Il rilievo dell'audit non teneva conto del `RealtimeWrapper`. Per togliere il `'use client'` servirebbe ristrutturare il pattern realtime (fuori scope).
