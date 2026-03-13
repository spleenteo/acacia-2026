# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 (App Router) starter kit integrated with DatoCMS as headless CMS. Uses React 19, TypeScript (strict mode), and deploys to Netlify. Node 22 required (see .nvmrc).

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint + Prettier check
npm run format           # Auto-format with Prettier
npm run generate-schema  # Regenerate GraphQL schema from DatoCMS (requires DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN)
npm run generate-cma-types # Regenerate CMA types (requires DATOCMS_CMA_TOKEN)
```

Pre-commit hook runs `npm run format` automatically via simple-git-hooks.

## Architecture

### Data Flow

All content comes from DatoCMS via its GraphQL Content Delivery API. The central data-fetching function is `src/lib/datocms/executeQuery.ts`, which wraps `@datocms/cda-client` with Next.js cache integration (force-cache + `datocms` cache tag). Cache is invalidated by a DatoCMS webhook hitting `/api/invalidate-cache`.

Two CDA tokens control what content is returned:
- `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` — published content for production
- `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` — draft content with stega-encoded metadata for click-to-edit overlays

### GraphQL Type Safety with gql.tada

Queries and fragments use `gql.tada` for compile-time type safety against the DatoCMS schema. The schema lives in `schema.graphql` (auto-generated, do not edit). Types are extracted with `ResultOf<>` and `VariablesOf<>`. After any DatoCMS schema change, run `npm run generate-schema`.

### Key Patterns

**Fragment colocation**: GraphQL fragments are defined in the same file as the component that consumes them (e.g., `ImageBlockFragment` in `src/components/blocks/ImageBlock/index.tsx`). Components receive data typed as `FragmentOf<typeof SomeFragment>`.

**Page generation helpers**: `src/lib/datocms/realtime/` contains utilities (`generatePageComponent`, `generatePageComponentAndMetadataFn`) that produce page components with automatic draft-mode switching and real-time update support.

**Draft mode**: Next.js Draft Mode is toggled via `/api/draft-mode/enable` and `/api/draft-mode/disable`. When active, pages use the draft CDA token and enable real-time WebSocket updates.

### Styling

Pure CSS with custom properties in `src/app/global.css`. OKLCH color space for color variables. No CSS framework (no Tailwind). highlight.js for code syntax highlighting.

### Path Alias

`@/*` maps to `./src/*` in tsconfig.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` — CDA published content token
- `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` — CDA draft content token
- `DATOCMS_CMA_TOKEN` — Content Management API token (read-only, for schema generation)
- `DATOCMS_BASE_EDITING_URL` — DatoCMS project URL for content link overlays
- `SECRET_API_TOKEN` — Shared secret for webhook authentication

## Formatting

- Prettier: single quotes, trailing commas, 100 char print width
- Generated files to never edit: `schema.graphql`, `src/lib/datocms/graphql-env.d.ts`, `src/lib/datocms/cma-types.ts`
