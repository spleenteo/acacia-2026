---
status: chiuso
phase: conclusa
slice: null
step: null
work: locale-switcher
stack: react
updated: 2026-09-02
tags: [work, locale-switcher]
description: 'Portare il cambio lingua dal footer al menu principale, dove gli utenti lo trovino, e smettere di memorizzare una lingua che nessuno ha scelto.'
---

# Status — Selettore di lingua nel menu principale

> Aggiornare a **fine di ogni sessione**: cosa fatto, cosa resta, blocchi.

**Entry**: prodotto, deciso il 2026-09-02 perché l'esito non è definibile in una frase senza dire "dipende da come lo mettiamo": voce di menu con dropdown, elemento compatto accanto alla CTA e riga di suggerimento sono tre esiti diversi per l'utente. Il problema però è già chiaro (utenti che non trovano il cambio lingua), quindi si salta il frame e si parte dallo shaping.

**Scope deciso in apertura**: posizione dello switch **+** il cookie `NEXT_LOCALE` scritto anche quando l'utente non ha scelto nulla. Il suggerimento di lingua a chi atterra da Google nella lingua sbagliata resta **fuori scope**, valutabile come lavoro a sé.

## Cosa si sa già del problema

Raccolto leggendo il codice il 2026-09-02, prima dello shaping:

- **Su mobile lo switch è già nell'header**: `SiteHeader/index.tsx:283` monta `<LocaleSwitcher variant="menu">` dentro l'overlay dell'hamburger, in fondo, sotto i CTA Contact e Book. Esiste già una variante grafica `menu`. Su mobile il lavoro è di collocazione, non di costruzione.
- **Su desktop (`lg`+) manca davvero**: la barra è `wordmark | nav dal CMS | Book + hamburger`. Lo switch vive solo nel footer (`SiteFooter/index.tsx:135`, `variant="footer"`).
- **La negoziazione `Accept-Language` non copre chi arriva da Google**: `proxy.ts:45` negozia solo per URL **senza** prefisso di lingua. Gli URL indicizzati il prefisso ce l'hanno, quindi la negoziazione non viene mai interrogata.
- **Il cookie memorizza una scelta mai fatta**: `rememberLocale()` (`proxy.ts:97`) scrive `NEXT_LOCALE` a ogni visita con prefisso esplicito. Un italiano che atterra una volta su `/en/...` si porta a casa `NEXT_LOCALE=en`, e da lì in poi anche la home senza prefisso lo manda in inglese.
- **Il nav centrale viene dal CMS** (`navItems`, modello `MenuItemRecord`): una voce "lingua" lì mescolerebbe una funzione di sistema con voci di contenuto che gestisce l'editor.
- **Vincolo Turbopack**: niente hook di `next/navigation`. `LocaleSwitcher` usa già `window.location` e `window.history`, come impone il CLAUDE.md.

## Slices

- [x] **V1** — il controllo nella barra, su desktop
- [x] **V2** — il controllo nella barra, su mobile + CTA a icona sotto 400px
- [x] **V3** — il cookie scritto solo quando l'utente sceglie

## Log

<!-- data — cosa fatto — cosa resta — blocchi -->

- 2026-09-02 — aperto il lavoro, letto il codice esistente, fissato lo scope (posizione + cookie) — resta lo shaping — nessun blocco
- 2026-09-02 — shaping: 9 requisiti, 3 shape (A voce+dropdown, B EN/IT accanto alla CTA, C controllo nella barra). R2 e R8 promossi a Must-have → A e B escono. **C selezionata ma con un ❌ su R7**: C6 (barra mobile sotto i 360px) è flagged — resta lo spike S1 prima dello slicing — nessun blocco
- 2026-09-02 — spike S1 chiuso (misure Playwright sul build di produzione): a 320px lo switch non entra in nessuna lingua; entra da 360px in IT e da 390px in EN. Il collo di bottiglia è la CTA ("Check availability" = 163,6px, il 58% della barra), non lo switch. I bordi tenui del design system sono sotto 3:1 → la cella attiva va a fondo pieno — resta la scelta della leva prima di aggiornare C
- 2026-09-02 — shape C aggiornata con gli esiti dello spike: cella attiva a fondo pieno (C1), CTA a sola icona sotto 400px (C6, scelta dell'utente fra le leve misurate), segmented a `--text-label` 55,7px (C7). **R7 passa: C senza flag, fit check pulito** — resta lo slicing — nessun blocco
- 2026-09-02 — migrato alle nuove convenzioni della skill (docs/work/, STATUS.md, campi inglesi); breadboard saltato e dichiarato; slicing: 3 slice (V1 desktop, V2 mobile+CTA, V3 cookie) — resta la fase impatto prima del piano di V1 — nessun blocco
- 2026-09-02 — fase impatto: 5 lenti in parallelo, **21 problemi** (4 trovati da 3 lenti indipendenti). Slice riscritte da capo: una sola istanza del componente, cella attiva invertita per stato, cookie rinominato + rinnovo condizionale (Safari ITP), token `xs` al posto della classe arbitraria, 404/error dentro V3. **R4 corretto nel fit check: era ✅ a torto** (href alla home su quasi tutte le pagine). Baseline V3 registrato: `/` con Accept-Language it → `location: /en` — resta il piano di V1 — nessun blocco
- 2026-09-02 — **V1 consegnata**. Piano scritto, rivisto da un subagent (16 rilievi, 4 gravi: il piano ridefiniva il Done #3 invece di rispettarlo, e il check del contrasto girava su una pagina il cui header non è mai scuro). Implementata: variante `header` segmented con inversione per stato, prop `onLight`, mappa dei toni al posto del ternario, href risolto via `useSyncExternalStore`. Playwright e `scripts/measure-header.mjs` nel repo. Tutti i Done verdi tranne il #3 (href corretto solo post-idratazione, R4 parziale per i crawler) — resta il piano di V2 — nessun blocco
- 2026-09-02 — **V2 consegnata**. Piano rivisto da un subagent: 12 rilievi, di cui sei erano check incapaci di fallire e uno era un'asserzione sull'altezza già falsa in partenza (la barra era 59,5px, non i 58 del token). Implementata: switch visibile a ogni larghezza, CTA a icona sotto `xs` (400px, breakpoint vero), variante `menu` rimossa, sorgenti GA4 distinte. Matrice 20/20 verde — resta il piano di V3 — nessun blocco
- 2026-09-02 — **V3 consegnata, lavoro concluso.** Piano rivisto: 9 rilievi, di nuovo quasi tutti su check incapaci di fallire (il test del 404 leggeva il wordmark dell'header; `/en/blog` non passa dal proxy ma da next.config; la scelta esplicita era provata nella direzione che Accept-Language produce già). Implementato: cookie rinominato `acacia_locale`, scritto solo dal click, rinnovato dal proxy solo se esiste; `HomeLink` per 404 ed error; due righe false corrette in CLAUDE.md. Prossimi passi: `/devflow-docs` prima del merge, `/devflow-archive` dopo.
