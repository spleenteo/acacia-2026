---
stato: in-corso
fase: shaping
slice: null
passo: null
lavoro: locale-switcher
stack: react
updated: 2026-09-02
tags: [lavoro, locale-switcher]
description: 'Portare il cambio lingua dal footer al menu principale, dove gli utenti lo trovino, e smettere di memorizzare una lingua che nessuno ha scelto.'
---

# Stato — Selettore di lingua nel menu principale

> Aggiornare a **fine di ogni sessione**: cosa fatto, cosa resta, blocchi.

**Ingresso**: prodotto, deciso il 2026-09-02 perché l'esito non è definibile in una frase senza dire "dipende da come lo mettiamo": voce di menu con dropdown, elemento compatto accanto alla CTA e riga di suggerimento sono tre esiti diversi per l'utente. Il problema però è già chiaro (utenti che non trovano il cambio lingua), quindi si salta il frame e si parte dallo shaping.

**Scope deciso in apertura**: posizione dello switch **+** il cookie `NEXT_LOCALE` scritto anche quando l'utente non ha scelto nulla. Il suggerimento di lingua a chi atterra da Google nella lingua sbagliata resta **fuori scope**, valutabile come lavoro a sé.

## Cosa si sa già del problema

Raccolto leggendo il codice il 2026-09-02, prima dello shaping:

- **Su mobile lo switch è già nell'header**: `SiteHeader/index.tsx:283` monta `<LocaleSwitcher variant="menu">` dentro l'overlay dell'hamburger, in fondo, sotto i CTA Contact e Book. Esiste già una variante grafica `menu`. Su mobile il lavoro è di collocazione, non di costruzione.
- **Su desktop (`lg`+) manca davvero**: la barra è `wordmark | nav dal CMS | Book + hamburger`. Lo switch vive solo nel footer (`SiteFooter/index.tsx:135`, `variant="footer"`).
- **La negoziazione `Accept-Language` non copre chi arriva da Google**: `proxy.ts:45` negozia solo per URL **senza** prefisso di lingua. Gli URL indicizzati il prefisso ce l'hanno, quindi la negoziazione non viene mai interrogata.
- **Il cookie memorizza una scelta mai fatta**: `rememberLocale()` (`proxy.ts:97`) scrive `NEXT_LOCALE` a ogni visita con prefisso esplicito. Un italiano che atterra una volta su `/en/...` si porta a casa `NEXT_LOCALE=en`, e da lì in poi anche la home senza prefisso lo manda in inglese.
- **Il nav centrale viene dal CMS** (`navItems`, modello `MenuItemRecord`): una voce "lingua" lì mescolerebbe una funzione di sistema con voci di contenuto che gestisce l'editor.
- **Vincolo Turbopack**: niente hook di `next/navigation`. `LocaleSwitcher` usa già `window.location` e `window.history`, come impone il CLAUDE.md.

## Slice

- [ ] (da definire nello slicing)

## Log

<!-- data — cosa fatto — cosa resta — blocchi -->

- 2026-09-02 — aperto il lavoro, letto il codice esistente, fissato lo scope (posizione + cookie) — resta lo shaping — nessun blocco
- 2026-09-02 — shaping: 9 requisiti, 3 shape (A voce+dropdown, B EN/IT accanto alla CTA, C controllo nella barra). R2 e R8 promossi a Must-have → A e B escono. **C selezionata ma con un ❌ su R7**: C6 (barra mobile sotto i 360px) è flagged — resta lo spike S1 prima dello slicing — nessun blocco
