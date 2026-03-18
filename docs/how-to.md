# How-To — Internal Reference

AI-optimized compact reference for Acacia Firenze project behavior and patterns.

---

## Design System — Rinascimento Moderno

| Token          | Value            | Use                     |
| -------------- | ---------------- | ----------------------- |
| `font-heading` | Playfair Display | All headings, hero text |
| `font-body`    | Lato             | Body text, UI elements  |
| `text-hero`    | 56px / 1.06      | Hero sections           |
| `text-h1`      | 42px / 1.12      | Page titles             |
| `text-h2`      | 36px / 1.15      | Section titles          |
| `text-h3`      | 24px / 1.2       | Subsections             |
| `text-h4`      | 18px / 1.3       | Card titles             |
| `text-body`    | 15px / 1.7       | Default text            |
| `text-body-sm` | 14px / 1.6       | Secondary text          |
| `text-label`   | 12px / 1         | Section labels          |

### Color tokens

| Token          | Hex     | Use                            |
| -------------- | ------- | ------------------------------ |
| `rust`         | #D0512A | Primary accent, CTAs, labels   |
| `surface`      | #FDFBF8 | Main background                |
| `surface-alt`  | #F5F0E8 | Alt sections                   |
| `surface-warm` | #ECE6DB | Warm sections, footer          |
| `dark`         | #2E2822 | Dark backgrounds, heading text |
| `muted`        | #847A6F | Secondary text                 |
| `card`         | #FFFFFF | Card backgrounds               |
| `border`       | #E5DDD2 | Borders, dividers              |

### Patterns

| Pattern            | Implementation                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Section label      | `text-label uppercase tracking-[0.22em] text-rust font-medium` — sections only, NOT card metadata      |
| Editorial emphasis | `<em>` in headings → italic (font-normal, no weight change)                                            |
| Heading weight     | Playfair Display always `font-normal` — never `font-bold` or `font-semibold`                           |
| Card image hover   | `overflow-hidden rounded-sm` on image wrapper + `group-hover:shadow-card-hover` + image `scale-[1.03]` |
| Card container     | No background, no default shadow, no `overflow-hidden` on article — text fuses with page background    |
| Card radius        | `rounded-sm` (2px) on image wrapper only                                                               |
| Hero layout        | `min-h-[88svh]` + `marginTop: calc(var(--header-height) * -1)` — slides under fixed nav                |
| Nav scroll-aware   | Transparent + `bg-dark/20 backdrop-blur-sm` at top → `bg-surface/95 backdrop-blur-xl` on scroll >50px  |
| Prose HTML content | `.prose-acacia` class in `global.css` — use on `HtmlContent` wrapper for reliable CMS content styling  |

---

## Routing

| Route                                      | Model          | Locale |
| ------------------------------------------ | -------------- | ------ |
| `/[locale]`                                | HomePage       | en, it |
| `/[locale]/florence/accommodations`        | PageApartments | en, it |
| `/[locale]/florence/accommodations/[slug]` | Apartment      | en, it |
| `/[locale]/florence/districts`             | PageDistricts  | en, it |
| `/[locale]/florence/districts/[slug]`      | District       | en, it |
| `/[locale]/moods`                          | PageMoods      | en, it |
| `/[locale]/moods/[slug]`                   | Mood           | en, it |

---

## Data Flow

- All content: DatoCMS GraphQL CDA
- Published: `executeQuery()` with `force-cache` + `datocms` cache tag
- Draft: `executeQuery()` with `no-store` (bypasses cache entirely)
- Invalidation: webhook → `/api/invalidate-cache`
- Draft mode: `/api/draft-mode/enable` / `/api/draft-mode/disable`
- Types: gql.tada (compile-time) + @datocms/cli (CMA types)

### Real-Time Draft Preview

| Concept  | Implementation                                                         |
| -------- | ---------------------------------------------------------------------- |
| Pattern  | Server fetch → `initialData` → client `useQuerySubscription` (SSE)     |
| Helpers  | `generatePageComponent` (server), `generateRealtimeComponent` (client) |
| Location | `src/lib/datocms/realtime/`                                            |
| Scope    | Main query per page only; secondary queries fetched server-side        |
| Token    | `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` passed to client in draft mode       |

### Page File Structure (with realtime)

Each page directory contains:

- `*Query.ts` — GraphQL query extracted to standalone file
- `*Content.tsx` — Presentational component (server-compatible, receives resolved props + data)
- `*Realtime.tsx` — `'use client'` wrapper with `useQuerySubscription`
- `page.tsx` — Server component, `generateMetadata`, `generateStaticParams`, draft/published switch

---

## Web Previews & Visual Editing

| Endpoint                  | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `/api/preview-links`      | Returns draft/published URLs for Web Previews plugin sidebar |
| `/api/draft-mode/enable`  | Enables Next.js Draft Mode + partitioned cookie for iframe   |
| `/api/draft-mode/disable` | Disables Draft Mode                                          |
| `/api/seo-analysis`       | SEO Analysis plugin HTML endpoint                            |

| Config          | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Plugin          | `datocms-plugin-web-previews` (configured in DatoCMS UI)                   |
| Preview webhook | `{SITE_URL}/api/preview-links?token={SECRET_API_TOKEN}`                    |
| Draft mode URL  | `{SITE_URL}/api/draft-mode/enable?token={SECRET_API_TOKEN}`                |
| Reload on save  | Disabled (`reloadPreviewOnRecordUpdate: false`) — SSE handles live updates |
| Content Link    | `@datocms/content-link` controller, hover-only overlays                    |
| baseEditingUrl  | Auto-appends `/environments/{DATOCMS_ENVIRONMENT}` when set                |

---

## Beddy Integration

| Context          | Widget code source               |
| ---------------- | -------------------------------- |
| Home / Listing   | `HomePage.beddyId`               |
| Apartment detail | `Apartment.beddyId` (if present) |

Web component `<beddy-bar>` loaded via CDN script in layout. **Disabled in draft mode** — script not loaded when `isDraftModeEnabled` is true.

---

## Apartment Schema

| Field              | Source                       | Notes                                                     |
| ------------------ | ---------------------------- | --------------------------------------------------------- |
| `houseBadge.label` | Linked `HouseBadge` record   | Localized, replaces old `highlight` string                |
| `featuredImage`    | Direct file field (required) | Used everywhere — card, hero, listing. `boxImage` removed |
| `ape`              | String field                 | Energy class (A–G), displayed with CIN after comforts     |
| `cin`              | String field                 | Italian accommodation ID, displayed after comforts        |
| `published`        | Removed                      | Uses native DatoCMS draft/published status                |

---

## Key Components

| Component      | Client? | Fragment? | Notes                                              |
| -------------- | ------- | --------- | -------------------------------------------------- |
| Hero           | No      | No        | Full-viewport hero, double gradient, children slot |
| SiteHeader     | Yes     | No        | Scroll-aware nav, mobile overlay, SVG logo         |
| SiteFooter     | No      | No        | Two-band (cream + dark)                            |
| ApartmentCard  | No      | Yes       | Colocated fragment                                 |
| MoodCard       | No      | Yes       | Colocated fragment                                 |
| DistrictCard   | No      | Yes       | Colocated fragment                                 |
| CategoryFilter | Yes     | No        | Client-side apartment filtering                    |
| ImageGallery   | Yes     | Yes       | Fragment in separate `fragment.ts`                 |
| HtmlContent    | No      | No        | `dangerouslySetInnerHTML` wrapper                  |
| CuddlesList    | No      | Yes       | Amenities                                          |
| UpsList        | No      | Yes       | Lifestyle features pills                           |
| InfoDetail     | No      | Yes       | Text + address blocks                              |
| DistrictLink   | No      | No        | Editorial link to district                         |
