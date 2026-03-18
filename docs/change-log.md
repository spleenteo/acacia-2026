# Changelog

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
