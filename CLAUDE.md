# CLAUDE.md

Guidance for Claude Code when working in this repository. It holds only what the code does not show on its own: constraints, gotchas and the reasons behind them, or where to look. Lists of files, components, routes or function names are deliberately absent — they drift; read the code.

IMPORTANT: for anything DatoCMS (schema, records, migrations) use the `datocms` CLI through its skills (`datocms:datocms-cli`, `datocms:datocms-cma`). Do not use the DatoCMS MCP while developing.

## Project

Acacia Firenze — Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS v4, DatoCMS as headless CMS, deployed on Vercel. Node 24 (`.nvmrc`). Bilingual EN/IT with locale-prefixed URLs (`/en/...`, `/it/...`).

## Documentation map

This file covers engineering only. Other knowledge lives elsewhere — load the right one instead of searching here:

| Need                                                      | Where                                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Users, purpose, positioning, product limits               | `PRODUCT.md`                                                                                                                  |
| Visual language: palette, type, shapes, components, rules | `DESIGN.md` + `.impeccable/design.json`                                                                                       |
| Design token values                                       | `@theme` in `src/app/global.css` (what ships; if `DESIGN.md` disagrees, report the drift)                                     |
| Active works, plans, decisions                            | `docs/work/` — `docs/work/archive/` is **denied to Claude** by `.claude/settings.json`; use the index `docs/work/archived.md` |
| Pre-launch checklist                                      | `docs/pre-launch-review.md`                                                                                                   |
| Creating a page with realtime draft preview               | project skill `realtime-page-pattern` (`.claude/skills/`)                                                                     |

For UI decisions `DESIGN.md` wins over this file; for product questions `PRODUCT.md` wins. Never copy palette values, type sizes or product claims into `CLAUDE.md` or `docs/` — they drift.

## Commands

Scripts are in `package.json`; the non-obvious ones:

- `npm run generate-schema` — refreshes `schema.graphql` from the CDA **of the environment in `DATOCMS_ENVIRONMENT`** (empty = primary). `src/lib/datocms/graphql-env.d.ts` is written by the gql.tada TS plugin configured in `tsconfig.json`; if it lags, `npx gql.tada generate output`. Run after any DatoCMS schema change.
- `npm run generate-cma-types` — regenerates `src/lib/datocms/cma-types.ts` (needs `DATOCMS_CMA_TOKEN`).
- `npm run codegen` = both of the above. **`prepare` runs `codegen` on every local `npm install`** (skipped when `VERCEL` or `CI` is set), so a fresh install needs a filled `.env.local`.
- `npm run lint` = `eslint . && prettier --check .`. Pre-commit runs Prettier on staged files (simple-git-hooks + lint-staged).
- `npm run export-translations` — the one-off dump that seeded `src/messages/*.json`, which are committed and maintained by hand. Do not re-run it after V1 is deployed: it would overwrite them.

## Data flow and caching

- Every read goes through `executeQuery()` in `src/lib/datocms/executeQuery.ts` (wraps `@datocms/cda-client`). Published content: `force-cache` + Next tag `datocms`; draft content: `no-store`. The comments in that file are the reference.
- A DatoCMS webhook hits `/api/invalidate-cache` and calls `revalidateTag('datocms')`. On Vercel the Data Cache **survives deploys**: a deploy alone does not refresh content — fire the webhook or purge manually. Static routes such as `sitemap.ts` are not purged by the tag either; the sitemap has `revalidate = 3600` for that reason.
- Two CDA tokens: `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` (published only, no preview access) and `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` (drafts, used only in Draft Mode). `DATOCMS_ENVIRONMENT` is applied to every CDA/CMA call, to codegen and to `baseEditingUrl`.
- Site Search (`/api/search` → `src/lib/datocms/siteSearch.ts`) uses the CMA token server-side only. The index is re-crawled daily by `.github/workflows/reindex-search.yml`, whose hard-coded index id must stay in sync with `DATOCMS_SITE_SEARCH_INDEX_ID`.

## GraphQL and types

- Build queries with `graphql()` from `@/lib/datocms/graphql` (gql.tada + DatoCMS custom scalars), never from `gql.tada` directly. `readFragment`, `FragmentOf`, `ResultOf` are re-exported from the same module.
- Fragments are colocated with the component that consumes them. **If the component is `'use client'`, put the fragment in a sibling `fragment.ts`** (e.g. `src/components/ApartmentCard/fragment.ts`): importing a fragment from a `'use client'` file into a server component breaks the gql.tada build ("j.definitions is not iterable").
- `src/lib/datocms/cma-types.ts` (datocms CLI) types CMA records in `recordInfo.ts` and `/api/seo-analysis`.
- Generated, never edit by hand: `schema.graphql`, `src/lib/datocms/graphql-env.d.ts`, `src/lib/datocms/cma-types.ts`.

## Page pattern

Each route has `page.tsx` (server: query, `generateMetadata`, `generateStaticParams`, draft/published switch) and a `*Content.tsx` presentational component. In Draft Mode `page.tsx` returns `<RealtimeWrapper>` (`src/lib/datocms/realtime/`) spread with `getDraftRealtimeOptions()`, so editors get live updates via `useQuerySubscription`; otherwise it renders the Content component directly. Follow the `realtime-page-pattern` skill when adding a page; never duplicate `RealtimeWrapper`.

Legacy text fields (apartment/district/home `description`, `abstract`, `claim`) are still queried with `markdown: true` and rendered by `<HtmlContent>`; newer models use Structured Text (`src/components/StructuredText*`).

## Draft Mode, Content Link and stega

- `/api/draft-mode/enable?token=…&redirect=/…` and `/api/draft-mode/disable`. Enable re-sets the `__prerender_bypass` cookie with `partitioned: true` so Draft Mode works inside the Web Previews iframe (`src/app/api/utils.ts`). The site CSP `frame-ancestors` in `next.config.mjs` must list the custom admin domain too.
- Web Previews plugin and Content Link: the plugin is configured in the DatoCMS UI, not in the repo. Its preview webhook is `{SITE_URL}/api/preview-links?token={SECRET_API_TOKEN}` and its draft-mode URL is `/api/draft-mode/enable?token=…`. `reloadPreviewOnRecordUpdate` is `false` on purpose: live updates come from the realtime subscription. `baseEditingUrl` automatically appends `/environments/{DATOCMS_ENVIRONMENT}` when set. `/api/seo-analysis` serves the SEO/Readability plugin.
- In Draft Mode the locale layout mounts `<ContentLink>` and `<DraftModeToggler>` and **does not load** Beddy, Iubenda or PostHog. There is no public "enable draft" button.
- `executeQuery` sets `contentLink: 'v1'` only for drafts: text fields (`title`, `description`, `abstract`, `claim`, `intro`, `subtitle`, `body`, structured-text values, asset `alt`…) then carry invisible stega metadata. Rendering it is safe; **any non-render use must go through `stripStega()`**: comparisons, `switch`, `.split`/`.replace`/regex, `.length`, `.toLowerCase()` lookups, `JSON.stringify` (JSON-LD via `<JsonLd>`, analytics), `<meta>`/`<title>`/OG built from raw fields, cache keys, anything persisted. Slug, JSON, boolean, number, date, color, lat/lon, SEO, file/gallery, link(s), modular content and `_seoMetaTags` never carry stega. Debug with `revealStega(value)` (`console.log` shows nothing).
- Import `react-datocms` from its subpaths (`react-datocms/stega`, `react-datocms/seo`, `react-datocms/use-query-subscription`), never from the barrel `'react-datocms'`: the barrel drags the Mux player into client bundles and broke visual editing.

## Locale routing

- Locales `en`/`it` in `src/i18n/config.ts`; routes live under `src/app/[locale]/`. `src/proxy.ts` (Next 16 replacement for `middleware`) handles prefix-less paths and localized segments; its comments are the spec. Two rules it enforces that are easy to break:
  - **The `acacia_locale` cookie is written only by a click on `<LocaleSwitcher>`.** The proxy renews an existing cookie (Safari caps JS-written cookies at 7 days) but never creates one. A visit must never decide the visitor's language.
  - Every page has one public URL per locale: non-localized variants (`/it/florence/...`, legacy `/blog`) are 301-redirected, then localized segments are rewritten to the English filesystem route.
- The segment map and every path helper live in `src/i18n/paths.ts`. Always build hrefs with those helpers — never hand-write `/it/firenze/...`. Note `blog` is public as `magazine` in both locales and `search` as `cerca` in IT.
- Index pages are records of the `index_page` collection selected by localized slug (`indexPageSlug`); legacy `index_*` singletons still resolve via `indexPaths` for old menu items. Adding a section: `pathSegments` → `modelPrefixes` (detail) / `indexPageRoutes` (index_page-backed) / `indexPaths` (legacy singleton), then `robots.ts` `SEARCH_DETAIL_BASES` and `sitemap.ts` if it must be crawled.
- Pages with per-locale slugs (mood, post, FAQ) cannot be switched by segment translation: they publish their alternate URLs through `AlternateLocaleProvider` and build hreflang with `localizedSlugPaths`.
- `src/lib/datocms/recordInfo.ts` maps CMA records to URLs for the Web Previews and SEO Analysis plugins, dispatching on model `api_key` (numeric item-type ids change across environment forks). FAQ URLs come from the tree (`src/lib/faq/faqTree.ts`), not from a single slug.

## UI translations (next-intl)

- No hardcoded UI strings except in `not-found.tsx`, `error.tsx` and `NotFoundScene` (no locale context there, copy is bilingual). Source of truth is `src/messages/en.json` and `it.json`, nested by section (`section.camelCaseKey`). The DatoCMS `Translation` model is no longer read: editing it has no effect.
- `src/i18n/request.ts` imports the JSON of the requested locale and feeds next-intl; the locale layout provides `NextIntlClientProvider`. `src/i18n/appConfig.ts` types the keys, so an unknown key or a key in one language only fails `tsc`; computed keys need a literal map (`as const satisfies`).
- Client components: `useTranslations('section')`; server components: `await getTranslations('section')` from `next-intl/server`. ICU placeholders: `t('key', { name })`. Sections are whatever `useTranslations('…')` calls exist in `src/` — grep before inventing a new one.
- New string: add the key to both JSON files, then `t('key')`. It ships with a deploy, no CMS and no webhook.

## Turbopack workaround

`useRouter()`, `usePathname()` and other `next/navigation` hooks that subscribe to router state throw "Cannot read properties of undefined (reading 'unsubscribe')" in this project. Use `window.location.pathname` (read through `useSyncExternalStore`, see `HomeLink`/`LocaleSwitcher`), `window.history.replaceState` instead of `router.push`, `window.location.assign()` for full navigations. `useSearchParams` works inside a `<Suspense>` boundary (`CategoryFilter`, `search/page.tsx`).

## Styling — build constraints

Tailwind CSS v4, tokens in `@theme` in `src/app/global.css`, PostCSS in `postcss.config.mjs`. The visual language is in `DESIGN.md`; only engineering constraints here:

- Use `@theme` (NOT `@theme inline`) so variables are emitted at `:root` and usable in `@layer base`.
- Font-size tokens use `--text-*` with `--text-*--line-height` companions (NOT `--font-size-*`).
- All base/reset CSS goes inside `@layer base` — unlayered CSS overrides `@layer utilities` regardless of specificity.
- Never set `color`, `font-family` or `font-weight` on `h1–h6` in base styles; use utility classes.
- Fonts load with `next/font/google` in `src/app/layout.tsx` (exposing `--font-fraunces` / `--font-lato`), NOT a CSS `@import`: Turbopack strips external `@import url()` and the fonts silently fell back to Georgia. Fraunces' `opsz`/`SOFT`/`WONK` axes must be requested via next/font `axes` or the `font-variation-settings` in CSS do nothing.
- Scroll-triggered `.in-view` comes from `InViewSection` (server) or `useInView` (`src/hooks/useInView.ts`, client).

## Environment variables

See `.env.local.example` for the full commented list. Non-obvious points:

- `DATOCMS_CMA_TOKEN` — runtime only reads (Site Search, seo-analysis): on Vercel use a read-only token; locally a write token is fine for `scripts/`, migrations and codegen.
- `SECRET_API_TOKEN` — guards `/api/invalidate-cache`, `/api/preview-links`, `/api/seo-analysis`, `/api/draft-mode/enable`; the same value is in the DatoCMS webhook URL and the Web Previews plugin config, so rotate all three together.
- `NEXT_PUBLIC_SITE_URL` — read once in `src/lib/siteUrl.ts` as `SITE_URL`; build absolute URLs from that constant, never re-read the env inline.
- `NEXT_PUBLIC_GA_ID` — GA4; analytics consent defaults to **granted** by owner decision (see `src/app/[locale]/layout.tsx`), do not flip it back as a "fix".
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `_HOST` — PostHog, off in Draft Mode, inside iframes and on any host other than the production one in `NEXT_PUBLIC_SITE_URL` (so localhost and Vercel previews never call it, whatever env vars they carry) (`src/components/PostHogAnalytics`). Custom events go through `trackEvent()` in `src/lib/analytics.ts` (GA4 + PostHog).

## SEO

- Each `page.tsx` exports `generateMetadata()` combining `_seoMetaTags` (`TagFragment` from `src/lib/datocms/commonFragments.ts`) with `toNextMetadata` from `react-datocms/seo`, plus `alternates` (canonical + hreflang + `x-default`) built with the helpers in `paths.ts`.
- Index pages backed by `index_page` (accommodations, districts, moods, blog, guestbook) delegate to `indexPageMetadata(canonicalRoute, params)` (`src/lib/datocms/indexPageMetadata.ts`) and share `IndexPageHeroFragment` (`src/components/EditorialHero/indexPageFragment.ts`). Pages with per-record alternates (mood, post, FAQ) build their own.
- JSON-LD goes through `<JsonLd>` with helpers in `src/lib/seo/jsonLd.ts`; every CMS string in it is `stripStega()`-cleaned first. `metadataBase` is set in `src/app/layout.tsx`; `sitemap.ts` and `robots.ts` cover both locales.

## Error pages

- `src/app/[locale]/not-found.tsx` and `src/app/not-found.tsx` both render `<NotFoundScene>` (bilingual). The root one is the only real-404 for unmatched URLs; the locale one catches `notFound()` and renders inside the locale layout. **Do not add a `loading.tsx` above the `[slug]` routes**: it turned missing records into soft 404s.
- `src/app/[locale]/error.tsx` (client) and `src/app/global-error.tsx` (reports to PostHog). None of these receive `params`, so the "back home" link is `<HomeLink>`, which reads the locale from the URL.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
