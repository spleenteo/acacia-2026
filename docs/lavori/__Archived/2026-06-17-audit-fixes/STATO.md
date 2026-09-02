---
lavoro: audit-fixes
stato: chiuso
fase: conclusa
chiuso: 2026-06-17
archiviato: 2026-09-02
---

# Audit fixes — sicurezza, de-duplicazione, performance

> Lavoro precedente all'adozione di devflow: i documenti qui dentro sono stati scritti
> con le skill di shaping e rinominati secondo le convenzioni devflow al momento
> dell'archiviazione (2026-09-02). Non c'è mai stato uno `STATO.md` durante il lavoro;
> questo file è stato ricostruito dai documenti e dalla storia git.

## Esito

Chiuso un open redirect, smesso di esporre gli internals negli errori, estratti CardImage e WidgetList, de-duplicati metadata e static params, parallelizzate le query della scheda appartamento.

## Dove sta l'esito

Changelog: v0.8.1

## Cosa è rimasto aperto

**V6 e V7 deferite a backlog** il 2026-06-17: coprono R7 (era Undecided), sono sola manutenibilità e ad alto rischio di regressione su codice funzionante. Da riprendere come lavoro a sé, una slice per volta con verifica EN+IT.
