---
work: native-ui-messages
slice: V2
updated: 2026-11-09
description: 'V2 plan: delete the DatoCMS Translation model in a sandbox, promote it, remove the export script'
---

# V2 plan — Il modello Translation sparisce da DatoCMS

**Mandate**: [slices.md, V2](slices.md) · **Guidelines**: [development-guidelines.md](../../../development-guidelines.md) · **Lessons**: [lessons.md](lessons.md) · **Execution rules**: [executor.md](/Users/spleenteo/.claude/plugins/cache/flow/flow/facb0e621782/agents/executor.md), test level `none`
**Summary**: Compares the CMS labels with the JSON, and writes the migration that deletes `translation` by `api_key`. With maintenance on, forks `activities-01` into `production-2026-11-08` and runs the migration there. Regenerates and commits schema and types against the sandbox, then removes the export script. After the gate and the owner's ok, the conductor promotes, turns maintenance off, verifies `DATOCMS_ENVIRONMENT`, invalidates the cache, merges to `main` and checks production. `activities-01` survives as a sandbox.
**Files**: `migrations/<unix-timestamp>_deleteTranslationModel.ts` (timestamp set by the CLI), `schema.graphql`, `src/lib/datocms/graphql-env.d.ts`, `src/lib/datocms/cma-types.ts`, `scripts/export-translations.ts`, `package.json`, `CLAUDE.md`

## The slice, decided here

- Facts read on 2026-11-08: `activities-01` is primary, plus 6 sandboxes; maintenance is off. `translation` is a model, not a block, with 134 records and no draft mode, so published is all there is. No field of any model or block references it. CMS and JSON match: 0 differences. `schema_migration` already records both existing migrations, so only the new one runs (T2's dry run confirms it).
- Sandbox name: `production-2026-11-08`. It becomes the primary's permanent name, so it describes the role, not this work. It is free today.
- The migration finds the model by `api_key`. `itemTypes.destroy` also deletes its linked menu item by default, which is wanted. The scaffold is created without `--schema`: the migration body doesn't use a snapshot and the existing migrations don't have one.
- `verbatimModuleSyntax` is not set in this `tsconfig.json`, but the type-only import is used anyway, and `tsc` covers `migrations/` (only `scripts` is excluded).
- The migration is written and committed before maintenance goes on, to keep the editors' lockout short; it runs only after. T1's comparison is repeated once maintenance is on, closing the gap in which an edit could land.
- `npm run codegen` does not write `graphql-env.d.ts`, and the gate would not notice: T4 adds `npx gql.tada generate output`.
- The gate runs before the promotion with `DATOCMS_ENVIRONMENT=production-2026-11-08` exported. `.env.local` holds `activities-01`, so without the export its codegen would bring `Translation` back and go red.
- `main` gets the code after the promotion. For production the order doesn't matter: the deployed code no longer queries `allTranslations`, the generated files are compile-time only, and Vercel skips codegen (`prepare`). It matters for `main`: merged earlier, codegen there would drift from the primary, and an aborted promotion would leave commits to revert.
- `DATOCMS_ENVIRONMENT` is absent from Vercel today in production, preview and development, so the site follows the primary with no change. Locally it is emptied after the promotion, matching Vercel and `.env.local.example`; a new name would recreate this trap at the next promotion.
- Tokens: always `DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms …` inside `bash -c`, never `npx` or `--api-token`: on this machine `npx` echoes its arguments, and that leaked the previous token. `vercel env run` is never used: in review it took the deploy path, and `.env.local` overrides Vercel's values in it. Never `echo` a token, use `--log-level BODY*`, `curl -v`, or `vercel env pull`.
- Abort before the promotion: `maintenance:off`, no merge. The primary is untouched and the sandbox stays until the owner decides. An aborted sandbox is never promoted: after `maintenance:off` it is stale, and a promotion doesn't merge edits. Resuming means a fresh fork, with the owner's ok on a new name or on destroying the aborted sandbox, then T3, T4 and the gate again; T4's and T5's commits stay on the branch and the gate is red with `.env.local` on `activities-01` until then. Return after the promotion, each step with the owner's ok: `maintenance:on`, `environments:promote activities-01`, `maintenance:off`, manual cache invalidation; edits made on the new primary in between are lost, which is why maintenance goes on first. V1's code works on either environment. If the merge already happened, `main` lacks `Translation` while the primary has it, so the gate's generated-files diff goes red: revert the merge's generated-files changes on a branch and regenerate from the restored primary. `activities-01` and the other 6 sandboxes are never destroyed by this plan. A pre-V1 deploy would need `activities-01` promoted again.

## Tasks

### T1 — Compare the CMS labels with the JSON

**What**: Run the command below. It reads published records, and changes and commits nothing. If it prints `diff` above 0, stop with BLOCKED and paste the lines: the owner decides, then the conductor copies the agreed values into `src/messages/*.json` and commits.

```bash
DATOCMS_ENVIRONMENT=activities-01 ./node_modules/.bin/dotenv -c -- node --input-type=module -e 'import fs from "fs"; const q = "query($l:SiteLocale!,$s:IntType!){allTranslations(first:500,skip:$s,locale:$l){key value}}"; const headers = {"Content-Type":"application/json",Authorization:"Bearer "+process.env.DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,"X-Exclude-Invalid":"true","X-Environment":process.env.DATOCMS_ENVIRONMENT};
const get = async (l) => { const rs=[]; for (let s=0;;s+=500) { const j = await (await fetch("https://graphql.datocms.com",{method:"POST",headers,body:JSON.stringify({query:q,variables:{l,s}})})).json(); if (j.errors) throw new Error(JSON.stringify(j.errors)); rs.push(...j.data.allTranslations); if (j.data.allTranslations.length<500) return rs; } }; const flat = (o,p="") => Object.entries(o).flatMap(([k,v]) => v && typeof v==="object" ? flat(v,p+k+".") : [[p+k,v]]);
let bad=0; for (const l of ["en","it"]) { const f = new Map(flat(JSON.parse(fs.readFileSync("src/messages/"+l+".json","utf8")))); const c = new Map((await get(l)).map(r=>[r.key,r.value])); for (const k of new Set([...f.keys(),...c.keys()])) if (f.get(k)!==c.get(k)) { bad++; console.log(l,k,"cms:",JSON.stringify(c.get(k)),"json:",JSON.stringify(f.get(k))); } console.log(l,c.size,f.size); } console.log("diff",bad); process.exit(bad?1:0)'
```

**Files**: none
**Verified**: Exit 0, last line `diff 0`, and `en` and `it` each with two equal counts (134 at planning time). **Done**: Nothing in the CMS is missing from the JSON.

### T2 — Write the migration · `critical`

**What**, in order:

1. Check that nothing depends on the model. This prints `true` and exits 0; otherwise stop with BLOCKED and create nothing: `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms schema:inspect --json --include-validators -e activities-01' 2>/dev/null | jq -e '(map(select(.itemType.api_key=="translation"))[0].itemType) as $t | $t.modular_block==false and ([.[] | .fields[] | select(.validators|tostring|contains($t.id))] | length==0)'`
2. Scaffold: `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms migrations:new deleteTranslationModel --ts'`.
3. In the new file, make the import `import { type Client } from 'datocms/lib/cma-client-node';`, and never import from `src/lib`.
4. Keep the signature `export default async function (client: Client): Promise<void>` and replace its body with `const itemTypes = await client.itemTypes.list(); const translation = itemTypes.find((it) => it.api_key === 'translation'); if (!translation) return; await client.itemTypes.destroy(translation.id);`. Above it, a comment: deletes the `translation` model by `api_key` (ids change across forks), idempotent.
5. `npx prettier --write` the file.

**Files**: `migrations/<unix-timestamp>_deleteTranslationModel.ts`
**Verified**: `npx tsc --noEmit` exits 0; `npx eslint migrations` exits 0; `npx prettier --check migrations` passes; `rg -n "cma-schema" migrations` finds nothing; this dry run contains `Successfully simulated 1 migration scripts`; it neither forks nor loads the script, so it only confirms which scripts would run, and the script first runs in T3: `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms migrations:run --source=activities-01 --destination=production-2026-11-08 --dry-run'`. **Done**: The script is committed and has not run anywhere.
**Interfaces**: Produces the migration file, consumed by T3.

### T3 — Fork and run the migration in the sandbox · `critical` · depends on: T2

**What**: Runs only after the conductor reports maintenance on (Order, step 3). Commits nothing. The invalidation webhook has no environment filter, so this run may invalidate production's cache: harmless, the cache refills from the primary with the same content, and step 9 is still needed. Run `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms migrations:run --source=activities-01 --destination=production-2026-11-08'`. A plan-limit error or any other failure means BLOCKED, with the message: destroy nothing, retry nothing, touch no other environment. If the fork exists but the migration failed, say so; the retry is `--source=production-2026-11-08 --in-place`, on the conductor's instruction.
**Files**: none
**Verified**: The command ends with `Successfully run 1 migration scripts`. Then, in `bash`, this prints exactly one line, `< translation`: `keys() { ./node_modules/.bin/dotenv -c -- bash -c "DATOCMS_API_TOKEN=\"\$DATOCMS_CMA_TOKEN\" ./node_modules/.bin/datocms schema:inspect --json -e $1" 2>/dev/null | jq -r '.[].itemType.api_key' | sort; }; diff <(keys activities-01) <(keys production-2026-11-08) | grep '^[<>]'`
**Done**: The sandbox differs from the primary by the `translation` model alone.
**Interfaces**: Produces the environment `production-2026-11-08`, consumed by T4, the gate and the promotion.

### T4 — Regenerate and commit schema and types · `critical` · depends on: T3

**What**: `DATOCMS_ENVIRONMENT=production-2026-11-08 npm run codegen`, then `npx gql.tada generate output`, then `npx prettier --write src/lib/datocms/cma-types.ts`.
**Files**: `schema.graphql`, `src/lib/datocms/graphql-env.d.ts`, `src/lib/datocms/cma-types.ts`
**Verified**: `npx tsc --noEmit` exits 0; `rg -c Translation schema.graphql src/lib/datocms/graphql-env.d.ts src/lib/datocms/cma-types.ts` finds nothing; `git diff --numstat schema.graphql src/lib/datocms/cma-types.ts` shows 0 added lines for `schema.graphql` and at most 1 for `cma-types.ts` (the union's `;` moves up), otherwise BLOCKED, because another schema change came along. **Done**: The committed types describe the sandbox.

### T5 — Remove the export script · depends on: T4

**What**: `git rm scripts/export-translations.ts`. In `package.json`, delete only the `export-translations` line of `scripts`; `tsx` stays. In `CLAUDE.md`, delete the `npm run export-translations` bullet (line 34) and, in the "No hardcoded UI strings" bullet (line 76), the sentence saying the DatoCMS `Translation` model is no longer read. Read the diff before committing.
**Files**: `scripts/export-translations.ts`, `package.json`, `CLAUDE.md`
**Verified**: `rg -i 'allTranslations|fetchTranslations|export-translations' src scripts package.json CLAUDE.md` finds nothing; `rg -n 'Translation. model' CLAUDE.md` finds nothing; `jq -e '.scripts.codegen' package.json` exits 0; `npx prettier --check package.json CLAUDE.md` passes. **Done**: Nothing in the code names the old pipeline.

## Order

Executors run only T1–T5. Every other step is the conductor's, in session with the owner. **STOP** means ask and wait; only the owner's own message counts as an ok.

1. Conductor, read-only: `environments:primary` prints `activities-01`; `vercel env ls | grep -c DATOCMS_ENVIRONMENT` prints 0 (if not, go to step 8's branch now, before any lockout).
2. T1 and T2, beside each other.
3. **STOP, maintenance on** (editors are locked out): `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms maintenance:on'`. It refuses if someone is editing; `--force` only if the owner says so. Then re-run T1's command: `diff 0`, otherwise T1's BLOCKED path.
4. T3. **STOP if it hits a plan limit**: freeing a sandbox is the owner's decision alone; otherwise abort.
5. T4, then T5.
6. Conductor, the gate, with `export DATOCMS_ENVIRONMENT=production-2026-11-08` in the same shell. Red means abort or fix; no promotion.
7. **STOP, promotion** (irreversible for the live schema; this ok also covers maintenance off): `./node_modules/.bin/dotenv -c -- bash -c 'DATOCMS_API_TOKEN="$DATOCMS_CMA_TOKEN" ./node_modules/.bin/datocms environments:promote production-2026-11-08'`. Then `environments:primary` prints `production-2026-11-08`, and `environments:list --json` still holds `activities-01` with `meta.primary` false and the 6 other sandboxes. Then `maintenance:off` with the same wrapper.
8. Conductor, environment check. Local: `sed -i '' 's/^DATOCMS_ENVIRONMENT=activities-01$/DATOCMS_ENVIRONMENT=/' .env.local`, and `grep -E '^DATOCMS_ENVIRONMENT=' .env.local` prints the empty assignment. Then the gate's last line, unexported: no diff. Done check: `schema:inspect --json | jq -e '[.[].itemType.api_key] | index("translation") == null'` exits 0. Vercel: `vercel env ls | grep -c DATOCMS_ENVIRONMENT` prints 0. If not 0, **STOP**: the owner reads its value in the Vercel dashboard. If it is `activities-01` or any stale name, the site is silently reading a frozen copy: the owner removes it (`vercel env rm DATOCMS_ENVIRONMENT --environment production`; without the flag the variable leaves every environment), and only a new deployment applies that, so step 10 is mandatory.
9. **STOP, cache invalidation** (the webhook does not fire on a promotion): `./node_modules/.bin/dotenv -c -- bash -c 'curl -sS -o /dev/null -w "%{http_code}\n" -X POST "https://www.acaciafirenze.com/api/invalidate-cache?token=$SECRET_API_TOKEN"'` prints 200. On 401, **STOP**: the local secret differs from production's, and the owner aligns it.
10. **STOP, merge to `main` and push**, which deploys. `vercel ls -e production` shows the new deployment Ready. If step 8 changed a variable, repeat step 9 afterwards.
11. Conductor, production check: in `bash`, `for p in 'en:Check availability' 'it:Disponibilità'; do curl -sSL "https://www.acaciafirenze.com/${p%%:*}" | grep -c ">${p##*:}<"; done` prints a number above 0 twice. Then by eye in `/en` and `/it`: home and an apartment detail show labels, no raw keys.

## Deviations from the mandate

- `CLAUDE.md:76` is corrected although the mandate names only line 34: it describes a model that will no longer exist.
- `npx gql.tada generate output` is added to the mandate's `npm run codegen`: without it `graphql-env.d.ts` keeps `allTranslations` and the Done search fails.
