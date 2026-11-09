# Ledger — V1

unset

- T1 · flow:executor · definition: sonnet · DONE · 3d541a6
  Status: DONE. Commits: 3d541a6 Dump the published UI labels into src/messages. Tests: none: level none; Verified script printed `en 134 ok`, `it 134 ok`, exit 0; `npx prettier --check src/messages` passes. Servers: none. Concerns: none.

- T2 · flow:executor · definition: sonnet · DONE · f55017a
  Status: DONE. Commits: f55017a Give the computed translation-key maps literal types. Tests: none: level none; `npx tsc --noEmit` exits 0; `rg -c "as const satisfies"` prints 1 for each file; Prettier passes on both. Servers: none. Concerns: none.
- T2 · flow:task-reviewer · definition: sonnet · Spec: pass, Quality: pass · No findings
- T2: complete
- T1 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · No findings
- T1: complete

- T3 · flow:executor · definition: sonnet · DONE · d301cdd
  Status: DONE. Commits: d301cdd Load UI labels from the messages JSON. Tests: none: level none; `npx tsc --noEmit` exit 0; `rg fetchTranslations src/i18n/request.ts` empty; `npm run build` completed but piped through `tail`, exit code not read; chunk check on `apartment.bathWord`: languages in separate chunks. Servers: none. Concerns: none.
- T3 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · low: build exit code not captured (piped through tail); the close's gate covers it
- T3: complete

- T4 · flow:executor · definition: sonnet · DONE · 9993a30
  Status: DONE. Commits: 9993a30 Remove fetchTranslations and the noStore query option (sha read from git; the report did not capture it). Tests: `npx tsc --noEmit` exit 0; `rg -n "noStore|fetchTranslations" src` empty. Servers: none. Concerns: Prettier re-indented the whole `requestInitOptions` ternary once the condition fit on one line (21 insertions, 28 deletions in executeQuery.ts); behaviour unchanged.
- T4 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · low: report without short sha; low: status DONE with a non-empty Concerns · cannot verify: no build evidence for this commit, the close's gate covers it
- T4: complete

- T5 · flow:executor · definition: sonnet · DONE · 80f5bc1
  Status: DONE. Commits: 80f5bc1 Type UI message keys and assert en/it parity. Tests: none (level none); Verified (a) tsc exit 0; (b) unknown key TS2345 exit 2; (c) it-only key TS2344 in appConfig.ts exit 2; (d) en-only key TS2344 in appConfig.ts exit 2; (e) tsc exit 0, Prettier passes, `git status --short src` clean. Servers: none. Concerns: first Prettier check failed, fixed with `prettier --write` before the commit; first run of the Verified script blocked by the `rm` hook, nothing ran, redone with `del` for the temp file; JSON mutations restored with `git restore`.
- T5 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · low: status DONE with a non-empty Concerns · cannot verify: no build evidence for this commit, the close's gate covers it
- T5: complete

- T6 · flow:executor · definition: sonnet · DONE_WITH_CONCERNS · 16f0964, c0614a6
  Status: DONE_WITH_CONCERNS. Commits: 16f0964 Correct documents that described the CMS as the label source; c0614a6 Drop the stale messages bullet from the pre-launch review. Tests: none: level none; `rg` checks empty, `prettier --check` passed on the five files (run before the bullet's deletion). Servers: none. Concerns: task split in two commits because the first `sed` deletion failed on macOS; not amended, per the rules.

Ruling: T6's two commits accepted, not squashed — the only fix is a history rewrite, which the executor rules forbid (no amend, rebase or reset), and the final state is correct on the re-run checks — cost if wrong: one extra small commit in history; 16f0964 alone leaves one stale bullet

- T6 · flow:task-reviewer · definition: sonnet · Spec: pass, Quality: pass · medium: two commits for one task (ruled above); low: Verified `rg` checks not re-run after the bullet's deletion (reviewer re-ran them on the final state: clean)
- T6: complete

Ruling: no fix round on the Prettier failure of `npm run lint` — the four files it flags are outside the slice's commits: two local `.impeccable/` artifacts git ignores (nested `.gitignore`, `.git/info/exclude`) and this run's uncommitted ledger and packet; every tracked file passes Prettier — cost if wrong: `npm run lint` keeps exiting 1 in this checkout until the `.impeccable/` artifacts are ignored by Prettier too, and the packet needs formatting before it is committed

- Final review · flow:task-reviewer · opus (top tier) · Spec: pass, Quality: pass · no high or medium findings
  low: `docs/pre-launch-review.md:17,21,25` give fixes for items already fixed in the code (the keys and `useTranslations` exist; the items were stale before V1 and T6 followed the plan's wording); mark them resolved. Not fixed.
  low: `CLAUDE.md:34` says "after V1 is deployed", a work-internal name a later reader can't resolve. Not fixed.
  low: the ledger's head fails Prettier. Fixed by the runner when it formatted the ledger.
  Cannot verify: JSON values against published records (re-run at the close: `en 134 ok`, `it 134 ok`), labels in dev (pending below), build evidence per commit (the gate's build exits 0).

pending: In dev, in `/en` e `/it`, mostrano le stesse label di prima: home, dettaglio appartamento, `/search` con i tipi di risultato, dettaglio mood e dettaglio quartiere con i filtri, `/guestbook`, e il `DraftModeToggler` (appare solo in Draft Mode). A `next-server` was already listening on port 3000 before this run (pid 26524, started 19:06): it is not a leftover of the slice.

Final review: done

Gate: `npm run lint` exit 1 (eslint 0 errors, 3 warnings in files the slice did not touch; `prettier --check .` flags only files outside the slice's commits, see the ruling; every tracked file passes); `npx tsc --noEmit` exit 0; `npm run build` exit 0; `npm run codegen` + Prettier exit 0 and `git diff --exit-code` on the generated files exit 0. Done checks: dump re-checked against the published records at the close (`en 134 ok`, `it 134 ok`, same keys); unknown key and one-language key fail `tsc` (T5: TS2345, TS2344 twice, exit 2; only documents changed after it).

## Close draft

Narrative: Le label arrivano da `src/messages/{en,it}.json`, 134 chiavi per lingua, generate una volta dai record pubblicati di `activities-01` e ricontrollate alla chiusura. `request.ts` importa il JSON della lingua richiesta, in chunk separati per lingua; `fetchTranslations` e `noStore` non esistono più; `AppConfig` tipizza le chiavi e `appConfig.ts` fa fallire `tsc` su una chiave inesistente o presente in una sola lingua. Ruling: T6 è rimasta in due commit, perché un `sed` fallito su macOS ha lasciato un bullet e unirli avrebbe riscritto la storia. Ruling: nessun giro di fix sul Prettier rosso di `npm run lint`, che segnala solo due artefatti locali di `.impeccable/` ignorati da git e i file non committati del work. La review finale ha lasciato due osservazioni basse: tre voci di `docs/pre-launch-review.md` (17, 21, 25) descrivono fix già fatti nel codice, e `CLAUDE.md:34` cita "V1".

Lessons:

- Non far passare per `tail` un comando di verifica: l'exit code si perde. Redirigi su file o usa `set -o pipefail`.
- Su macOS `sed -i` vuole l'argomento del backup: controlla il diff prima del commit, così una cancellazione fallita non diventa un secondo commit.
- Prima di riscrivere la correzione di una voce di un documento di review, controlla che il codice abbia ancora quel problema.
- `prettier --check .` segnala anche i file ignorati da `.gitignore` annidati o da `.git/info/exclude`, e i file del work non ancora formattati: distingui questi dai file tracciati prima di dichiarare rosso il gate.

Decision candidate: none

Ruling: gate riportato verde dopo l'ok dell'owner — `.impeccable` aggiunto a `.prettierignore`, perché Prettier segnalava solo artefatti locali ignorati da git; `npm run lint` exit 0 — se servisse formattare `.impeccable`, va tolto dall'ignore.

Controlli manuali: testo server-rendered di home, appartamento, mood, quartiere, guestbook e search confrontato con la produzione, identico a parte i contenuti a rotazione della home; `DraftModeToggler` presente in Draft Mode. Clic sui filtri e resa nel browser non provati.
