---
work: native-ui-messages
slice: V1
updated: 2026-11-08
description: 'V1 plan: next-intl reads typed JSON labels from src/messages instead of the DatoCMS Translation model'
---

# V1 plan — Le label vengono dai file del repo

**Mandate**: [slices.md, V1](slices.md) · **Guidelines**: [development-guidelines.md](../../../development-guidelines.md) · **Lessons**: none yet (first slice) · **Execution rules**: [executor.md](/Users/spleenteo/.claude/plugins/cache/flow/flow/facb0e621782/agents/executor.md), test level `none`
**Summary**: Dumps the published Translation records from `activities-01` into sorted, committed `src/messages/{en,it}.json`. Gives the two computed-key maps literal types. Switches `src/i18n/request.ts` to the JSON, then removes `fetchTranslations.ts` and the `noStore` option. Adds `AppConfig` typing and the en/it parity assertion, proving by mutation that both fail `tsc`. Last, corrects the documents the change makes false.
**Files**: `src/messages/en.json`, `src/messages/it.json`, `src/lib/search/searchType.ts`, `src/components/FilterBar/masonryFilters.ts`, `src/i18n/request.ts`, `src/lib/datocms/fetchTranslations.ts`, `src/lib/datocms/executeQuery.ts`, `src/i18n/appConfig.ts`, `CLAUDE.md`, `PRODUCT.md`, `docs/pre-launch-review.md`, `src/app/[locale]/florence/accommodations/[slug]/ApartmentDetailContent.tsx`, `src/components/BookingModal/index.tsx`

## The slice, decided here

- Facts read on 2026-11-08: `activities-01` is the primary; 134 published records per locale, no null or empty value, no key that is a prefix of another; every key used in the code, computed ones included, exists in the records. `tsc` should therefore go green with no text change.
- `scripts/export-translations.ts` stays untouched (V2). It reads one page of 500, enough for 134 records; the check below pages independently, so a truncated dump would fail it. Key order is made stable after the dump with `jq -S`, because the records arrive by `_updatedAt_DESC`.
- `request.ts` uses the dynamic `import()` of next-intl's documentation, which this repo already used before commit 595eda1: it loads only the requested language.
- Typing and parity live in one regular `.ts` file, not a `.d.ts`: `skipLibCheck: true` skips every `.d.ts`, so an assertion there would never fail. No `Locale` in `AppConfig`: the mandate asks only for `Messages`.
- The maps must be literal before `AppConfig` lands, or the four computed `t()` calls stop compiling: T2 precedes T5.
- At the close: the manual Done checks in dev, run by the conductor, in `/en` and `/it`: home, an apartment detail, `/search` with its result types, a mood detail and a district detail with their filters, `/guestbook`, and the `DraftModeToggler`, which appears only in Draft Mode (`/api/draft-mode/enable?token=<SECRET_API_TOKEN>&redirect=/en`). Just before deploying V1 the conductor re-runs T1's check; if it fails, it re-runs T1's commands and commits. After the deploy the dump never runs again, and labels are no longer edited on the CMS.

## Tasks

### T1 — Dump the published labels into `src/messages` · `critical`

**What**: Confirm the primary, create the folder, dump, sort, format. Stop with BLOCKED if the first command does not print `activities-01`. Never edit a value by hand.

```bash
./node_modules/.bin/dotenv -c -- bash -c 'npx datocms environments:primary --api-token "$DATOCMS_CMA_TOKEN"'
mkdir -p src/messages && DATOCMS_ENVIRONMENT=activities-01 npm run export-translations
for l in en it; do jq -S . src/messages/$l.json > src/messages/$l.tmp && mv src/messages/$l.tmp src/messages/$l.json; done; npx prettier --write src/messages/en.json src/messages/it.json
```

**Files**: `src/messages/en.json`, `src/messages/it.json`
**Verified**: This prints `en <n> ok` and `it <n> ok` with the same `<n>` and exits 0 (134 at planning time; any throw is a failure). Then `npx prettier --check src/messages` passes.

```bash
DATOCMS_ENVIRONMENT=activities-01 ./node_modules/.bin/dotenv -c -- node --input-type=module -e '
import fs from "fs"; const q = "query($l:SiteLocale!,$s:IntType!){allTranslations(first:500,skip:$s,locale:$l){key value}}";
const headers = {"Content-Type":"application/json",Authorization:"Bearer "+process.env.DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,"X-Exclude-Invalid":"true","X-Environment":process.env.DATOCMS_ENVIRONMENT};
const get = async (l) => { const rs=[]; for (let s=0;;s+=500) { const j = await (await fetch("https://graphql.datocms.com",{method:"POST",headers,body:JSON.stringify({query:q,variables:{l,s}})})).json(); if (j.errors) throw new Error(JSON.stringify(j.errors)); rs.push(...j.data.allTranslations); if (j.data.allTranslations.length<500) return rs; } };
const flat = (o,p="") => Object.entries(o).flatMap(([k,v]) => v && typeof v==="object" ? flat(v,p+k+".") : [[p+k,v]]); const keys = {};
for (const l of ["en","it"]) { const f = flat(JSON.parse(fs.readFileSync("src/messages/"+l+".json","utf8"))); const want = (await get(l)).map(r=>[r.key,r.value]).sort(([x],[y])=>x<y?-1:1);
  if (JSON.stringify(f)!==JSON.stringify(want)) throw new Error(l+" differs from the published records or is not sorted"); keys[l]=f.map(x=>x[0]).join(); console.log(l,f.length,"ok"); }
if (keys.en!==keys.it) throw new Error("en and it have different keys");'
```

**Done**: Both files are committed, sorted, and identical to the published records.
**Interfaces**: Produces the nested JSON files, one object per section (`nav`, `filters`, `search`…), consumed by T3 and T5.

### T2 — Give the computed-key maps literal types

**What**: In `src/lib/search/searchType.ts`, replace the annotation of `SEARCH_TYPE_LABEL_KEY` with `export const SEARCH_TYPE_LABEL_KEY = { … } as const satisfies Record<SearchResultType, string>;`. In `src/components/FilterBar/masonryFilters.ts`, do the same for `FILTER_KIND_TKEY` with `Record<CardKind, string>`. Object contents and comments do not change. No cast is added at the call sites.
**Files**: `src/lib/search/searchType.ts`, `src/components/FilterBar/masonryFilters.ts`
**Verified**: `npx tsc --noEmit` exits 0; `rg -c "as const satisfies" src/lib/search/searchType.ts src/components/FilterBar/masonryFilters.ts` prints 1 for each. **Done**: Indexing either map with its union yields a union of string literals.
**Interfaces**: Produces the literal key types that the calls in `SearchResults.tsx:151,178`, `MoodDetailContent.tsx:132` and `DistrictDetailContent.tsx:138` need once T5 lands.

### T3 — Load the labels from the JSON · `critical` · depends on: T1

**What**: In `src/i18n/request.ts`, remove the `fetchTranslations` import and set `messages` to the `.default` of a dynamic import of the template path `../messages/${validLocale}.json`, awaited. The locale fallback stays as it is.
**Files**: `src/i18n/request.ts`
**Verified**: `npx tsc --noEmit` exits 0; `rg -n "fetchTranslations" src/i18n/request.ts` finds nothing; `npm run build` exits 0; pick one value that exists only in `src/messages/it.json` and one only in `src/messages/en.json`, then `rg -l` each under `.next/server/chunks`: both are found and no file holds both, proving the two languages are in separate chunks. **Done**: No request reaches the CDA for labels.
**Interfaces**: Consumes T1's files. Produces a `src/` where `fetchTranslations` has no importer, for T4.

### T4 — Remove `fetchTranslations` and `noStore` · `critical` · depends on: T3

**What**: Delete `src/lib/datocms/fetchTranslations.ts`. In `src/lib/datocms/executeQuery.ts`, change the condition to `options?.includeDrafts ? { cache: 'no-store' } : { … }` and delete the `noStore` field with its JSDoc from `ExecuteQueryOptions`. Nothing else in that file changes.
**Files**: `src/lib/datocms/fetchTranslations.ts`, `src/lib/datocms/executeQuery.ts`
**Verified**: `npx tsc --noEmit` exits 0; `rg -n "noStore|fetchTranslations" src` finds nothing. **Done**: Published reads stay `force-cache` with the `datocms` tag, drafts `no-store`.

### T5 — Type the keys and assert en/it parity · `critical` · depends on: T1, T2, T4

**What**: Create `src/i18n/appConfig.ts` holding: `import type en from '@/messages/en.json';` and the same for `it`; the augmentation `declare module 'next-intl' { interface AppConfig { Messages: typeof en } }`; `type Extends<Sub extends Super, Super> = [Sub, Super];`; and `export type MessagesHaveSameKeys = [Extends<typeof en, typeof it>, Extends<typeof it, typeof en>];` under the comment "Fails `tsc` when a key exists in one language only. Not a .d.ts: `skipLibCheck` would skip it."
**Files**: `src/i18n/appConfig.ts`; temporary, altered or created by the Verified steps and restored or deleted by them: `src/i18n/keyCheck.tmp.ts`, `src/messages/en.json`, `src/messages/it.json`
**Verified**, in order, leaving no trace: (a) `npx tsc --noEmit` exits 0. (b) Create `src/i18n/keyCheck.tmp.ts` holding `import { getTranslations } from 'next-intl/server'; export const f = async () => (await getTranslations('nav'))('doesNotExist');`; `npx tsc --noEmit` reports an error in that file; delete it. (c) `jq '.nav.zzOnlyHere="x"' src/messages/it.json > src/messages/it.tmp && mv src/messages/it.tmp src/messages/it.json`; `npx tsc --noEmit` reports an error in `src/i18n/appConfig.ts`; `git restore src/messages/it.json`. (d) The same as (c) on `en.json`; `git restore src/messages/en.json`. (e) `npx tsc --noEmit` exits 0, `npx prettier --check src/i18n/appConfig.ts` passes, and `git status --short src` lists only `src/i18n/appConfig.ts`.
**Done**: An unknown key and a key in one language only each fail `tsc`.
**Interfaces**: Consumes T1's files and T2's literal maps. Produces `src/i18n/appConfig.ts`, named by T6.

### T6 — Correct the documents that became false · depends on: T4, T5

**What**: Match by content, because removals shift lines.

- `CLAUDE.md:34`: `export-translations` is the one-off dump that seeded `src/messages/*.json`, which are committed and maintained by hand; do not re-run it after V1 is deployed, it would overwrite them. `CLAUDE.md:38`: drop `or noStore: true`, leaving "draft content: `no-store`".
- `CLAUDE.md:76`: keep the hardcoded-strings exception; the source of truth is `src/messages/en.json` and `it.json`, nested by section (`section.camelCaseKey`); the DatoCMS `Translation` model is no longer read, so editing it has no effect. `CLAUDE.md:79`: new string: add the key to both JSON files, then `t('key')`; it ships with a deploy, no CMS and no webhook.
- `CLAUDE.md:77`: `src/i18n/request.ts` imports the JSON of the requested locale and feeds next-intl; the locale layout provides `NextIntlClientProvider`; `src/i18n/appConfig.ts` types the keys, so an unknown key or a key in one language only fails `tsc`, and computed keys need a literal map (`as const satisfies`).
- `PRODUCT.md:27`: every interface string comes from the repo's `src/messages/en.json` and `it.json` (EN/IT), none hardcoded in components. `ApartmentDetailContent.tsx:180`, comment: copy comes from `src/messages/*.json` (ICU plurals).
- `src/components/BookingModal/index.tsx:20`, comment: "Static intro copy (not yet in `src/messages/`)." `docs/pre-launch-review.md:21`, CopyLinkButton item: the fix targets `faq.copyLink`/`faq.linkCopied` keys in `src/messages/*.json`.
- `docs/pre-launch-review.md`: Lightbox item (17), add `gallery.previous/next/close` keys to `src/messages/{en,it}.json`. Bed/bath item (25), drop the quoted comment "Move to DatoCMS Translation records once finalised" (no longer in the code) and make the fix "move to `src/messages/*.json` with an ICU plural". BookingModal item (50), the fix becomes a `booking` section in `src/messages/*.json` + `useTranslations`. Delete the "Safe to delete" bullet on `src/messages/en.json` / `it.json` (101). In "Do the safe deletions" (120), remove `src/messages/*.json`. In "Sweep the remaining hardcoded strings" (121), target `src/messages/*.json` and drop "and make copy editor-editable".

**Files**: `CLAUDE.md`, `PRODUCT.md`, `docs/pre-launch-review.md`, `src/app/[locale]/florence/accommodations/[slug]/ApartmentDetailContent.tsx`, `src/components/BookingModal/index.tsx`
**Verified**: `rg -n "Translation.? (model|records?)|Translation section|fetchTranslations|noStore|editor-editable" PRODUCT.md docs/pre-launch-review.md "src/app/[locale]/florence/accommodations/[slug]/ApartmentDetailContent.tsx"` finds nothing; `rg -n "fetchTranslations|noStore" CLAUDE.md` finds nothing; `rg -n "faq.copyLink.*records|not yet in DatoCMS" docs/pre-launch-review.md src/components/BookingModal/index.tsx` finds nothing; `npx prettier --check` passes on the five files. **Done**: No listed document describes the CMS as the source of the labels.

## Order

T1 and T2 run beside each other (separate files). Then T3, T4, T5, T6 run one after another: T5 temporarily breaks the JSON files, so no other `tsc` may run beside it.

## Deviations from the mandate

- `CLAUDE.md:38` is corrected although the mandate's list omits it: it names `noStore: true`, which T4 removes.
- `docs/pre-launch-review.md:21` and the comment at `src/components/BookingModal/index.tsx:20` are corrected although the mandate's list omits them: both still name DatoCMS as where the copy goes.
