# Pitch: Acacia Firenze — Website Rebuild with Next.js + DatoCMS

## 1. Problem

Acacia Firenze (https://www.acaciafirenze.com) is a family-run holiday apartment business in Florence, offering ~40 apartments across multiple city districts. The current website is built with Middleman (a Ruby static site generator) and sources content from DatoCMS.

The codebase is available at https://github.com/spleenteo/acaciafirenze-website and is useful as a reference for understanding some of the more complex component logic and content blocks.

**Why the current setup doesn't work anymore:**

The site has hit a dead end. Build times with Middleman take minutes, making iterative content changes painful. The codebase is so dated that evolutionary modifications have become practically impossible — adding a new feature or changing a layout means fighting the tooling instead of building.

On the content side, the DatoCMS project still relies on legacy WYSIWYG fields instead of Structured Text, and there's no live preview or draft mode. The content editors (the family) have no way to see changes before publishing, and the editing experience is far behind what DatoCMS offers today.

The marketing and analytics side is completely neglected — there's no visibility on conversions, visit patterns, or SEO performance. While the site converts reasonably for bookings (via the external Beddy system), there's no data to know what's working and what isn't.

**Baseline:** A tourist searching for an apartment in Florence lands on acaciafirenze.com, browses the accommodations, reads about districts, and eventually clicks through to Beddy's external booking widget. The site does its job visually, but the technology behind it is frozen in time and can't evolve.

## 2. Appetite

**2 weeks — solo developer assisted by Claude Code.**

This is a one-person project leveraging AI-assisted development heavily. The appetite reflects a realistic timeframe for shipping a functional, production-ready first version with the core sections — not the entire site.

The scope is deliberately constrained: ship Apartments, Districts, and Home Page first. Everything else (Blog, Offers, FAQ, Experiences, Events, Guestbook) comes in future cycles.

Deploy target: **Vercel free tier**.

## 3. Solution

Rebuild the site from scratch with **Next.js (App Router)** + **DatoCMS** + **Tailwind CSS**, deployed on **Vercel**.

The new site consumes the **existing DatoCMS project and models as-is** — no data migration, no model restructuring in this cycle. Model improvements (e.g., migrating WYSIWYG fields to Structured Text) will happen in a dedicated future pitch.

### Core DatoCMS features to leverage

- **Draft/Published Preview** — content editors can see draft changes before publishing via a secure preview route.
- **Visual Editing (Live Preview)** — real-time editing overlay connected to DatoCMS, so editors can click-to-edit content directly on the page.
- **Cache Tags** — each API response includes cache tags tied to specific records; when content changes in DatoCMS, a webhook invalidates only the affected pages on Vercel via on-demand ISR. This gives the site static performance with instant content updates.
- **Site Search** — client-side search powered by DatoCMS Search API, searching across accommodations, districts, moods, and blog content by title, description, and other text fields.

### Languages

The site is **bilingual: English (default) and Italian**. The architecture must support adding more locales in the future without structural changes. All DatoCMS queries include locale parameters, and routing uses locale prefixes (e.g., `/en/apartments/...`, `/it/appartamenti/...`).

### Pages in scope for this cycle

**Home Page**
- Hero section with Beddy search widget (JS embed for general availability search — redirects users to Beddy's external booking domain)
- Featured apartments selection
- Moods overview section (links to mood pages)
- Footer with contacts, social links, legal info

**Apartments — listing page** (`/en/florence/accommodations`)
- Grid/list of all ~40 apartments
- Client-side filtering by typology (Studio, 1BR, 2BR, 3BR, 4BR, Villa) — no server-side filtering needed, the full dataset is small enough to load at once
- Each apartment card shows: cover image (via DatoCMS image service with responsive sizes), name, short description, typology, district, and badges/labels (e.g., "Special Winter Offer", "Home Office", "Lift")

**Apartment — detail page** (`/en/florence/accommodations/[slug]`)
- Full apartment presentation with image gallery, description, amenities, location on district, and all "cuddle" dictionary items (points of strength, amenities, features — these come from linked DatoCMS dictionary models)
- Beddy widget embed for single-apartment booking search
- Related apartments or "same district" suggestions

**Districts — listing page** (`/en/florence/districts`)
- Grid of all districts with cover image and name

**District — detail page** (`/en/florence/districts/[slug]`)
- District description and imagery
- List of apartments in this district

**Moods — listing page** (`/en/moods`)
- Grid of all moods (Foodie, Family, Business, Slow Tourism, etc.)
- Each mood card shows name, short description, cover image

**Mood — detail page** (`/en/moods/[slug]`)
- Mood description
- Filtered list of apartments matching this mood
- Related services/experiences (displayed as links or cards, but the Experiences section itself is out of scope)

### Technical architecture

- **Next.js App Router** with file-based routing and locale segments
- **TypeScript throughout** — all components, queries, and utilities fully typed, with types generated from DatoCMS schema (via `datocms-codegen` or equivalent)
- **Atomic component structure** — small, reusable components (e.g., `ApartmentCard`, `DistrictCard`, `MoodCard`, `Badge`, `ImageGallery`, `BeddyWidget`) with no duplication
- **GraphQL fragments** co-located with components — each component defines its own fragment, and page queries compose these fragments. This keeps data requirements explicit and avoids over-fetching
- **Tailwind CSS** with a well-defined design token config (colors, typography, spacing) that reflects Acacia's brand. Use a comprehensive icon set (e.g., Lucide or Heroicons) for amenities and UI elements
- **Responsive Images** via DatoCMS `responsiveImage` GraphQL field + `react-datocms` `<Image>` component for automatic srcset, lazy loading, and blur-up placeholders
- **ISR with Cache Tags** — pages are statically generated and revalidated on-demand via DatoCMS webhook → Vercel revalidation endpoint, using cache tags for surgical invalidation

### Beddy integration

Beddy is a closed system with no API. Integration is limited to two JS widget embeds provided by Beddy:

1. **General search widget** (Home Page) — a form where users enter dates/guests, which redirects them to Beddy's external booking site with search results
2. **Single-apartment widget** (Apartment detail page) — pre-filled with the specific apartment, same redirect behavior

Both widgets are `<script>` embeds that inject DOM into the page. They need to be loaded client-side (likely in a dedicated client component wrapper).

### Olark chat widget

The existing Olark live chat widget stays for this cycle. It's a simple script embed in the layout. A future improvement could replace it with an AI-powered bot trained on site content, but that's out of scope now.

## 4. Rabbit Holes

**Structured Text migration — NOT now.** The existing DatoCMS models use legacy WYSIWYG/HTML fields. Migrating them to Structured Text requires careful DatoCMS migrations and content review. This is a separate pitch. The new frontend must render the current HTML field content correctly (likely via `dangerouslySetInnerHTML` or a sanitization library), while being architecturally ready for Structured Text (i.e., the rendering layer should be swappable).

**Beddy widget loading behavior.** The Beddy scripts inject DOM and may conflict with React hydration or Next.js client components. This needs early testing — wrap them in isolated client components with `useEffect` mounting and potentially `<iframe>` fallback if DOM injection causes issues.

**Vercel free tier limits.** The free tier has limits on serverless function execution, bandwidth, and ISR revalidations. With ~40 apartments and a handful of other pages, this should be well within limits, but monitor edge function usage if using middleware for locale detection. Prefer static generation wherever possible.

**DatoCMS GraphQL complexity.** The existing models may have deeply nested relationships (apartment → district → ..., apartment → mood → ..., apartment → cuddle dictionaries → ...). Fragment composition in GraphQL must be done carefully to avoid circular dependencies or overly deep queries. Use DatoCMS's query complexity explorer to stay within limits.

**Image-heavy pages.** Apartment galleries can have many high-resolution images. Rely on DatoCMS responsive image handling and lazy loading. Don't load all gallery images eagerly — consider a lightbox or carousel that loads images on interaction.

**Locale routing and SEO.** Ensure proper `hreflang` tags, canonical URLs, and that the locale prefix strategy works cleanly with Vercel's free tier (no edge middleware for locale detection — use a simpler redirect/default approach).

## 5. No-Gos

- **No Experiences/Services section** in this cycle — these pages exist on the current site but are excluded from the first release
- **No Blog** — will be a future cycle
- **No Offers section** — future cycle
- **No FAQ section** — future cycle
- **No Events section** — future cycle
- **No Guestbook** — future cycle
- **No Newsletter signup** — the current one doesn't work anyway; will be reconsidered later
- **No DatoCMS model restructuring** — models stay as-is; Structured Text migration is a separate pitch
- **No custom analytics dashboard** — just ensure proper Google Analytics / Tag Manager setup for basic tracking; deeper analytics comes later
- **No AI chat bot** — keep Olark for now; AI bot is a future exploration
- **No custom booking engine** — Beddy is the booking system; we embed their widgets and that's it
- **No A/B testing or conversion optimization** — ship first, optimize later
- **No social media feed integration** (Instagram embed, etc.) — just static social links in the footer
