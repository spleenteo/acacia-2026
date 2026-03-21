# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Acacia Firenze — Next.js 16 (App Router) website integrated with DatoCMS as headless CMS. Uses React 19, TypeScript (strict mode), Tailwind CSS v4, and deploys to Vercel. Node 22 required (see .nvmrc). Bilingual site (EN/IT) with locale-prefixed URLs (`/en/...`, `/it/...`).

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint + Prettier check
npm run format           # Auto-format with Prettier
npm run generate-schema  # Regenerate GraphQL schema + introspection types from DatoCMS
npm run generate-cma-types # Regenerate CMA types (requires DATOCMS_CMA_TOKEN)
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

**Locale routing**: App Router uses a `[locale]` dynamic segment (`src/app/[locale]/`). Supported locales are `en` and `it`, configured in `src/i18n/config.ts`. The root layout (`src/app/layout.tsx`) provides `<html lang>` dynamically from params; the locale layout adds header, footer, Beddy script, and draft mode controls. `middleware.ts` redirects paths without locale prefix to `/en` and rewrites translated path segments to canonical filesystem paths.

**Localized path segments**: URL path segments are translated per locale (`florence` → `firenze`, `accommodations` → `appartamenti`, `districts` → `quartieri`). The translation map and utilities live in `src/i18n/paths.ts`. The middleware rewrites incoming translated paths to canonical (English) filesystem routes. All components use `modelPath()` or `localizedPath()` to generate locale-aware hrefs. To add a new translated section: add the segment to `pathSegments`, then add the model to `modelPrefixes` (detail) or `indexPaths` (singleton) in `paths.ts`.

**Mood apartments (union type)**: Moods link to apartments via `boxes` → `MoodItemsRecord[]` → `object` (union: `ApartmentRecord | PostRecord | ServiceRecord | TipRecord`). Apartments are extracted inline with `__typename === 'ApartmentRecord'` filtering.

**HTML content from DatoCMS**: Legacy text fields (description, abstract, claim) are queried with `markdown: true` and rendered via the `<HtmlContent>` component (`dangerouslySetInnerHTML`). This will be replaced with a Structured Text renderer when DatoCMS schema migrates.

**Fragment separation for client components**: When a GraphQL fragment is defined in a `'use client'` file but needs to be imported in server components, extract it to a separate `.ts` file (e.g., `ImageGallery/fragment.ts`). Importing from `'use client'` files in server components causes gql.tada build errors ("j.definitions is not iterable").

**Turbopack workaround**: Next.js 16 Turbopack has a bug where `useRouter()`, `usePathname()`, and other `next/navigation` hooks that subscribe to router state cause "Cannot read properties of undefined (reading 'unsubscribe')" errors. Use `window.history.replaceState` instead of `router.push`, `window.location.pathname` instead of `usePathname()`, and `window.location.assign()` for full navigation. `useSearchParams` works when wrapped in a Suspense boundary.

### Styling — "Rinascimento Moderno" Design System

Tailwind CSS v4 with `@theme` (NOT `@theme inline`) design tokens in `src/app/global.css`. Full design system reference: `pitches/demostyle.jsx`.

**Critical Tailwind v4 rules:**

- Use `@theme` (without `inline`) so variables are emitted at `:root` and accessible in `@layer base`
- Font-size tokens use `--text-*` namespace with `--text-*--line-height` companions (NOT `--font-size-*`)
- All base/reset CSS must be inside `@layer base` — unlayered CSS overrides `@layer utilities` regardless of specificity
- Never set `color`, `font-family`, or `font-weight` on `h1–h6` in base styles — use Tailwind utility classes

**Palette:** Warm rust accent `#D0512A`, cream surfaces (`surface` #FDFBF8 / `surface-alt` #F5F0E8 / `surface-warm` #ECE6DB), warm dark `#2E2822` (never pure black).

**Typography:** Playfair Display (`font-heading`) for all headings, DM Sans (`font-body`) for body text. Font sizes: `text-hero` (56px), `text-h1` (42px), `text-h2` (36px), `text-h3` (24px), `text-h4` (18px), `text-body-lg` (17px), `text-body` (15px), `text-body-sm` (14px), `text-caption` (13px), `text-label` (12px), `text-tag` (10px), `text-fine` (11px).

**Editorial pattern:** Section headings use `<em>` for italic emphasis on one key word (rendered at `font-weight: 500` via `@layer base` rule). Section labels: `text-label uppercase tracking-[0.22em] text-rust font-medium`.

**Cards:** `rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-1` with image zoom `scale-[1.04]` and rust tag pills. PostCSS configured in `postcss.config.mjs`.

### Components

| Component          | Path                               | Purpose                                                       |
| ------------------ | ---------------------------------- | ------------------------------------------------------------- |
| `SiteHeader`       | `src/components/SiteHeader/`       | Navigation with locale switcher, primary bg                   |
| `SiteFooter`       | `src/components/SiteFooter/`       | Two-band footer (cream + dark)                                |
| `BeddyBar`         | `src/components/BeddyBar/`         | Wrapper for `<beddy-bar>` web component (booking widget)      |
| `HtmlContent`      | `src/components/HtmlContent/`      | Renders legacy HTML from DatoCMS text fields                  |
| `ApartmentCard`    | `src/components/ApartmentCard/`    | Apartment card with colocated GraphQL fragment                |
| `MoodCard`         | `src/components/MoodCard/`         | Mood card with colocated GraphQL fragment                     |
| `DistrictCard`     | `src/components/DistrictCard/`     | District card with colocated GraphQL fragment                 |
| `ImageGallery`     | `src/components/ImageGallery/`     | Client component lightbox gallery (fragment in `fragment.ts`) |
| `CategoryFilter`   | `src/components/CategoryFilter/`   | Client component for apartment category filtering             |
| `CuddlesList`      | `src/components/CuddlesList/`      | Amenities list with colocated fragment                        |
| `UpsList`          | `src/components/UpsList/`          | Lifestyle features pill list with colocated fragment          |
| `InfoDetail`       | `src/components/InfoDetail/`       | Info blocks (text + address) with union type handling         |
| `DistrictLink`     | `src/components/DistrictLink/`     | Editorial link to district detail page                        |
| `ResponsiveImage`  | `src/components/ResponsiveImage/`  | DatoCMS responsive image with fragment                        |
| `ContentLink`      | `src/components/ContentLink/`      | Click-to-edit overlays (draft mode, no next/navigation hooks) |
| `DraftModeToggler` | `src/components/DraftModeToggler/` | Draft mode toggle button                                      |

### Path Alias

`@/*` maps to `./src/*` in tsconfig.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

- `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` — CDA published content token
- `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` — CDA draft content token
- `DATOCMS_CMA_TOKEN` — Content Management API token (read-only, for schema generation)
- `DATOCMS_BASE_EDITING_URL` — DatoCMS project URL for content link overlays
- `SECRET_API_TOKEN` — Shared secret for webhook authentication
- `NEXT_PUBLIC_SITE_URL` — Production URL (e.g. `https://acacia-firenze.com`), used as `metadataBase` for SEO and sitemap generation

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
