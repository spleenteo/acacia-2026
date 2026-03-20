# Project Structure

## Directory Tree

```
acacia-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (<html lang>, metadataBase)
│   │   ├── global.css                          # Tailwind v4 @theme tokens + @layer base
│   │   ├── sitemap.ts                          # Dynamic sitemap generation
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                      # Locale layout (header, footer, beddy, draft)
│   │   │   ├── page.tsx                        # Home page (query + realtime)
│   │   │   ├── HomeContent.tsx                 # Home presentational component
│   │   │   ├── error.tsx                       # Error boundary (client)
│   │   │   ├── loading.tsx                     # Loading skeleton
│   │   │   ├── not-found.tsx                   # 404 page
│   │   │   ├── florence/
│   │   │   │   ├── accommodations/
│   │   │   │   │   ├── page.tsx                # Apartments listing
│   │   │   │   │   ├── AccommodationsContent.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── page.tsx            # Apartment detail (multi-query)
│   │   │   │   │       └── ApartmentDetailContent.tsx
│   │   │   │   └── districts/
│   │   │   │       ├── page.tsx                # Districts listing
│   │   │   │       ├── DistrictsContent.tsx
│   │   │   │       └── [slug]/
│   │   │   │           ├── page.tsx            # District detail (multi-query)
│   │   │   │           └── DistrictDetailContent.tsx
│   │   │   └── moods/
│   │   │       ├── page.tsx                    # Moods listing
│   │   │       ├── MoodsContent.tsx
│   │   │       └── [slug]/
│   │   │           ├── page.tsx                # Mood detail
│   │   │           └── MoodDetailContent.tsx
│   │   └── api/
│   │       ├── draft-mode/
│   │       │   ├── enable/route.ts
│   │       │   └── disable/route.ts
│   │       ├── invalidate-cache/route.ts
│   │       ├── preview-links/route.ts          # Web Previews plugin webhook
│   │       ├── seo-analysis/route.ts           # SEO Analysis plugin endpoint
│   │       ├── post-deploy/route.ts            # One-time plugin setup (legacy)
│   │       └── utils.ts                        # CORS, cookie fix, response helpers
│   ├── components/
│   │   ├── ApartmentCard/index.tsx
│   │   ├── BeddyBar/index.tsx
│   │   ├── Hero/index.tsx                      # Full-viewport hero (portrait img, double gradient)
│   │   ├── CategoryFilter/index.tsx
│   │   ├── ContentLink/index.tsx               # Click-to-edit overlays (draft mode)
│   │   ├── CuddlesList/index.tsx
│   │   ├── DistrictCard/index.tsx
│   │   ├── DistrictLink/index.tsx
│   │   ├── DraftModeToggler/index.tsx
│   │   ├── HtmlContent/index.tsx
│   │   ├── ImageGallery/
│   │   │   ├── index.tsx
│   │   │   └── fragment.ts
│   │   ├── InfoDetail/index.tsx
│   │   ├── MoodCard/index.tsx
│   │   ├── SectionHeader/index.tsx                 # Reusable label/title/subtitle header (SectionHeaderRecord)
│   │   ├── ResponsiveImage/index.tsx
│   │   ├── SiteFooter/index.tsx
│   │   ├── SiteHeader/index.tsx
│   │   ├── WhatWeLove/
│   │   │   ├── index.tsx                       # 2-6 photo gallery with caption overlay
│   │   │   └── fragment.ts
│   │   └── UpsList/index.tsx
│   ├── i18n/
│   │   └── config.ts                          # Locale config (en, it)
│   └── lib/
│       └── datocms/
│           ├── executeQuery.ts                 # Central CDA fetch wrapper (cache/no-store)
│           ├── recordInfo.ts                   # Record type → URL mapping
│           ├── cma-types.ts                    # Generated CMA types
│           ├── graphql-env.d.ts                # Generated gql.tada types
│           └── realtime/
│               └── RealtimeWrapper.tsx         # Shared 'use client' SSE subscription wrapper
├── .claude/
│   └── skills/
│       └── realtime-page-pattern/SKILL.md     # Project skill: page creation pattern
├── docs/
│   ├── change-log.md                          # Version changelog
│   ├── how-to.md                              # Internal reference (AI-optimized)
│   ├── project-structure.md                   # This file
│   ├── design/                                # Design documentation
│   ├── pitches/
│   │   └── init.md                            # Original project pitch
│   └── shaping/
│       ├── frontend-restyle.md                # Active shaping: Hero, Nav, Cards, Sections
│       ├── datocms-schema-migration.md        # CMS schema migration docs
│       └── completed/
│           ├── init-shaping.md                # Shape A: full rebuild
│           └── init-slices.md                 # V1–V5 slice breakdown
├── pitches/
│   ├── apartment-detail-redesign.md           # Apartment detail page pitch
│   └── web-previews-visual-editing.md         # Web Previews & Visual Editing pitch
├── middleware.ts                               # Locale redirect (/ → /en)
├── schema.graphql                             # Auto-generated DatoCMS schema
├── tsconfig.json                              # TypeScript strict + gql.tada plugin
├── postcss.config.mjs                         # PostCSS with Tailwind
├── next.config.mjs                            # Next.js config
├── .nvmrc                                     # Node 22
├── public/
│   ├── logo--main.svg                         # Full wordmark SVG (ratio ~3.6:1)
│   └── acacia-isologo.svg                     # Isologo (copyright: not for standalone use)
└── package.json                               # v0.5.1
```

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript (strict)     |
| React     | 19                      |
| CMS       | DatoCMS (GraphQL CDA)   |
| Styling   | Tailwind CSS v4         |
| Type gen  | gql.tada + @datocms/cli |
| Deploy    | Vercel                  |
| Node      | 22                      |
