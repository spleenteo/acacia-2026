# Pre-launch code review — Acacia Firenze

_Generated 2026-06-22 via multi-agent review workflow (76 agents): 8 code slices + 3 cross-cutting lenses (DRY, DatoCMS, perf) + dead-code discovery, with adversarial verification. 56 findings confirmed of 61 raw._

# Pre-launch review

Acacia Firenze (Next 16 App Router + DatoCMS). De-duplicated from ~55 raw findings + 4 discovery passes. Good news up front: **no P0 blockers** — nothing here will break the launch build or take the site down. The real pre-launch work is a cluster of bilingual-correctness bugs (English/Italian strings leaking across locales) and a systemic DatoCMS pagination-cap pattern that is latent today but fragile.

## P0 — fix before launch

**None.** No launch-blocking defects found. The build is green and all runtime data paths work at current content volumes.

## P1 — should fix soon

These are visible wrong-language bugs on a bilingual site — the most user-facing class of issue here. All low effort.

1. **Lightbox controls hardcoded Italian for all locales** — `src/components/Lightbox/index.tsx:142-146`. The shared YARL lightbox (used by ImageGallery/PhotoLightbox/WhatWeLove on EN and IT) passes fixed `Precedente/Successiva/Chiudi` aria-labels, so EN users get Italian Previous/Next/Close. Fix: it's already `'use client'` — use `useTranslations('gallery')` and add `gallery.previous/next/close` Translation records. Effort: low.

2. **ReviewsList formats dates as en-GB regardless of locale** — `src/components/ReviewsList/index.tsx:124-127, 180-183`. Hardcoded `toLocaleDateString('en-GB', …)` shows English month names ("January 2025") on `/it/` apartment pages. Fix: add a `locale` prop, thread it from the apartment-detail content component, and format via `Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', …)` — extract a shared `formatReviewDate(date, locale)` since GuestbookCard already does this correctly. Effort: low.

3. **CopyLinkButton aria-label/title hardcoded Italian only** — `src/components/Faq/CopyLinkButton.tsx:30-32`. `Link copiato`/`Copia link` are the accessible name on EN FAQ pages too. Fix: already `'use client'` — `useTranslations('faq')` + `faq.copyLink`/`faq.linkCopied` records. Effort: low.

4. **FaqCard "Explore" CTA hardcoded English on IT pages** — `src/components/Faq/FaqCard.tsx:21`. Server component with no locale awareness renders the English word "Explore" on the Italian FAQ index (a real wrong-language bug, not just a policy violation). Fix: pass a translated `cta` label from the async parent via `getTranslations`. Effort: low. _(Sibling `FaqSideNav.tsx:38` uses an inline `it ? 'Tutte le domande' : 'All questions'` ternary — correct text but bypasses the pipeline; convert it with `useTranslations` in the same pass.)_

5. **ApartmentDetailContent bed/bath/sleeps copy via inline locale ternaries** — `src/app/[locale]/florence/accommodations/[slug]/ApartmentDetailContent.tsx:166-235`. A code comment already flags it as provisional ("Move to DatoCMS Translation records once finalised"). Hand-rolled `beds === 1 ? 'bedroom' : 'bedrooms'` / `isIt ? 'posti letto' : 'sleeps'` etc. Fix: move to Translation records and use next-intl ICU plural (`{count, plural, one{…} other{…}}`) instead of `=== 1` ternaries. Effort: medium.

## P2 — post-launch / nice-to-have

### DatoCMS pagination caps (one systemic pattern — see "Repeated patterns" for the unified fix)

Every collection query either omits `first:` (silent default of 20) or hard-caps at `first: 100` with no pagination. **Verified live counts (env acacia-2026): apartment 35, district 13, mood 15, post 1, faq 33, guestbook 837 (480 with apartment) — so nothing is dropped today** except where the default-20 already bites prerendering. These are latent correctness bugs that bite silently as content grows. Listed individually for traceability; fix them as one sweep:

- **generateStaticParams omit `first:` → only 20 slugs prerendered** — `florence/accommodations/[slug]/page.tsx:200-212`, `florence/districts/[slug]/page.tsx:86-98`, `moods/[slug]/page.tsx:122-134`. `allApartments { slug }` defaults to 20; with 35 apartments, 15 are not prerendered (still render on-demand via `dynamicParams`, so not a 404 — just a cold-render miss). Blog already does `allPosts(first: 100)`, so this is an accidental omission. Fix: add `(first: 100)`. Effort: low.
- **Related-moods scan capped at `first: 20`** — `florence/accommodations/[slug]/page.tsx:170-187`. Inconsistent lower cap (every other `allMoods` uses `first: 100`); a mood past position 20 that links the apartment would silently drop from the related block. Fix: raise to `first: 100`, or better, filter server-side by apartment id. Effort: low/medium.
- **Category queries omit `first:`** — `blog/page.tsx:63` (`allBlogCategories`), `florence/accommodations/page.tsx:66` (`allApartmentCategories`). A 21st category silently disappears from the filter chips. Fix: add `first: 100`. Effort: low.
- **Magazine listing + static params capped at `first: 100`** — `blog/page.tsx:68`, `blog/[slug]/page.tsx:153`. Magazine is the model most likely to exceed 100. Fix: paginate via `_allPostsMeta { count }` loop. Effort: medium.
- **Sitemap caps all four collections at `first: 100`** — `src/app/sitemap.ts:10-35`. Once posts/moods cross 100, surplus records silently vanish from `sitemap.xml` (bad for an SEO-focused launch). Fix: paginate posts/moods at minimum, or add a `_allXMeta { count }` build-time guard. Effort: medium.
- **Search SEO-enrichment query omits `first:`** — `src/lib/datocms/siteSearch.ts:96-148` (5 `allX` selections). A search with >20 hits of one type loses descriptions/thumbnails on hits 21+ (search retrieves up to 100). Fix: add `first: 100` to each. Effort: low.
- **Guestbook listing `first: 100` relies on the 24-month window staying < 100** — `src/app/[locale]/guestbook/page.tsx:70-78` (window=70 of 100 today). Fix: paginate with `skip`, or add a build-time guard that warns near the cap. Effort: medium.

### Type-safety

- **`as` casts on already-typed fields** — `florence/accommodations/[slug]/page.tsx:232` (`apartment.category as { id?: string }` — `category` is non-nullable `ApartmentCategoryRecord!`, use `apartment.category.id`) and `:263-265` (`box.object as {…}[]` erases the discriminated union). Also `ApartmentDetailContent.tsx:341-344` (`fragment: item as never` silences the checker entirely). Fix: drop the casts; align InfoDetail's prop type with the query union. Effort: low.
- **`getFormatted(button: any)` + unchecked `as BetterLinkFormatted`** — `src/components/Button/index.tsx:36-41`. Silences all type checking on the link-resolution path; a renamed plugin payload compiles and fails at runtime. Fix: param `unknown` + a runtime type guard. Effort: low.
- **WidgetTitle re-declares `Tone` locally** — `src/components/WidgetTitle/index.tsx:4`. `WidgetLabel` already exports `Tone`; this copy can drift. Fix: `import WidgetLabel, { type Tone }` and delete the local union (WidgetList/WidgetItemList already import it). Effort: low.

### More hardcoded strings (policy violations; correct text per locale, so not wrong-language bugs — lower than P1)

- **InfoDetail "( … area)" English literals** — `src/components/InfoDetail/index.tsx:86-94`. Renders "Via X (Santo Spirito area)" on IT pages. Fix: ICU rich-text translation key. Effort: low.
- **BookingModal intro copy** in a per-locale `INTRO` object literal — `src/components/BookingModal/index.tsx:21-34` (comment admits "not yet in DatoCMS"). Fix: `booking` Translation section + `useTranslations`. Effort: medium.
- **Structured-text CtaBlogPost** `Leggi tutto`/`Read more`, `Dal blog`/`From the blog` ternaries — `src/components/StructuredText/StructuredTextBlocks.tsx:157-158`; and **FaqNodeContent** `In breve`/`In short` `:126`. Fix: resolve via `getTranslations` and pass into the renderer. Effort: low.
- **Modal close aria-label "Close"** hardcoded English — `src/components/Modal/index.tsx:52` (used site-wide incl. ReviewsList). Fix: translate via a `label` prop. (`FaqBreadcrumb:9` `aria-label="Breadcrumb"` is a borderline ARIA term — leave.) Effort: low.

### Correctness / anti-patterns

- **RelatedContent uses array index as React key** — `src/components/RelatedContent/index.tsx:36-37, 55-56`. Fragments already expose stable `id`. Fix: `key={readFragment(ApartmentCardFragment, apt).id}` (MoodDetailContent already does this). Effort: low.
- **Preview-links builds enable URL with un-encoded query params** — `src/app/api/preview-links/route.ts:59-68, 86`. `?redirect=${url}&token=${token}` without `encodeURIComponent`; fragile if a path ever contains a reserved char. Fix: `URLSearchParams` or `encodeURIComponent`. Effort: low.
- **Inconsistent `_status: published` filter** — present on `moods/page.tsx:65` and `blog/page.tsx:69-72`, absent on `accommodations`/`districts` listings. No prod impact (published token), but draft-preview behaves inconsistently for editors. Fix: pick one policy and apply uniformly. Effort: low.

### Perf

- **DistrictCardFragment over-fetches the entire gallery's responsiveImage** — `src/components/DistrictCard/fragment.ts:13-20`. Card/detail only read `gallery[0]` but the fragment pulls full srcset + blur-up for every image of all 13 districts. Fix: fetch only the cover image. Effort: medium.
- **Home page is a `'use client'` component receiving the full query incl. a 50-review pool** — `src/app/[locale]/HomeContent.tsx`. The 50-item `spotlightReviews` pool is serialized to the client to pick one. Fix: keep HomeContent a server component, do the spotlight pick on the server, push `'use client'` to the interactive leaves. Effort: medium.
- **FAQ alternate-locale trees fetched sequentially** — `src/app/[locale]/faq/[[...slug]]/page.tsx:217-221` and `:120-124`. Serial `await fetchFaqTree(l)` in a for-loop (extra round-trip per render). Fix: `Promise.all`. Effort: low.
- **VideoBlockFragment over-fetches `thumbnailUrl`** (never consumed) — `src/components/StructuredText/blocksFragment.ts:53`. Fix: drop it. Effort: low.

### Docs drift (no runtime defect)

- **global.css header comment + CLAUDE.md call rust the "primary action color", but `--color-primary` is blackberry `#48182f`** — `src/app/global.css:1-6`. Components consume `*-primary` (34× text-primary, 21× bg-primary) vs ~2× rust, so the real CTA/link color is blackberry. The inline palette comment (lines 36-48) is already correct. Fix: update the file-header comment and CLAUDE.md's Palette line; no CSS change. Effort: low.

## Repeated patterns / DRY opportunities

Concrete refactors that collapse the bulk of the duplicate findings:

1. **`first:` pagination sweep (one helper, ~10 query sites).** Add a shared `fetchAllPages(query, …)` (loop `skip`/`first: 100` driven by `_allXMeta { count }`) and route every collection query through it (generateStaticParams ×3, related-moods, both category queries, sitemap ×4, search enrichment ×5, blog listing, guestbook). Removes the entire "silent-cap" class in one place. The quick interim win is adding explicit `first: 100` everywhere so the cap is at least reviewable.

2. **Index/detail page boilerplate → 2 helpers (~400 lines removed).** Five index pages (accommodations, districts, moods, blog, guestbook) and ~9 detail/index `page.tsx` files repeat byte-identical scaffolding. Extract: (a) `makeIndexMetadata(route)` wrapping the `indexPage(filter:{slug:{eq}}){ _seoMetaTags }` query + `generateMetadata` body + `toNextMetadata` + `indexAlternates`; (b) `renderMaybeRealtime({ isDraft, Content, resolvedProps, query, variables, data })` encapsulating the identical `if (isDraftModeEnabled) <RealtimeWrapper …/> else <Content …/>` branch; (c) a shared `hero`+`description` index GraphQL fragment. Each page then becomes ~10 lines. CLAUDE.md explicitly wants these extractions.

3. **`assertLocale(raw): Locale` helper (69 `as Locale` casts removed).** Validate/narrow the route param once per page (`notFound()` on miss) and drop every inline `as Locale`. Single validation point + no unchecked widening. Best landed alongside refactor #2 so the cast lives in one helper.

4. **`staticParamsFromSlugs(query, pick)` helper** for the 4 near-identical `allSlugsQuery` + `generateStaticParams` blocks (folds into refactors #1 and #2). Keeps null-slug filtering consistent (only blog filters nulls today).

5. **`unwrapParagraph` → `src/lib/unwrapParagraph.ts`.** Copy-pasted verbatim in EditorialHero:41, Hero:22, SectionHeader:17.

6. **`usePrefersReducedMotion()` hook (+ optional `useTypewriter`/`<TypeCaret>`).** ReviewSpotlight uses a hook, SearchBox re-implements `matchMedia` inline — plus a duplicated typewriter + caret. Extract to `src/hooks` and reuse in both.

7. **FAQ answer fragments** — `src/components/Faq/answerFragment.ts:17-50` vs `:52-85` are byte-identical except the target type. Extract the shared `blocks {…}` / `links {…}` selections into named sub-fragments.

8. **`*List` widget wrappers** — AmenitiesList / ComfortsList / EssentialsList are structurally identical around `WidgetList`. Fragments stay separate (typing), but collapse the bodies (inline the `readFragment` map at the call site) and drop two of the three wrappers.

9. **`formatReviewDate(date, locale)`** shared by ReviewsList (P1 #2) and GuestbookCard.

## Cleanup — dead code & unused files

**Safe to delete (high confidence):**

- **Unused deps in `package.json`:** `serialize-error` (removed from `api/utils.ts` in security commit 3e01dff, entry left behind), `@datocms/rest-client-utils` (zero direct imports — `RawApiTypes` comes from `@datocms/cma-client`; stays transitively), `@types/jsdom` (orphaned — runtime `jsdom` isn't even installed; parsing uses `node-html-parser`).
- **Dead imports:** `HtmlContent` import in `ApartmentDetailContent.tsx:8`; `cookies` in `src/app/api/draft-mode/disable/route.ts:1` (use `import { draftMode }`).
- **Dead local code:** `siblingsOf` export in `src/lib/faq/faqTree.ts:144-149` (zero callers); unused `inputRef` in `src/components/SearchBox/index.tsx:71,95`; unused `locale` prop in `InfoDetail` (`:48,52` — or wire it up to fix the "( area)" bug, recommended).
- **`public/logo--main.svg`** — old header logo, replaced by text wordmark in commit 48134e6; zero refs in src. (Keep `placeholder-airbnb-superhost.svg` / `placeholder-booking-score.svg` — actively rendered in ReviewsList despite the name.)
- **`src/messages/en.json` / `it.json`** — confirmed NOT imported at runtime (runtime path is `fetchTranslations()` → DatoCMS CDA; only `scripts/export-translations.ts` references them, and it _writes_ them). Also stale (missing 8 live namespaces). Delete, or keep strictly as a regenerable reference — but don't trust them.
- **Dead CSS `@theme` tokens in `global.css`:** 9 pure dead color variants (`--color-dark-soft`, `--color-primary-soft`, `--color-primary-deep`, `--color-rust-hover`, `--color-rust-soft`, `--color-rust-deep`, `--color-sage-strong`, `--color-alert`, `--color-notice`), `--text-tag`, and 3 section-spacing tokens (`--spacing-section-x/-y/-y-lg`). Zero `var()` refs and zero generated utility usage.

**Delete-candidate (medium confidence):**

- **`scripts/_intro-to-description.mjs`** — one-off, already-run, undocumented CMA seed script, not wired to package.json. Lowest-value leftover.

**Keep (called out to prevent accidental removal):**

- `react-dom`, `postcss`, `tailwindcss`, `@tailwindcss/postcss` (framework/build-only peers — no app import is normal); all tooling devDeps (`@datocms/cli`, `dotenv-cli`, `tsx`, `parse5`, `datocms-html-to-structured-text`, lint/hooks/types).
- `scripts/faq/*.mjs` (01-07) — keep as the documented FAQ-migration audit trail (`docs/shaping/faq-slices.md`); future schema work goes through `migrations/`.
- `docs/pitches/demostyle.jsx` — design-system reference. **But fix the stale path in CLAUDE.md:90** which says `pitches/demostyle.jsx` (actual: `docs/pitches/demostyle.jsx`).
- `--color-slate`, `--color-border-strong`, `--text-tag` are named in CLAUDE.md as intended palette tokens — removing is a design decision even though currently unwired (update the doc if you drop them).
- **No leftover plumguide files** — `plumguide-design` is a global Claude skill outside the repo; the only "Plum Guide" hits are inspiration prose in `pitches/apartment-detail-redesign.md`.

## Top actions before launch

- **Fix the 5 P1 bilingual bugs** (Lightbox, ReviewsList dates, CopyLinkButton, FaqCard "Explore", apartment bed/bath/sleeps) — these are visible wrong-language defects on a bilingual launch; all low/medium effort.
- **Add explicit `first:` to every capped/uncapped collection query** (generateStaticParams ×3, related-moods, categories, sitemap, search enrichment) — quick interim fix; real fix is the shared `fetchAllPages` helper, but at minimum prerendering today is silently truncated to 20 with 35 apartments.
- **Land the `assertLocale` helper + the two page-boilerplate extractions** (`makeIndexMetadata`, `renderMaybeRealtime`) — removes ~400 lines and the highest-drift-risk copy-paste before more pages are added.
- **Do the safe deletions** (3 unused deps, dead imports, `logo--main.svg`, `src/messages/*.json`, ~13 dead CSS tokens, `siblingsOf`) — clean, zero-risk.
- **Sweep the remaining hardcoded strings** into the Translation model (InfoDetail, BookingModal, structured-text CTA, FaqNodeContent, Modal close) to satisfy the no-hardcoded-strings rule and make copy editor-editable.
- **Fix the docs drift** — CLAUDE.md palette (blackberry is the action color, not rust) and the `demostyle.jsx` path — so the launch reviewer and future contributors aren't misled.
