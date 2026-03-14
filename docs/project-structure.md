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
│   │   │   ├── page.tsx                        # Home page
│   │   │   ├── error.tsx                       # Error boundary (client)
│   │   │   ├── loading.tsx                     # Loading skeleton
│   │   │   ├── not-found.tsx                   # 404 page
│   │   │   ├── florence/
│   │   │   │   ├── accommodations/
│   │   │   │   │   ├── page.tsx                # Apartments listing
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx            # Apartment detail
│   │   │   │   └── districts/
│   │   │   │       ├── page.tsx                # Districts listing
│   │   │   │       └── [slug]/
│   │   │   │           └── page.tsx            # District detail
│   │   │   └── moods/
│   │   │       ├── page.tsx                    # Moods listing
│   │   │       └── [slug]/
│   │   │           └── page.tsx                # Mood detail
│   │   └── api/
│   │       ├── draft-mode/
│   │       │   ├── enable/route.ts
│   │       │   └── disable/route.ts
│   │       └── invalidate-cache/route.ts
│   ├── components/
│   │   ├── ApartmentCard/index.tsx
│   │   ├── BeddyBar/index.tsx
│   │   ├── CategoryFilter/index.tsx
│   │   ├── ContentLink/index.tsx
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
│   │   ├── ResponsiveImage/index.tsx
│   │   ├── SiteFooter/index.tsx
│   │   ├── SiteHeader/index.tsx
│   │   └── UpsList/index.tsx
│   ├── i18n/
│   │   └── config.ts                          # Locale config (en, it)
│   └── lib/
│       └── datocms/
│           ├── executeQuery.ts                 # Central CDA fetch wrapper
│           ├── recordInfo.ts                   # Record type → URL mapping
│           ├── cma-types.ts                    # Generated CMA types
│           └── graphql-env.d.ts                # Generated gql.tada types
├── docs/
│   ├── change-log.md                          # Version changelog
│   ├── how-to.md                              # Internal reference (AI-optimized)
│   ├── project-structure.md                   # This file
│   ├── design/                                # Design documentation
│   ├── pitches/
│   │   └── init.md                            # Original project pitch
│   └── shaping/
│       └── completed/
│           ├── init-shaping.md                # Shape A: full rebuild
│           └── init-slices.md                 # V1–V5 slice breakdown
├── middleware.ts                               # Locale redirect (/ → /en)
├── schema.graphql                             # Auto-generated DatoCMS schema
├── tsconfig.json                              # TypeScript strict + gql.tada plugin
├── postcss.config.mjs                         # PostCSS with Tailwind
├── next.config.ts                             # Next.js config
├── .nvmrc                                     # Node 22
└── package.json                               # v0.2.0
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
