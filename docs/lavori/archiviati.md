---
tags: [lavori, archivio, indice]
description: "Indice dei lavori archiviati in docs/lavori/__Archived/, cartella che Claude non legge. Questo file sta fuori ed è l'unica traccia che quei lavori siano esistiti."
---

# Lavori archiviati

> `docs/lavori/__Archived/` contiene i lavori conclusi. Claude non la legge: `.claude/settings.json` nega `Read` e `Grep` su quel percorso. Questo file sta fuori e dice dove trovare l'esito di ogni lavoro. Si aggiorna con `/devflow-archive`.

I nove lavori qui sotto sono **precedenti all'adozione di devflow**: vivevano in `docs/shaping/`, `docs/pitches/` e `pitches/`. Il 2026-09-02 sono stati riorganizzati nella struttura devflow (`<data>-<slug>/` con `pitch.md`, `shaping.md`, `slices.md`) e archiviati in blocco. Lo `STATO.md` di ognuno è ricostruito dai documenti e dalla storia git, non scritto durante il lavoro.

| Lavoro                        | Chiuso     | Cosa ha fatto                                                                                                    | Dove sta l'esito                               |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `init`                        | 2026-03-14 | Ricostruzione del sito da Middleman a Next.js 16 + DatoCMS: home, appartamenti, quartieri, moods, bilingue EN/IT | v0.1.0, v0.2.0, v0.3.0                         |
| `frontend-restyle`            | 2026-03-14 | Primo linguaggio visivo (Rinascimento Moderno), poi superato da Japan Fish                                       | v0.2.0, v0.3.0 · design attuale in `CLAUDE.md` |
| `apartment-detail-redesign`   | 2026-06-03 | Redesign della scheda appartamento: hero con palette dalla foto, flusso zig-zag, sidebar, What We Love           | v1.0.1 e il lavoro di giugno 2026              |
| `datocms-schema-migration`    | 2026-03-18 | Rinomina modelli, publish/draft nativo su appartamenti e quartieri, pulizia record orfani                        | v0.4.1                                         |
| `web-previews-visual-editing` | 2026-03-18 | Web Previews, preview link per record, Visual Editing con overlay click-to-edit                                  | v0.4.0, v0.4.2                                 |
| `cms-realignment`             | 2026-03-22 | Frontend allineato ai nuovi modelli e blocchi; navigazione e footer dal CMS                                      | v0.6.0, v0.7.0                                 |
| `faq-section`                 | 2026-06-12 | Sezione FAQ ad albero, routing catch-all ricorsivo, Structured Text, JSON-LD FAQPage                             | v0.8.0                                         |
| `audit-fixes`                 | 2026-06-17 | Open redirect chiuso, errori non più verbosi, CardImage e WidgetList estratti, query parallelizzate              | v0.8.1                                         |
| `home-search`                 | 2026-06-21 | Site Search: route handler, pagina risultati con filtri, SearchBox nell'hero                                     | v0.9.0                                         |

## Cosa è rimasto aperto

Tre lavori sono stati archiviati con dei residui noti. Sono murati insieme ai loro documenti — questa è l'unica traccia leggibile che esistano.

- **`cms-realignment` → R3 non fatto** (era un must-have): `HeroBlock` riusabile anche per Accommodations.
- **`audit-fixes` → V6 e V7 deferite a backlog** il 2026-06-17: coprono R7, sono sola manutenibilità e ad alto rischio di regressione su codice funzionante.
- **`home-search` → note di fase 2**: build trigger per il re-crawl automatico alla pubblicazione, rumore nav/footer negli excerpt (limite del crawler DatoCMS), cap a 100 risultati recuperabili dall'API.

Il pitch `apartment-detail-redesign` è stato archiviato come concluso pur essendo rimasto marcato "Shaped": il redesign è nel codice, ma è arrivato per iterazioni successive e non seguendo le slice che il pitch proponeva.
