# Changelog

## v0.6.1 — 2026-03-22 — Runtime translations from CDA

Moved UI translations from static build-time JSON files to runtime CDA queries, so editors can update translated strings in DatoCMS without triggering a full rebuild.

- **Runtime fetch**: New `src/lib/datocms/fetchTranslations.ts` queries all Translation records from the CDA via `executeQuery`, converting dot-notation keys to nested objects for next-intl. Results are cached with the standard `datocms` cache tag.
- **Automatic invalidation**: When an editor publishes a Translation record, the existing cache invalidation webhook (`/api/invalidate-cache`) refreshes translations along with all other content — no rebuild needed.
- **request.ts rewrite**: `src/i18n/request.ts` now calls `fetchTranslations(locale)` instead of importing static `src/messages/*.json` files.
- **Legacy script retained**: `npm run export-translations` still works for debugging or generating reference JSON, but is no longer in the critical path.

---

## v0.6.0 — 2026-03-21 — Localized URL path segments per locale

Translated URL path segments so Italian users see native paths (`/it/firenze/appartamenti/abaco`) while English paths remain unchanged (`/en/florence/accommodations/abaco`). The filesystem route structure stays in English — middleware rewrites handle the translation transparently.

- **Path translation module**: New `src/i18n/paths.ts` — bidirectional segment map (`florence` ↔ `firenze`, `accommodations` ↔ `appartamenti`, `districts` ↔ `quartieri`). Exports `localizedPath()`, `canonicalPath()`, and `modelPath()`.
- **Middleware rewrite**: Updated `src/middleware.ts` to intercept translated paths (e.g. `/it/firenze/appartamenti/abaco`) and rewrite them internally to canonical filesystem paths (`/it/florence/accommodations/abaco`). Browser URL stays translated.
- **Singleton index models**: `modelPath()` supports singleton CMS models (`index_apartment`, `page_districts`, `page_moods`) with hardcoded canonical paths — the better-linking plugin requires a slug to link records, but these slugs are ignored in URL generation.
- **Component links**: All components generating record links (`ApartmentCard`, `DistrictCard`, `MoodCard`, `DistrictLink`, `Button`, `SiteHeader`, `SiteFooter`, `InfoDetail`) now use `modelPath()` or `localizedPath()` instead of hardcoded English segments.
- **SEO metadata**: All page `generateMetadata()` functions produce locale-aware `canonical` and `alternates.languages` URLs with translated segments.
- **Sitemap**: `src/app/sitemap.ts` generates URLs with translated path segments per locale.
- **recordInfo.ts**: Refactored `recordToWebsiteRoute()` to use `modelPath()`. Removed `recordSlugToPath()` (replaced by `modelPath`).
- **Button tertiary style**: Improved vertical alignment (`py-3.5`) and visibility (`text-dark/70`, `decoration-dark/30`) for dark-mode tertiary buttons.

### Adding a new translated section

To add a new section with translated paths:

1. Add the segment translation to `pathSegments` in `src/i18n/paths.ts`
2. Add the model prefix to `modelPrefixes` (for detail records) or `indexPaths` (for singleton index pages)
3. Components and metadata will automatically pick up the translation via `modelPath()` / `localizedPath()`

---

## v0.5.1 — 2026-03-20 — Beddy widget default dates

Pre-populate the Beddy booking widget with arrival = today+3 and departure = today+5 to reflect the minimum booking lead time.

- **Default dates**: BeddyBar now sets arrival to today+3 and departure to today+5 via Angular's internal form API, discovered through DOM inspection of the minified Angular bundle.
- **Implementation**: Polls every 500ms (max 10s) for Angular initialization, then calls `form.get('trip').setValue(...)` + `changeDetectorRef.detectChanges()` + `updateTripPreview()`. Falls back silently if the widget isn't loaded (e.g. draft mode).
- **Scope**: Applies to all BeddyBar instances (home page and apartment detail).

Design decision: Beddy exposes no documented HTML attributes for date pre-population. The approach uses undocumented Angular internals (`ngElementStrategy.componentRef`) and may break on Beddy bundle updates — worth monitoring.

---

## v0.5.0 — 2026-03-20 — SectionHeader component, CMS-driven section headers

Introduced a reusable `SectionHeader` component backed by a `SectionHeaderRecord` block in DatoCMS. Home page section headers (featured apartments, moods) are now fully editable from the CMS with no hardcoded strings.

- **SectionHeader component**: New `src/components/SectionHeader/index.tsx` — renders `label` (eyebrow), `title` (h2, HTML with em support), `subtitle` (plain text). Colocated `SectionHeaderFragment` on `SectionHeaderRecord`.
- **Em emphasis in section titles**: `<em>` inside `.section-title` headings renders in rust color, italic, with a semi-transparent rust underline (`text-decoration-thickness: 1.5px`, `text-underline-offset: 6px`). Scoped to `.section-title` in `@layer base`.
- **highlightsHeader**: Home page featured apartments section replaced `promoLabel/promoTitle/promoSubtitle` (flat fields) with a `SectionHeaderRecord` block linked as `highlightsHeader`. Title rendered as HTML via `title(markdown: true)`.
- **moodsHeader**: Moods section replaced the hardcoded `moodsTitle` + locale-conditional eyebrow strings with a `moodsHeader` SectionHeaderRecord block.
- **highlightedApartments**: Featured apartments section now uses `homePage.highlightedApartments` (explicit CMS selection) instead of querying `allApartments(first: 100)`.
- **Schema cleanup**: Removed obsolete `promo`, `promoLabel`, `promoTitle`, `promoSubtitle` fields after CMS deletion. Regenerated `schema.graphql` and `graphql-env.d.ts`.

Design decision: `title` is queried with `markdown: true` and stripped of its `<p>` wrapper via `unwrapParagraph()` before injection into the `<h2>` — avoids block-level nesting inside a heading while preserving inline `<em>` markup.

---

## v0.4.2 — 2026-03-18 — Simplify realtime pattern to 2 files per page

Replaced per-page `*Realtime.tsx` and `*Query.ts` files with a single shared `RealtimeWrapper` client component. Queries are now inline in `page.tsx`.

- **RealtimeWrapper**: Single generic `'use client'` component at `src/lib/datocms/realtime/RealtimeWrapper.tsx` — receives query, token, and data as props from the server component. Eliminates the need for per-page client wrappers.
- **File reduction**: From 4 files per page (Query, Content, Realtime, page) to 2 (page.tsx + Content.tsx). Deleted 17 files total (7 Realtime, 8 Query, 2 helper generators).
- **Realtime page pattern skill**: Added `.claude/skills/realtime-page-pattern/` with templates and rules for creating new pages with this pattern.

Design decision: `Variables` type in `RealtimeWrapper` uses `any` because type safety is enforced at the call site in the server component, where gql.tada already types the query and variables correctly.

---

## v0.4.1 — 2026-03-18 — Apartment schema alignment, APE field, gallery 6-up

Aligned frontend with updated DatoCMS apartment schema and added new features.

- **highlight → houseBadge.label**: Replaced the `highlight` string field with a linked `HouseBadge` record. The badge label is localized and displayed in both ApartmentCard and BookingSidebar.
- **boxImage removed**: ApartmentCard now uses `featuredImage` exclusively — the `boxImage` fallback has been removed.
- **APE field**: New `apartment.ape` field displayed alongside CIN in the apartment detail body (after comforts, muted style). Values migrated from infoDetail text blocks via CMA script, APE blocks then removed from infoDetail in both EN and IT locales.
- **What We Love 6-photo grid**: Gallery now supports up to 6 photos with a responsive 3×2 grid layout (SixUp component).
- **lint-staged**: Pre-commit hook now uses lint-staged to format only staged files, preventing unrelated Prettier changes on unstaged files.

---

## v0.4.0 — 2026-03-18 — Web Previews, Visual Editing, Real-Time Draft Preview

Full DatoCMS editorial workflow integration. Editors can now preview draft content from the CMS sidebar, use the Visual Editing tab with click-to-edit overlays, and see content updates in real-time without page reload.

- **Web Previews plugin**: Configured in DatoCMS with preview webhook (`/api/preview-links`) and draft mode URL. Sidebar shows Draft/Published preview links for Apartment, District, and Mood records.
- **Visual Editing tab**: Full-screen iframe preview inside DatoCMS with Content Link overlays. Click any text to open the corresponding field in the editor side panel.
- **Real-time draft updates**: All 7 pages converted to use `useQuerySubscription` (SSE) in draft mode. Editors see content changes live as they type, without page reload. Published mode unchanged (static with cache).
- **Realtime architecture**: New `src/lib/datocms/realtime/` helpers — `generatePageComponent` (server) and `generateRealtimeComponent` (client). Each page split into query, ContentComponent, and RealtimeComponent. Detail pages use manual pattern for `notFound()` support and multiple queries.
- **Draft mode cache bypass**: Switched from `force-cache` to `no-store` for CDA requests when `includeDrafts` is true, ensuring fresh content on every request.
- **Beddy widget disabled in draft mode**: CDN script not loaded when draft mode is active — the booking widget caused infinite loading in the Visual Editing iframe.
- **Environment-aware baseEditingUrl**: `executeQuery` auto-appends `/environments/{name}` to `DATOCMS_BASE_EDITING_URL` when `DATOCMS_ENVIRONMENT` is set.
- **Removed published boolean filter**: Stripped `published: { eq: true }` from all Mood and Guestbook queries — DatoCMS native draft/published status system used instead.
- **Preview reload on save**: Draft preview links include `reloadPreviewOnRecordUpdate` with 500ms delay for sidebar auto-refresh.

Design decision: only the main query per page is subscribed to real-time updates. Secondary queries (reviews, similar apartments, related moods) are fetched server-side and passed via props — sufficient because editors typically edit the current record.

---

## v0.3.0 — 2026-03-14 — Frontend restyle phase 1: Hero, Navigation, Cards

First implementation sprint of the frontend restyle shaping doc — Hero component, scroll-aware navigation with mobile overlay, and editorial card redesign across all three card types.

- **Hero component**: New `src/components/Hero/index.tsx` — full-viewport (`88svh`), double gradient overlay (top protects nav, bottom protects title), Playfair title with `<em>` support via `dangerouslySetInnerHTML`, CTA slots, children slot for BeddyBar, safe-area bottom padding.
- **Layout offset system**: `--header-height: 68px` CSS custom property in `:root`; locale layout applies `pt-[var(--header-height)]` to `<main>`; Hero and all inline page heroes apply `marginTop: calc(var(--header-height) * -1)` to slide under the fixed nav.
- **SiteHeader redesign**: Converted to client component with scroll-aware state — transparent with frosted-glass dark effect (`bg-dark/20 backdrop-blur-sm`) at top, cream `bg-surface/95` on scroll. SVG logo (`/logo--main.svg`) switches filter on scroll. Mobile full-screen dark overlay with Playfair mega links, stagger animation, and body scroll lock.
- **Font update**: Body font changed from DM Sans to Lato (300/400/700 weights). Playfair Display reduced to 400/500 weights only — always `font-normal` everywhere, never bold or semibold.
- **Card redesign**: All three cards (ApartmentCard, MoodCard, DistrictCard) redesigned to portrait 3:4 (`w:600 h:800` imgix crop). Removed card background (text fuses with page), shadow only on hover, border-radius reduced to `rounded-sm`. Removed hardcoded pill tags, "Scopri →" links, and claim from ApartmentCard. MoodCard claim hidden on desktop, revealed on hover (`md:opacity-0 → md:group-hover:opacity-100`), always visible on mobile.
- **Prose styles**: Added `.prose-acacia` component in `global.css` — guarantees readable text for DatoCMS HTML content regardless of Tailwind class scanning. Sets explicit color/weight on `p`, `strong`, `a`, `ul/li`, headings.
- **Section headers**: Removed uppercase from card metadata (category label). Uppercase retained only for section eyebrow labels (`.text-label` pattern).

Design decision: `overflow-hidden` scoped to the image wrapper only (not the `article`) — required for the MoodCard claim hover `translate-y` reveal to work without being clipped.

---

## v0.2.0 — 2026-03-14 — Rinascimento Moderno design system

Applied the "Rinascimento Moderno" design system across the entire frontend, replacing the original Acacia brand tokens with a refined editorial aesthetic.

- **New typography**: Switched from Source Sans Pro + Lato + Cormorant Garamond to Playfair Display (headings) + DM Sans (body), with a complete font-size scale from `text-hero` (56px) down to `text-fine` (11px).
- **New color palette**: Replaced the old primary/secondary/cream palette with warm rust accent (#D0512A), cream surface progression (surface/surface-alt/surface-warm), and warm dark (#2E2822, never pure black).
- **Design tokens**: Migrated from `@theme inline` to `@theme` with comprehensive tokens for shadows, border-radius, spacing, and paired line-heights for all font sizes.
- **Component styling**: Updated all 12 components (SiteHeader, SiteFooter, ApartmentCard, MoodCard, DistrictCard, CategoryFilter, CuddlesList, UpsList, InfoDetail, DistrictLink, ImageGallery, HtmlContent) with new Tailwind classes.
- **Page layouts**: Restyled all pages (home, accommodations listing/detail, districts listing/detail, moods listing/detail, error, loading, not-found) to match the editorial design language.
- **Editorial pattern**: Section headings use `<em>` for italic emphasis on key words; section labels use uppercase tracking with rust color.
- **Card pattern**: Consistent `rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-1` with image zoom and rust tag pills.

Design decision: chose `@theme` (without `inline`) so CSS variables are emitted at `:root` and accessible within `@layer base` rules — required for Tailwind v4 base style overrides.

---

## v0.1.0 — Initial release

Next.js 16 App Router website with DatoCMS integration. All core sections implemented: Home, Apartments (listing + detail), Districts (listing + detail), Moods (listing + detail). Bilingual EN/IT routing, Draft Mode, cache invalidation, SEO, Beddy booking widget integration.

---
