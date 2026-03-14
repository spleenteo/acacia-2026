# How-To — Internal Reference

AI-optimized compact reference for Acacia Firenze project behavior and patterns.

---

## Design System — Rinascimento Moderno

| Token | Value | Use |
|---|---|---|
| `font-heading` | Playfair Display | All headings, hero text |
| `font-body` | DM Sans | Body text, UI elements |
| `text-hero` | 56px / 1.06 | Hero sections |
| `text-h1` | 42px / 1.12 | Page titles |
| `text-h2` | 36px / 1.15 | Section titles |
| `text-h3` | 24px / 1.2 | Subsections |
| `text-h4` | 18px / 1.3 | Card titles |
| `text-body` | 15px / 1.7 | Default text |
| `text-body-sm` | 14px / 1.6 | Secondary text |
| `text-label` | 12px / 1 | Section labels |

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `rust` | #D0512A | Primary accent, CTAs, labels |
| `surface` | #FDFBF8 | Main background |
| `surface-alt` | #F5F0E8 | Alt sections |
| `surface-warm` | #ECE6DB | Warm sections, footer |
| `dark` | #2E2822 | Dark backgrounds, heading text |
| `muted` | #847A6F | Secondary text |
| `card` | #FFFFFF | Card backgrounds |
| `border` | #E5DDD2 | Borders, dividers |

### Patterns

| Pattern | Implementation |
|---|---|
| Section label | `text-label uppercase tracking-[0.22em] text-rust font-medium` |
| Editorial emphasis | `<em>` in headings → italic weight 500 |
| Card hover | `shadow-card hover:shadow-card-hover hover:-translate-y-1` + image `scale-[1.04]` |
| Tag pill | `rounded-pill bg-rust text-white text-tag uppercase tracking-wider` |
| Card radius | `rounded-card` (1rem) |

---

## Routing

| Route | Model | Locale |
|---|---|---|
| `/[locale]` | HomePage | en, it |
| `/[locale]/florence/accommodations` | PageApartments | en, it |
| `/[locale]/florence/accommodations/[slug]` | Apartment | en, it |
| `/[locale]/florence/districts` | PageDistricts | en, it |
| `/[locale]/florence/districts/[slug]` | District | en, it |
| `/[locale]/moods` | PageMoods | en, it |
| `/[locale]/moods/[slug]` | Mood | en, it |

---

## Data Flow

- All content: DatoCMS GraphQL CDA
- Fetch: `executeQuery()` with `force-cache` + `datocms` cache tag
- Invalidation: webhook → `/api/invalidate-cache`
- Draft mode: `/api/draft-mode/enable` / `/api/draft-mode/disable`
- Types: gql.tada (compile-time) + @datocms/cli (CMA types)

---

## Beddy Integration

| Context | Widget code source |
|---|---|
| Home / Listing | `HomePage.beddyId` |
| Apartment detail | `Apartment.beddyId` (if present) |

Web component `<beddy-bar>` loaded via CDN script in layout.

---

## Key Components

| Component | Client? | Fragment? | Notes |
|---|---|---|---|
| SiteHeader | No | No | Nav + locale switcher |
| SiteFooter | No | No | Two-band (cream + dark) |
| ApartmentCard | No | Yes | Colocated fragment |
| MoodCard | No | Yes | Colocated fragment |
| DistrictCard | No | Yes | Colocated fragment |
| CategoryFilter | Yes | No | Client-side apartment filtering |
| ImageGallery | Yes | Yes | Fragment in separate `fragment.ts` |
| HtmlContent | No | No | `dangerouslySetInnerHTML` wrapper |
| CuddlesList | No | Yes | Amenities |
| UpsList | No | Yes | Lifestyle features pills |
| InfoDetail | No | Yes | Text + address blocks |
| DistrictLink | No | No | Editorial link to district |
