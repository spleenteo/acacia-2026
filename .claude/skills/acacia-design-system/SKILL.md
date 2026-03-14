---
name: acacia-design-system
description: "Apply the Acacia Firenze visual design system to any frontend component, page, or layout in this project. Use this skill whenever creating, editing, or styling UI components, pages, sections, cards, buttons, navigation, or any visual element. Also use when choosing colors, fonts, spacing, shadows, border-radius, or any design token. Triggers include: any mention of 'style', 'design', 'component', 'page', 'section', 'card', 'button', 'hero', 'footer', 'navbar', or when writing Tailwind classes for visual styling. Always consult this skill before making aesthetic decisions — it is the single source of truth for the project's visual language. Whenever new components, sections, animation or any other  design  element are modified or created, auto update this file to keep it aligned with the project"
---

# Acacia Firenze — Design System (Tailwind CSS v4)

You are working on the Acacia Firenze website. The aesthetic direction is **"Rinascimento Moderno"** — editorial, fashion-forward, confident luxury adapted with Florentine warmth and a family-run hospitality soul.

Always follow these rules when writing any UI code for this project.

---

## Tailwind v4 @theme Configuration

All design tokens are defined in CSS using `@theme`. This block lives in the main CSS file (e.g. `globals.css` or `app.css`).

```css
@import 'tailwindcss';

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');

@theme {
  /* ── COLORS ── */

  --color-surface: #fdfbf8;
  --color-surface-alt: #f5f0e8;
  --color-surface-warm: #ece6db;

  --color-dark: #2e2822;
  --color-dark-soft: #3d352d;

  --color-body: #2e2822;
  --color-muted: #847a6f;
  --color-light: #b0a698;

  --color-rust: #d0512a;
  --color-rust-hover: #b8441f;
  --color-rust-soft: #e07a52;
  --color-rust-pale: #faddd2;
  --color-rust-deep: #9c3a1a;

  --color-gold: #d4a94b;
  --color-card: #ffffff;
  --color-border: #e5ddd2;
  --color-border-light: #efeadf;

  /* ── FONTS ── */

  --font-heading: 'Playfair Display', 'Georgia', serif;
  --font-body: 'Lato', 'Helvetica Neue', sans-serif;

  /* ── FONT SIZES ── */

  --text-hero: 3.5rem;
  --text-hero--line-height: 1.06;
  --text-h1: 2.625rem;
  --text-h1--line-height: 1.12;
  --text-h2: 2.25rem;
  --text-h2--line-height: 1.15;
  --text-h3: 1.5rem;
  --text-h3--line-height: 1.2;
  --text-h4: 1.125rem;
  --text-h4--line-height: 1.3;
  --text-body-lg: 1.0625rem;
  --text-body-lg--line-height: 1.55;
  --text-body: 0.9375rem;
  --text-body--line-height: 1.7;
  --text-body-sm: 0.875rem;
  --text-body-sm--line-height: 1.6;
  --text-caption: 0.8125rem;
  --text-caption--line-height: 1.5;
  --text-label: 0.75rem;
  --text-label--line-height: 1;
  --text-tag: 0.625rem;
  --text-tag--line-height: 1;
  --text-fine: 0.6875rem;
  --text-fine--line-height: 1.5;

  /* ── SPACING ── */

  --spacing-section-x: 3.5rem;
  --spacing-section-y: 5rem;
  --spacing-section-y-lg: 5.5rem;

  /* ── BORDER RADIUS ── */

  --radius-card: 1rem;
  --radius-card-lg: 1.125rem;
  --radius-card-xl: 1.25rem;
  --radius-pill: 6.25rem;

  /* ── SHADOWS ── */

  --shadow-card: 0 2px 12px rgba(46, 40, 34, 0.04);
  --shadow-card-hover: 0 16px 48px rgba(46, 40, 34, 0.1);
}

@layer base {
  html {
    font-family: var(--font-body);
    color: var(--color-body);
    background-color: var(--color-surface);
  }
  ::selection {
    background-color: var(--color-rust);
    color: #fff;
  }
  h1 em,
  h2 em,
  h3 em {
    font-style: italic;
  }
}
```

---

## Typography — CRITICAL RULES

### Headlines: Regular Serif + Italic Emphasis

Every section title MUST use Playfair Display (`font-heading`) at **regular weight (400)** with **one keyword in `<em>` italic**. This is the signature editorial pattern. Never skip it.

Playfair Display is ALWAYS `font-normal` — never bold, never semibold. The elegance comes from the regular-weight serif with italic contrast, not from weight.

```html
<!-- ✅ CORRECT — regular weight, one italic emphasis word -->
<h2 class="font-heading text-h1 font-normal text-dark tracking-tight">
  Non ci accontentiamo del <em>quasi perfetto.</em>
</h2>

<!-- ✅ MORE EXAMPLES -->
<!-- "Ogni casa, una <em>storia.</em>" -->
<!-- "Abbiamo fatto il lavoro <em>difficile</em> per voi." -->
<!-- "Una famiglia, <em>tante storie.</em>" -->
<!-- "The most <em>authentic</em> way to stay in Florence." -->

<!-- ❌ WRONG — no italic emphasis, feels flat -->
<h2 class="font-heading text-h1 font-normal text-dark">I nostri appartamenti</h2>

<!-- ❌ WRONG — bold weight on Playfair Display -->
<h2 class="font-heading text-h1 font-bold text-dark">...</h2>

<!-- ❌ WRONG — too many italics -->
<h2>"<em>Ogni</em> <em>casa</em> una <em>storia</em>"</h2>
```

The `<em>` is italic at the same weight (400), creating contrast purely through letterform — no weight change needed.

### Section Labels

Every major section starts with a rust uppercase micro-label above the headline:

```html
<p class="font-body text-label font-medium uppercase text-rust tracking-[0.22em] mb-3.5">
  La promessa Acacia
</p>
```

### Body Text

Always use `font-light` (300) for body paragraphs. Reserve `font-normal` (400) for metadata/captions only. Never use `font-medium`+ in body text except for links and buttons.

### Type Scale Reference

| Role            | Classes                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Hero title      | `font-heading text-hero font-normal text-dark tracking-tight`            |
| Section title   | `font-heading text-h1 font-normal text-dark tracking-tight` + `<em>`     |
| Subsection      | `font-heading text-h2 font-normal text-dark`                             |
| Card title      | `font-heading text-h3 font-normal text-dark`                             |
| Grid card title | `font-heading text-h4 font-normal text-dark`                             |
| Label           | `font-body text-label font-medium uppercase text-rust tracking-[0.22em]` |
| Body            | `font-body text-body font-light text-muted`                              |
| Hero subtitle   | `font-body text-body-lg font-light text-white/75`                        |
| Nav link        | `font-body text-body-sm font-normal text-muted hover:text-rust`          |
| Button          | `font-body text-caption font-medium tracking-[0.06em]`                   |
| Tag pill        | `font-body text-tag font-semibold uppercase tracking-[0.14em]`           |
| Footer          | `font-body text-fine font-light`                                         |

---

## Color Rules

### Rust (#D0512A) — Where to Use

1. All primary CTA buttons: `bg-rust hover:bg-rust-hover text-white rounded-pill`
2. Section labels: `text-rust`
3. Card image tag pills: `bg-rust text-white`
4. Hover states on links: `hover:text-rust`
5. Review card top border: `border-t-[3px] border-rust`
6. Decorative section dividers: `w-12 h-[3px] bg-rust rounded-sm mx-auto`
7. Stats numbers in About: `text-rust font-bold`
8. Icon marker backgrounds: `bg-rust-pale` with `text-rust`
9. Breaker quote source flanking lines: `bg-rust-soft`
10. `::selection` highlight

### Rust — Where NOT to Use

- Never as section/card background
- Never as body text
- Never as heading text (always `text-dark`)
- Never as card border (except subtle hover: `border-2 border-rust`)

### Dark (#2E2822) — Never Pure Black

Always use `text-dark` / `bg-dark` for all "black" elements. Never `#000` or `text-black`.

### Background Alternation

Alternate section backgrounds for visual rhythm, never use the same bg for adjacent sections:

```
bg-surface (#FDFBF8) → bg-surface-alt (#F5F0E8) → bg-surface-warm (#ECE6DB)
```

---

## Component Patterns

### Primary Button

```html
<button
  class="font-body text-caption font-medium tracking-[0.06em]
  text-white bg-rust hover:bg-rust-hover
  px-9 py-3.5 rounded-pill cursor-pointer transition-colors duration-250"
>
  Prenota
</button>
```

### Secondary Button (Rust Outline)

```html
<button
  class="font-body text-caption font-medium tracking-[0.06em]
  text-rust bg-transparent border-[1.5px] border-rust
  hover:bg-rust hover:text-white
  px-9 py-3.5 rounded-pill cursor-pointer transition-all duration-250"
>
  Vedi tutti
</button>
```

### Card (Featured Apartment)

```html
<div
  class="rounded-card overflow-hidden bg-card shadow-card
  hover:shadow-card-hover hover:-translate-y-1
  transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] cursor-pointer"
>
  <div class="relative h-[300px] overflow-hidden">
    <img
      class="w-full h-full object-cover transition-transform duration-600
      ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.04]"
    />
    <span
      class="absolute bottom-4.5 left-4.5
      bg-rust text-white text-tag font-semibold uppercase tracking-[0.14em]
      px-4 py-1.5 rounded-pill"
      >TAG</span
    >
  </div>
  <div class="p-6">
    <h3 class="font-heading text-h3 font-semibold text-dark">Name</h3>
    <p class="font-body text-caption text-muted mt-1.5">Details</p>
    <div class="mt-3.5 pt-3.5 border-t border-border-light">
      <span class="font-body text-[12px] font-medium text-muted hover:text-rust transition-colors">
        Scopri →
      </span>
    </div>
  </div>
</div>
```

### Review Card

```html
<div class="bg-card rounded-card p-8 border-t-[3px] border-rust">
  <div class="flex gap-0.5 mb-4">★★★★★ in text-gold</div>
  <p class="font-body text-body font-light text-dark">"Quote"</p>
  <div class="mt-5 pt-4 border-t border-border-light flex justify-between">
    <span class="font-body text-caption font-medium text-dark">Author</span>
    <span class="font-body text-fine text-light">Source</span>
  </div>
</div>
```

### Breaker Section (Full-Width Image + Quote)

```html
<section class="relative h-[420px] overflow-hidden">
  <img class="w-full h-full object-cover" />
  <div class="absolute inset-0 bg-dark/50" />
  <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-20">
    <h2 class="font-heading text-[40px] font-bold text-white leading-[1.15] max-w-[580px]">
      Non vorrai più tornare in <em class="font-medium">hotel.</em>
    </h2>
    <div class="mt-6 flex items-center gap-3">
      <div class="w-10 h-0.5 bg-rust-soft rounded-sm" />
      <span class="font-body text-label font-medium uppercase tracking-[0.12em] text-rust-soft">
        I nostri ospiti
      </span>
      <div class="w-10 h-0.5 bg-rust-soft rounded-sm" />
    </div>
  </div>
</section>
```

---

## Animation

### Signature Easing

All transitions use: `ease-[cubic-bezier(0.19,1,0.22,1)]` — fast start, gentle settle.

### Hover Transitions

- Cards: `shadow-card → shadow-card-hover`, `-translate-y-1`, image `scale-[1.04]`, duration 400-600ms
- Buttons: `bg-rust → bg-rust-hover`, duration 250ms
- Links: `text-muted → text-rust`, `transition-colors`

### Scroll Fade-in

Use IntersectionObserver. Elements enter with `opacity 0→1` and `translateY(28px)→0`, duration 750ms, staggered 100-120ms between siblings.

---

## Layout

- Page padding: `px-14` (56px) on sections
- Section spacing: `py-20` (80px) or `py-22` (88px)
- Card grids: 3 cols featured/promise/reviews, 4 cols explore
- Gaps: `gap-6` cards, `gap-[18px]` tight grids
- About: `grid grid-cols-[1fr_1.2fr] gap-16`
- Footer: `grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-12`

---

## Absolute Don'ts

- ❌ Pure black `#000` or `text-black` — use `text-dark` (#2E2822)
- ❌ Cool grays — all grays must be warm/brownish
- ❌ Inter, Roboto, system fonts — only `font-heading` or `font-body`
- ❌ Body text above `font-normal` — prefer `font-light`
- ❌ Rust as background fill on large areas
- ❌ Sharp corners on cards — minimum `rounded-[14px]`
- ❌ Headlines without italic `<em>` emphasis
- ❌ ALL CAPS on headlines — only on labels and tags
- ❌ Gradients (except dark overlays on images)
- ❌ `font-sans` / `font-serif` defaults — always `font-heading` or `font-body`

---

## Skill auto update

Whenever this skill is used to create new components, new sections, animation or any other typical thing related to a generic design system, auto update this file to keep it aligned with the project.
Always inform the user and ask for confirmation. Describe in plain language and advise about the consequences
