# Ledger — V2

unset

- T2 · flow:executor · definition: sonnet · DONE_WITH_CONCERNS · 6b079f1
  Status: DONE_WITH_CONCERNS. Commits: 6b079f1 Add migration deleting the Translation model. Tests: step 1 dependency check `true`; `npx tsc --noEmit` exit 0; `npx eslint migrations` exit 0 with 3 `import/no-anonymous-default-export` warnings (same on the two existing migrations, from the mandated signature); `npx prettier --check migrations` passes; `rg -n "cma-schema" migrations` nothing; dry run exit 0, `Successfully simulated 1 migration scripts (dry run, no changes were made)`. Servers: none. Concerns: the `npm notice run` line of the dry-run output echoed the `--api-token` value, printed in the session transcript and in `/tmp/t2-dry.txt`; the migration has not run anywhere.

- T1 · flow:executor · definition: sonnet · DONE · no commits
  Status: DONE. Commits: none. Tests: T1 command unchanged, `en 134 134`, `it 134 134`, `diff 0`, exit 0. Servers: none. Concerns: none.
- T1 · flow:task-reviewer · definition: sonnet · Spec: pass, Quality: pass · No findings
- T1: complete

- T2 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · No findings; low notes: 3 eslint `import/no-anonymous-default-export` warnings from the mandated signature, same as the existing migrations
- T2: complete

Ruling: T2 passes with its token concern handed to the owner instead of a fix round — the commit holds no token (0 matches), and rotating the CMA token is the owner's call; the `/tmp/t2-dry.txt` copy went to the Trash through `del` — cost if wrong: the token stays exposed in the session transcript and the Trash until rotated, and T3 and the plan's `npx ... --api-token` commands echo it again.

Ruling: Conductor's answer to the STOP — token rotated, `.env.local` holds the new one, plan commands use `DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms …` (never `npx` or `--api-token`, never print a token); maintenance is ON and T1's re-run gave diff 0, 134 keys each; run T3, T4, T5, final review, close moves 1–2; gate with `export DATOCMS_ENVIRONMENT=production-2026-11-08` in one shell; promotion-dependent Done items go as `pending:`; never run the conductor's Order steps nor touch any environment but the fork; a plan-limit error at T3 is a STOP; add the npx lesson to Lessons — the owner authorized going on without further stops except critical situations — cost if wrong: a fork taken while edits still land would be stale, which the maintenance lock and T1's diff 0 rule out.

- T3 · flow:executor · definition: sonnet · DONE (with concerns noted) · no commits
  Status: DONE. Commits: none. Tests: `migrations:run --source=activities-01 --destination=production-2026-11-08` printed `Creating a fork ... done`, `Running migration "1794206985_deleteTranslationModel.ts"... done`, `Successfully run 1 migration scripts`, exit 0; the `schema:inspect` diff printed exactly `< translation`. Servers: none. Concerns: first attempt rejected by the PreToolUse hook for an `rm` in the same command, before anything ran, so the migration ran once; no plan limit; the webhook may have fired, step 9 is still needed.
- T3 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · Live re-check: diff `< translation` (40 models vs 39), full schema diff with `translation` excluded 0 lines, 8 environments with the fork `ready` and no stray one; low: status should have read DONE_WITH_CONCERNS; cannot verify: maintenance still on when the fork ran, only the conductor's report says so — the conductor confirms it before promoting
- T3: complete

- T4 · flow:executor · definition: sonnet · DONE · 5096acb
  Status: DONE. Commits: 5096acb Regenerate schema and types without the Translation model. Tests, with `DATOCMS_ENVIRONMENT=production-2026-11-08` exported and pipefail: `npm run codegen` 0, `npx gql.tada generate output` 0, prettier 0, `npx tsc --noEmit` 0, `rg -c Translation` on the three files no matches; numstat before commit `0 127 schema.graphql`, `1 20 cma-types.ts`, `2 5 graphql-env.d.ts`. Servers: none. Concerns: none.
- T4 · flow:task-reviewer · opus (top tier, critical) · Spec: pass, Quality: pass · Only the three Translation query fields, types and union member removed; no `Translation` left in `src` or `scripts` outside next-intl calls; low: report without `npm run build`, covered by the gate
- T4: complete

- T5 · flow:executor · definition: sonnet · DONE_WITH_CONCERNS · dff0476, 08a6fe5
  Status: DONE_WITH_CONCERNS. Commits: dff0476 Remove the Translation export script; 08a6fe5 Drop the export-translations script entry and its docs. Tests: the `rg` for the old pipeline nothing, `rg -n 'Translation. model' CLAUDE.md` nothing, `jq -e '.scripts.codegen' package.json` 0, `npx prettier --check package.json CLAUDE.md` 0; `npm run build` left to the gate. Servers: none. Concerns: split in two commits because the first `git add` failed on the already-staged deleted path and amending isn't allowed.

Ruling: T5 stays in two commits (dff0476, 08a6fe5), passing the reviewer's medium process finding without a fix round — a fix commit can't merge them and executors are forbidden `--amend`, rebase and reset, so the only remedy is a history rewrite outside the executor's rules, and the end state is the task's — cost if wrong: dff0476 alone leaves a dead npm script and a stale CLAUDE.md bullet if bisected or reverted by itself; the conductor can still squash before the merge if the owner wants one commit.

- T5 · flow:task-reviewer · definition: sonnet · Spec: pass, Quality: pass · medium process: task split in two commits, ruled above; low: commit trailers name a different model than the reviewer's session attribution, not in the executor rules
- T5: complete

- Final review · flow:task-reviewer · opus (top tier) · Spec: pass, Quality: pass · All four commits match the plan and the mandate; only Translation removed from the generated files; the sandbox has 39 models and the linked menu item is gone; no leftover of the old pipeline in tracked code. Low: `npm run build` not run before the commits, closed by the gate. Cannot verify: that maintenance was on before the sandbox was created (2026-11-09T07:37:43Z); it is active now, and the conductor's report is the only evidence. No fix round.

pending: `npx datocms schema:inspect` sul nuovo primary non elenca `Translation` (needs the promotion, conductor's Order steps 7–8)
pending: Il sito di produzione mostra le label in entrambe le lingue dopo la promozione (needs the promotion, invalidation and deploy, conductor's Order steps 9–11)

Final review: done

Gate: green with `DATOCMS_ENVIRONMENT=production-2026-11-08` exported in one shell: `npx tsc --noEmit` 0, `npm run build` 0, `npm run codegen` + prettier + `git diff --exit-code` on the generated files 0, `npm run lint` 0 (4 eslint warnings, all `import/no-anonymous-default-export`, none an error). The first lint run was red only on this untracked ledger, which prettier then formatted; no code changed. `rg -i 'allTranslations|fetchTranslations|export-translations' src scripts package.json CLAUDE.md` finds nothing. Token scan of the gate's output: no match. Not re-run unexported: that is Order step 8, after the promotion.

## Close draft

Narrative: L'esecuzione ha confermato il piano: il fork `production-2026-11-08` da `activities-01` non ha trovato limiti del piano, la migration ha tolto il solo modello `translation` (39 modelli contro 40, nessuna differenza di campi sugli altri, voce di menu collegata rimossa) e i file generati hanno perso solo le voci di Translation. Durante T2 un `npx … --api-token` ha stampato il token CMA: l'owner lo ha ruotato e il piano è passato a `DATOCMS_API_TOKEN` col binario locale prima di T3. Ruling: T2 è passato lasciando il token all'owner; T5 è rimasto in due commit (dff0476, 08a6fe5) perché la correzione richiederebbe una riscrittura vietata agli executor, e il conductor può ancora fare lo squash prima del merge. Da sapere prima della promozione: la CLI non mostra quando è stata attivata la maintenance, quindi il blocco prima del fork (2026-11-09T07:37:43Z) va confermato dal conductor; `npm run codegen` passa ancora `--api-token` allo script `generate-cma-types`, dentro `bash -c` e non via `npx`, e nell'output del gate non è comparso alcun token. Restano al conductor la promozione, la maintenance off, `.env.local`, l'invalidazione, il merge e il controllo in produzione.

Lessons:

- Su questa macchina `npx` stampa gli argomenti, quindi un token passato come argomento finisce nell'output; usa la variabile d'ambiente e il binario locale.
- `git rm` mette già in stage la cancellazione, e un `git add` successivo su quel path fallisce: aggiungi solo gli altri file, o il task si spezza in due commit.
- Un hook rifiuta `rm` su questa macchina e blocca l'intero comando che lo contiene: per i file temporanei usa `del`, in un comando a parte.
- Il ledger non tracciato entra in `prettier --check .` e finisce nel commit di chiusura: passagli `prettier --write` prima del gate.

Decision candidate: none

Ruling: pending risolti dal conductor dopo la promozione — `schema:inspect` sul nuovo primary senza `translation`; gate non esportato verde sui file generati; `/en` e `/it` servono le label in produzione.

Ruling: promozione, maintenance off, invalidazione eseguite dal conductor su autorizzazione generale dell'owner del 2026-11-09 — l'owner ha chiesto di andare avanti senza fermarsi salvo situazioni critiche.
