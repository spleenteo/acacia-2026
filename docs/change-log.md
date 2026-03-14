# Changelog

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
