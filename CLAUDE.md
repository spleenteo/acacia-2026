# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

IMPORTANT: always use DatoCMS CLI plugin with SKILLS
Dont use the DatoCMS MCP when developing.

## Project Overview

Acacia Firenze — Next.js 16 (App Router) website integrated with DatoCMS as headless CMS. Uses React 19, TypeScript (strict mode), Tailwind CSS v4, and deploys to Vercel. Node 25 required (see .nvmrc). Bilingual site (EN/IT) with locale-prefixed URLs (`/en/...`, `/it/...`).

## Commands

```bash
npm run dev                # Start dev server
npm run build              # Production build
npm run lint               # ESLint + Prettier check
npm run format             # Auto-format with Prettier
npm run generate-schema    # Regenerate GraphQL schema + introspection types from DatoCMS
npm run generate-cma-types # Regenerate CMA types (requires DATOCMS_CMA_TOKEN)
npm run export-translations # Export DatoCMS Translation records to src/messages/*.json
```

Pre-commit hook runs `npm run format` automatically via simple-git-hooks.

## Architecture

### Data Flow

All content comes from DatoCMS via its GraphQL Content Delivery API. The central data-fetching function is `src/lib/datocms/executeQuery.ts`, which wraps `@datocms/cda-client` with Next.js cache integration (force-cache + `datocms` cache tag). Cache is invalidated by a DatoCMS webhook hitting `/api/invalidate-cache`.

Two CDA tokens control what content is returned:

- `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` — published content for production
- `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` — draft content with stega-encoded metadata for click-to-edit overlays

### GraphQL Type Safety

Two type generation systems work together:

- **gql.tada** — compile-time type safety for CDA GraphQL queries. Schema lives in `schema.graphql` (auto-generated via `gql.tada generate schema`). The TypeScript plugin in `tsconfig.json` reads it for editor inference. `gql.tada generate output` produces `graphql-env.d.ts` for build-time checks. After any DatoCMS schema change, run `npm run generate-schema`.
- **@datocms/cli** — generates `src/lib/datocms/cma-types.ts` with typed CMA record definitions used in `recordInfo.ts` for record-to-URL mapping.

### Key Patterns

**Fragment colocation**: GraphQL fragments are defined in the same file as the component that consumes them (e.g., `ResponsiveImageFragment` in `src/components/ResponsiveImage/index.tsx`). Components receive data typed as `FragmentOf<typeof SomeFragment>`.

**Draft mode**: Next.js Draft Mode is toggled via `/api/draft-mode/enable` and `/api/draft-mode/disable`. When active, pages use the draft CDA token and enable content-link click-to-edit overlays.

**Record routing**: `src/lib/datocms/recordInfo.ts` maps DatoCMS item types to frontend URLs via `modelPath()` from `src/i18n/paths.ts`. Used by Web Previews and SEO Analysis plugins. Handles both detail records (with slug) and singleton index models (fixed path, slug ignored).

**Locale routing**: App Router uses a `[locale]` dynamic segment (`src/app/[locale]/`). Supported locales are `en` and `it`, configured in `src/i18n/config.ts`. The root layout (`src/app/layout.tsx`) provides `<html lang>` dynamically from params; the locale layout adds header, footer, Beddy script, and draft mode controls. `proxy.ts` (the Next.js 16 replacement for the deprecated `middleware` convention) redirects paths without locale prefix to `/en` and rewrites translated path segments to canonical filesystem paths.

**Localized path segments**: URL path segments are translated per locale (`florence` → `firenze`, `accommodations` → `appartamenti`, `districts` → `quartieri`). The translation map and utilities live in `src/i18n/paths.ts`. The proxy rewrites incoming translated paths to canonical (English) filesystem routes. All components use `modelPath()` or `localizedPath()` to generate locale-aware hrefs. To add a new translated section: add the segment to `pathSegments`, then add the model to `modelPrefixes` (detail) or `indexPaths` (singleton) in `paths.ts`.

**Mood apartments (union type)**: Moods link to apartments via `boxes` → `MoodItemsRecord[]` → `object` (union: `ApartmentRecord | PostRecord | ServiceRecord | TipRecord`). Apartments are extracted inline with `__typename === 'ApartmentRecord'` filtering.

**HTML content from DatoCMS**: Legacy text fields (description, abstract, claim) are queried with `markdown: true` and rendered via the `<HtmlContent>` component (`dangerouslySetInnerHTML`). This will be replaced with a Structured Text renderer when DatoCMS schema migrates.

**Stega encoding & `stripStega`**: In draft mode, the CDA wrapper sets `contentLink: 'v1'`, which embeds invisible stega-encoded metadata into text fields (`title`, `description`, `abstract`, `claim`, `intro`, `subtitle`, `body`, structured-text values, asset `alt`, etc.). This is what powers Content Link click-to-edit overlays. Stega is **safe to render directly** (the encoding is zero-width Unicode that survives intact), but **NOT safe outside the render path**. Wrap any value crossing into non-render logic with `stripStega()` from `react-datocms`:

- ✅ Safe as-is: `<h1>{title}</h1>`, `dangerouslySetInnerHTML={{ __html: description }}`, slug fields (slug type never carries stega), dates/JSON/numbers/booleans
- ❌ Must `stripStega()`: string comparisons (`title === 'X'`, `.includes()`, `switch`), `.split`/`.replace`/regex, `JSON.stringify` to analytics or third-party APIs, `<meta>`/`<title>`/OG tags built from raw text fields, JSON-LD, cache keys, `length` checks, anything persisted

Field types that **never** carry stega and don't need stripping: slug, JSON, boolean, integer, float, date/datetime, color, lat/lon, SEO, video, file, gallery, link, links, modular content, single block. SEO meta tags coming from `_seoMetaTags` are also clean.

Debug stega-related bugs with `revealStega(value)` from `react-datocms` — `console.log` shows nothing (encoding is invisible), but `revealStega` rewrites it as visible `[STEGA:/editor/...]` markers, preserving object/array shape.

**Fragment separation for client components**: When a GraphQL fragment is defined in a `'use client'` file but needs to be imported in server components, extract it to a separate `.ts` file (e.g., `ImageGallery/fragment.ts`). Importing from `'use client'` files in server components causes gql.tada build errors ("j.definitions is not iterable").

**UI Translations (next-intl)**: All user-facing UI strings are managed via the DatoCMS `Translation` model and consumed at runtime through `next-intl`. **No hardcoded strings** — every label, button text, section heading, or CTA must use a translation key.

- **Source of truth**: DatoCMS `Translation` model with fields `key` (string, unique, format `section.camelCaseKey`) and `value` (string, localized EN/IT).
- **Runtime fetch**: `src/lib/datocms/fetchTranslations.ts` queries all Translation records from the CDA at runtime via `executeQuery`, benefiting from Next.js Data Cache (tagged `datocms`). When an editor modifies a translation in DatoCMS, the existing cache invalidation webhook automatically refreshes translations — no rebuild needed. The static `src/messages/*.json` files have been removed (they were stale and unused at runtime); `npm run export-translations` regenerates them on demand for reference/debugging only.
- **Configuration**: `src/i18n/request.ts` configures next-intl by calling `fetchTranslations(locale)`; `next.config.mjs` wraps with `createNextIntlPlugin`. The locale layout (`src/app/[locale]/layout.tsx`) provides `NextIntlClientProvider` with all messages.
- **Client components** (`'use client'`): use `useTranslations('section')` hook → `t('keyName')`.
- **Server components** (async): use `const t = await getTranslations('section')` from `next-intl/server` → `t('keyName')`.
- **ICU interpolation**: use `{placeholder}` in the value, call `t('key', { placeholder: value })`. Example: `listing.exploreDistrict` = `"Explore {name}"` → `t('exploreDistrict', { name })`.
- **Key naming convention**: dot-notation `section.camelCaseKey`. Sections: `nav`, `footer`, `listing`, `districts`, `moods`, `district`, `apartment`, `gallery`. The `key` field on DatoCMS validates with `/^[a-zA-Z][a-zA-Z0-9_.]*$/`.
- **Adding a new translated string**: (1) create a Translation record in DatoCMS with key + EN/IT values, (2) publish it, (3) the cache invalidation webhook will automatically refresh translations, (4) use `t('section.key')` in the component.
- **Files not using translations**: `not-found.tsx` and `error.tsx` keep bilingual inline strings (no locale context available).
- **Legacy export script**: `npm run export-translations` regenerates the on-demand static JSON files (`src/messages/en.json`, `src/messages/it.json`) as a reference or debugging aid; they are not committed and not used at runtime.

**Turbopack workaround**: Next.js 16 Turbopack has a bug where `useRouter()`, `usePathname()`, and other `next/navigation` hooks that subscribe to router state cause "Cannot read properties of undefined (reading 'unsubscribe')" errors. Use `window.history.replaceState` instead of `router.push`, `window.location.pathname` instead of `usePathname()`, and `window.location.assign()` for full navigation. `useSearchParams` works when wrapped in a Suspense boundary.

### Styling — "Japan Fish" Editorial Design System

> Re-skinned from the original "Rinascimento Moderno" (warm cream + Cormorant) to a light, editorial language: navy ground, warm-cool "Japan Fish" palette, Fraunces display serif. The token NAMES were kept and only their VALUES swapped, so every component re-themed automatically.

Tailwind CSS v4 with `@theme` (NOT `@theme inline`) design tokens in `src/app/global.css`. Full design system reference: `docs/pitches/demostyle.jsx`.

**Critical Tailwind v4 rules:**

- Use `@theme` (without `inline`) so variables are emitted at `:root` and accessible in `@layer base`
- Font-size tokens use `--text-*` namespace with `--text-*--line-height` companions (NOT `--font-size-*`)
- All base/reset CSS must be inside `@layer base` — unlayered CSS overrides `@layer utilities` regardless of specificity
- Never set `color`, `font-family`, or `font-weight` on `h1–h6` in base styles — use Tailwind utility classes

**Palette ("Japan Fish"):** **Blackberry** `#48182F` (`primary`) is THE action colour — CTAs/links/focus (hover `#381325`, pale `#EFE2E9`); warm **rust** `#D53302` (`rust`/`rust-pale`) is a secondary accent kept for specific touches. Support hues gold `#FFAA4D` (with `gold-soft` `#FFC680` hover) / sage `#A0CBAD` / slate `#8FB1BE`. Surfaces: white `surface` #FFFFFF / sage-tint `surface-alt` #EAF2F1 / warm sand `surface-warm` #FBF3E3. Deep **navy** ground `#00012A` (`dark`/`body`/dark sections, never pure black); muted text `#4C5168`. Hairline border `#DCE6E6`; crisp navy border via `border-strong`. Text selection is sage-on-navy; structured-text `<mark>` highlight uses `rust-pale`.

**Typography:** Fraunces (`font-heading`) for all headings — a free high-contrast "old style" serif (SIL OFL) standing in for Domaine Display, pinned to its sharp cut via `font-variation-settings: 'opsz' 144, 'SOFT' 0, 'WONK' 0` on h1–h6 + `.font-heading` (WONK 0 removes the playful quirks). Lato (`font-body`) for body/UI. **Fonts are loaded with `next/font/google` in `src/app/layout.tsx`** (self-hosted, exposing `--font-fraunces` / `--font-lato`), NOT a CSS `@import` — Turbopack strips external `@import url()` from the compiled stylesheet, so webfonts silently fell back to Georgia. Fraunces' `opsz`/`SOFT`/`WONK` axes are requested via next/font's `axes` so the variation-settings actually apply. Body scale is bumped up one step from the source demo: `text-hero` (56px), `text-h1` (42px), `text-h2` (36px), `text-h3` (24px), `text-h4` (18px), `text-body-lg` (19px), `text-body` (17px), `text-body-sm` (15px), `text-caption` (13.5px), `text-label` (12px), `text-tag` (10px), `text-fine` (11px).

**Editorial pattern:** Section/hero headings use `<em>` for emphasis on one key word — rendered as the **italic Fraunces cut in rust** with a thin underline that wipes in on scroll (`em::after`, scaleX, triggered via `.in-view`). Use `InViewSection` wrapper (server components) or `useInView` hook (client components) to trigger it. Section labels / card kickers: `text-label uppercase tracking-[0.18em–0.22em] text-muted/text-rust font-medium`.

**Cards:** crisp `radius-card` 4px, portrait 3:4 image (`overflow-hidden rounded-sm`), uppercase kicker + serif title that shifts to rust on `group-hover`, image zoom `scale-[1.03]`, restrained navy-tinted `shadow-card-hover`. PostCSS configured in `postcss.config.mjs`.

### Components

| Component              | Path                                      | Purpose                                                                                       |
| ---------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SiteHeader`           | `src/components/SiteHeader/`              | Navigation with locale switcher, primary bg                                                   |
| `SiteFooter`           | `src/components/SiteFooter/`              | Two-band footer (sage `surface-alt` + navy)                                                   |
| `BeddyBar`             | `src/components/BeddyBar/`                | Wrapper for `<beddy-bar>` web component (booking widget)                                      |
| `HtmlContent`          | `src/components/HtmlContent/`             | Renders legacy HTML from DatoCMS text fields                                                  |
| `ApartmentCard`        | `src/components/ApartmentCard/`           | Apartment card with colocated GraphQL fragment                                                |
| `MoodCard`             | `src/components/MoodCard/`                | Mood card with colocated GraphQL fragment                                                     |
| `DistrictCard`         | `src/components/DistrictCard/`            | District card with colocated GraphQL fragment                                                 |
| `GalleryImageFragment` | `src/components/ImageGallery/fragment.ts` | Shared gallery-image fragment (district masonry + WhatWeLove); the grid component was removed |
| `CategoryFilter`       | `src/components/CategoryFilter/`          | Client component for apartment category filtering                                             |
| `CuddlesList`          | `src/components/CuddlesList/`             | Amenities list with colocated fragment                                                        |
| `UpsList`              | `src/components/UpsList/`                 | Lifestyle features pill list with colocated fragment                                          |
| `InfoDetail`           | `src/components/InfoDetail/`              | Info blocks (text + address) with union type handling                                         |
| `DistrictLink`         | `src/components/DistrictLink/`            | Editorial link to district detail page                                                        |
| `ResponsiveImage`      | `src/components/ResponsiveImage/`         | DatoCMS responsive image with fragment                                                        |
| `ContentLink`          | `src/components/ContentLink/`             | Click-to-edit overlays (draft mode, no next/navigation hooks)                                 |
| `DraftModeToggler`     | `src/components/DraftModeToggler/`        | Draft mode toggle button                                                                      |

### Path Alias

`@/*` maps to `./src/*` in tsconfig.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

- `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` — CDA published content token
- `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` — CDA draft content token
- `DATOCMS_CMA_TOKEN` — Content Management API token (read-only, for schema generation)
- `DATOCMS_BASE_EDITING_URL` — DatoCMS project URL for content link overlays
- `SECRET_API_TOKEN` — Shared secret for webhook authentication
- `NEXT_PUBLIC_SITE_URL` — Production URL (e.g. `https://acaciafirenze.com`), used as `metadataBase` for SEO and sitemap generation

## SEO

Each page exports `generateMetadata()` using `_seoMetaTags` from DatoCMS + `toNextMetadata` from `react-datocms`. Pattern:

```ts
const metaQuery = graphql(
  `
    query {
      record {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await executeQuery(metaQuery, { variables: { locale }, includeDrafts });
  return {
    ...toNextMetadata(data.record?._seoMetaTags ?? []),
    alternates: { canonical, languages },
  };
}
```

`metadataBase` is set in `src/app/layout.tsx`. `src/app/sitemap.ts` generates `/sitemap.xml` for all static and dynamic routes in both locales.

## Error Pages

- `src/app/[locale]/not-found.tsx` — 404 page (server component, no locale access, bilingual)
- `src/app/[locale]/error.tsx` — error boundary (`'use client'`, required by Next.js)
- `src/app/[locale]/loading.tsx` — loading skeleton for Suspense boundaries
- These render WITHOUT SiteHeader/SiteFooter (outside locale layout)

## Formatting

- Prettier: single quotes, trailing commas, 100 char print width
- Generated files to never edit: `schema.graphql`, `src/lib/datocms/graphql-env.d.ts`, `src/lib/datocms/cma-types.ts`
- Route handlers use `.ts` extension (not `.tsx`) since they contain no JSX
- Always use the `/frontend-design` skill when evaluating or implementing UI changes
