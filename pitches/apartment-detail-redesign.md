# Pitch: Redesign Scheda Appartamento

**Appetite:** 6 settimane | **Tipo:** Big Batch | **Stato:** Shaped

## Problema

La scheda appartamento attuale (V1) è funzionale ma soffre di diversi problemi UX:

- **Layout piatto** — tutte le informazioni in colonna singola, nessuna gerarchia visiva forte
- **Booking widget sepolto** — il CTA di prenotazione è in fondo alla pagina, invisibile senza scroll
- **Contenuti editoriali mancanti** — nessuna sezione "What We Love", nessun Home Truths, nessuna review
- **Nessuna mappa** — le coordinate `addressMap` esistono in CMS ma vengono usate solo come link esterno
- **Amenità senza icone** — lista testuale piatta, nessun riconoscimento visivo
- **Zero contenuti correlati** — nessun appartamento simile, mood, blog post o review

L'obiettivo è un redesign ispirato alla pulizia di "The Lords" (Plum Guide) e alla ricchezza editoriale del vecchio sito Acacia.

---

## Decisioni prese

| Decisione | Scelta | Motivazione |
|-----------|--------|-------------|
| Hero | Immagine singola cinematica (mantieni approccio attuale) | Impatto visivo forte, "What We Love" separata |
| Booking CTA | Sidebar layout (contenuto sx, sidebar sticky dx) | Pattern consolidato nell'hospitality, CTA sempre visibile |
| Sidebar impl | CTA nella sidebar → scrolla al widget Beddy in fondo | Sidebar leggera, no embed complesso, Beddy già integrato |
| Icone amenità | Mapping slug→icona Lucide | Richiede campo `slug` su Cuddle in DatoCMS |
| Contenuti correlati | Tutto in V1: simili + district + mood + reviews | Massimizzare tempo sulla pagina e cross-selling |
| Mappa | Google Maps embed statico (iframe, no API key) | Zero costi, nessuna configurazione API |
| What We Love | 2-5 foto da `featuredSlideshow` con layout adattivo | Già disponibile in CMS, caption da alt/title |

---

## Requirements

| ID | Requirement | Priorità |
|----|-------------|----------|
| R0 | Layout pulito con gerarchia visiva chiara e whitespace generoso | Core |
| R1 | Layout a sidebar: contenuto principale a sinistra (~65%), sidebar booking sticky a destra (~35%) | Core |
| R2 | Foto editoriali "What We Love" fuori dalla gallery (2-5, da `featuredSlideshow`) | Core |
| R3 | CIN/CIR visibili ma non invadenti (obbligo legale Italia) | Must |
| R4 | Sezione Home Truths — disclaimer onesti (`homeTruth` rich_text con Truth blocks) | Must |
| R5 | Amenità con icone (mapping slug→Lucide) e layout griglia categorizzato | Must |
| R6 | Mappa della zona — Google Maps embed statico dalle coordinate `addressMap` | Must |
| R7 | Contenuti correlati completi: appartamenti simili, mood, blog, district, reviews | Must |
| R8 | Sidebar leggera con stats + prezzo + CTA che scrolla al widget Beddy in fondo | Must |

---

## Shape CURRENT — Stato attuale

### Sezioni pagina (top to bottom, single column)

| # | Sezione | Componente | Dati queryati |
|---|---------|------------|---------------|
| 1 | Hero — featured image fullbleed + nome + category + claim + highlight | Inline JSX | `featuredImage`, `name`, `claim`, `category.name`, `highlight` |
| 2 | Quick Facts — bedrooms/bathrooms/sleeps centrati | Inline JSX | `bedrooms`, `bathrooms`, `sleeps` |
| 3 | Description — testo markdown | `HtmlContent` | `description` (markdown: true) |
| 4 | Gallery — griglia + lightbox | `ImageGallery` | `gallery` (GalleryImages) |
| 5 | Amenities — cuddles lista + ups pill | `CuddlesList` + `UpsList` | `cuddles`, `ups` |
| 6 | Info Detail — testo + indirizzo + link mappa | `InfoDetail` | `infoDetail` (union InfoText/InfoAddress) |
| 7 | District Link — callout testuale minimalista | `DistrictLink` | `district.name`, `district.slug` |
| 8 | Beddy Widget — booking su sfondo scuro | `BeddyBar` | `beddyId` |

### Cosa manca nel CURRENT

- Nessuna sidebar booking (CTA solo in fondo)
- `featuredSlideshow` non queryato → nessun "What We Love"
- `homeTruth` non queryato → nessun Home Truths
- `cin` non queryato → nessun CIN/CIR
- `price` non queryato → nessun prezzo visibile
- `acaciaReward` non queryato → nessun badge qualità
- Nessuna query Guestbook → nessuna review
- Nessuna query Post/Mood correlati → nessun contenuto correlato
- `addressMap` queryato ma usato solo come link, nessun embed mappa
- Cuddles senza icone (solo testo)

---

## Shape A — Redesign completo

### Layout

Two-column responsive:
- **Desktop:** contenuto main (~65%) + sidebar sticky (~35%), max-w-7xl
- **Tablet:** sidebar collassa sotto l'hero come barra compatta
- **Mobile:** sidebar diventa bottom bar fissa (stats + CTA)

### Sezioni pagina (top to bottom)

| # | Sezione | Dati CMS | Colonna | Componente |
|---|---------|----------|---------|------------|
| 1 | **Hero** — featured image fullbleed + nome + category + claim | `featuredImage`, `name`, `claim`, `category.name` | Full width | Inline JSX (refactor attuale) |
| 2 | **Description** — testo markdown editoriale | `description` (markdown: true) | Main | `HtmlContent` (esistente) |
| 3 | **What We Love** — 2-5 foto editoriali con caption | `featuredSlideshow` (gallery nativa) | Main | **Nuovo: `WhatWeLove`** |
| 4 | **Gallery** — griglia thumbnail + lightbox | `gallery` (GalleryImages links) | Main | `ImageGallery` (esistente) |
| 5 | **Amenities** — icone in griglia + pill lifestyle | `cuddles` (con slug→icona), `ups` | Main | `CuddlesList` (redesign) + `UpsList` |
| 6 | **Home Truths** — disclaimer onesti in lista | `homeTruth` (rich_text, Truth blocks) | Main | **Nuovo: `HomeTruths`** |
| 7 | **Details & Location** — info blocks + mappa Google embed | `infoDetail`, `addressMap` | Main | `InfoDetail` (upgrade) + **Nuovo: `MapEmbed`** |
| 8 | **District** — callout editoriale con immagine quartiere | `district.name`, `district.slug`, `district.gallery[0]` | Full width | `DistrictLink` (upgrade con immagine) |
| 9 | **Reviews** — quote ospiti dal Guestbook | `allGuestbooks(filter: apartment)` | Full width | **Nuovo: `ReviewsList`** |
| 10 | **Related** — appartamenti simili + mood + blog | Query multiple | Full width | **Nuovo: `RelatedContent`** |
| 11 | **Beddy Widget** — sezione scura con booking completo | `beddyId` | Full width | `BeddyBar` (esistente) |
| 12 | **CIN/CIR** — small print legale | `cin` | Footer area | Inline JSX |
| — | **Sidebar** (sticky) — stats + prezzo + CTA "Prenota" | `bedrooms`, `bathrooms`, `sleeps`, `price`, `highlight` | Sidebar | **Nuovo: `BookingSidebar`** |

### Sidebar — Dettaglio

```
┌─────────────────────┐
│  highlight badge     │  ← acaciaReward / highlight pill
│                      │
│   3        2      6  │  ← bedrooms / bathrooms / sleeps
│  camere  bagni ospiti│
│                      │
│  ─────────────────── │
│  da €150/notte       │  ← price
│                      │
│  ┌─────────────────┐ │
│  │   Prenota ora   │ │  ← scroll to #beddy-widget
│  └─────────────────┘ │
└─────────────────────┘
```

Sticky con `position: sticky; top: calc(var(--header-height) + 2rem)`. Su mobile: bottom bar fissa con prezzo + CTA.

### What We Love — Layout adattivo

| Foto | Layout |
|------|--------|
| 2 | Due colonne uguali |
| 3 | Una grande + due piccole (masonry) |
| 4 | Griglia 2×2 |
| 5 | Una grande in alto + quattro piccole sotto |

Ogni foto mostra la caption (da `alt` o `title` del FileField) come overlay o didascalia sotto.

### Home Truths — Formato

Lista di "verità oneste" dall'appartamento. Ogni Truth block ha un campo `body` (testo). Renderizzato come lista con icona info/alert, tono trasparente e amichevole. Pattern editoriale preso dal vecchio sito Acacia e da Plum Guide.

### Reviews (Guestbook) — Query

```graphql
query ApartmentReviews($apartmentId: ItemId!) {
  allGuestbooks(
    filter: { apartment: { eq: $apartmentId }, published: { eq: true } }
    orderBy: date_DESC
    first: 6
  ) {
    id
    name
    title
    quote
    date
  }
}
```

Layout: carousel orizzontale di card con quote, nome ospite e data. Design editoriale con virgolette decorative.

### Related Content — Queries

**Appartamenti simili** — stessa category, escludi corrente:
```graphql
query SimilarApartments($locale: SiteLocale!, $categoryId: ItemId!, $excludeId: ItemId!) {
  allApartments(
    locale: $locale
    filter: { category: { eq: $categoryId }, id: { neq: $excludeId }, published: { eq: true } }
    first: 3
  ) {
    ...ApartmentCardFragment
  }
}
```

**Blog posts correlati** — via `relatedApartments`:
```graphql
query RelatedPosts($locale: SiteLocale!, $apartmentId: ItemId!) {
  allPosts(
    locale: $locale
    filter: { relatedApartments: { anyIn: [$apartmentId] } }
    first: 3
  ) {
    id
    title
    slug
    abstract(locale: $locale, markdown: true)
    featuredImage { responsiveImage { ...ResponsiveImageFragment } }
  }
}
```

**Mood correlati** — inverso via boxes.object (query tutti i mood, filtra client-side per ora):
```graphql
query RelatedMoods($locale: SiteLocale!) {
  allMoods(locale: $locale, first: 20) {
    ...MoodCardFragment
    boxes {
      object {
        __typename
        ... on ApartmentRecord { id }
      }
    }
  }
}
```

### Mappa — Implementazione

Google Maps embed statico via iframe, nessuna API key richiesta:
```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d{longitude}!3d{latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1"
  width="100%"
  height="300"
  style="border:0"
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

Coordinate prese da `addressMap.latitude` / `addressMap.longitude` (già queryato in `InfoAddressFragment`).

---

## Inventario dati CMS

### Campi Apartment già in DatoCMS, NON queryati attualmente

| Campo CMS | Campo GraphQL | Tipo | Uso nel redesign |
|-----------|---------------|------|------------------|
| `cin` | `cin` | string | Codice CIN/CIR legale (sezione 12) |
| `home_truth` | `homeTruth` | rich_text (Truth blocks con `body` text), localizzato | Home Truths (sezione 6) |
| `featured_slideshow` | `featuredSlideshow` | gallery nativa (FileField[]) | What We Love (sezione 3) |
| `price` | `price` | string | Prezzo indicativo in sidebar |
| `acacia_reward` | `acaciaReward` | boolean | Badge qualità in sidebar |

Tutti verificati in `src/lib/datocms/cma-types.ts` e `schema.graphql`. Zero lavoro CMS necessario per aggiungerli alla query.

### Modelli per contenuti correlati (esistenti)

| Modello | ID DatoCMS | Campi rilevanti | Stato |
|---------|------------|-----------------|-------|
| Guestbook | 2804 | `name`, `title`, `quote`, `date`, `apartment` (link), `published` | Serve solo query GraphQL |
| Post | 2762 | `title`, `slug`, `featuredImage`, `abstract`, `relatedApartments` (links) | Serve solo query GraphQL |
| Mood | 2738 | `name`, `claim`, `slug`, `image` | Serve query + filtro client |

### Campi già queryati e usati

| Campo | Componente attuale | Note |
|-------|-------------------|------|
| `featuredImage` | Hero inline | OK, nessuna modifica |
| `name`, `claim`, `category.name` | Hero inline | OK |
| `highlight` | Hero inline (pill) | Spostare in sidebar |
| `bedrooms`, `bathrooms`, `sleeps` | Quick Facts inline | Spostare in sidebar |
| `description` | `HtmlContent` | OK |
| `gallery` | `ImageGallery` | OK |
| `cuddles` | `CuddlesList` | Redesign per icone |
| `ups` | `UpsList` | OK |
| `infoDetail` (union) | `InfoDetail` | Upgrade con mappa embed |
| `district.name`, `district.slug` | `DistrictLink` | Upgrade con immagine |
| `beddyId` | `BeddyBar` | OK, aggiungere `id="beddy-widget"` |

### Gap CMS (richiede modifica schema DatoCMS)

| Cosa | Modifica | Lavoro stimato |
|------|----------|----------------|
| Icone Cuddle | Aggiungere campo `slug` (string) al modello Cuddle (ID: 110157) | Migration DatoCMS + popolare ~20-30 slug |

Il mapping slug→icona Lucide vivrà in un file di configurazione TypeScript (`src/lib/cuddle-icons.ts`), non nel CMS. Esempio:

```ts
import { Wifi, AirVent, Coffee, Tv, ... } from 'lucide-react';

export const cuddleIcons: Record<string, LucideIcon> = {
  'wifi': Wifi,
  'air-conditioning': AirVent,
  'coffee-machine': Coffee,
  'smart-tv': Tv,
  // ...
};
```

---

## File critici da modificare

### Modifiche a file esistenti

| File | Modifica |
|------|----------|
| `src/app/[locale]/florence/accommodations/[slug]/page.tsx` | Riscrittura completa: nuovo layout two-column, query espansa, composizione sezioni |
| `src/components/CuddlesList/index.tsx` | Redesign totale: aggiungere `slug` al fragment, icone Lucide, layout griglia |
| `src/components/InfoDetail/index.tsx` | Aggiungere mappa embed inline per InfoAddressRecord |
| `src/components/DistrictLink/index.tsx` | Upgrade: aggiungere immagine quartiere, layout editoriale |
| `src/components/ImageGallery/fragment.ts` | Potrebbe servire refactor per separare "What We Love" dalla gallery principale |

### Nuovi componenti da creare

| Componente | Path | Tipo | Responsabilità |
|------------|------|------|----------------|
| `BookingSidebar` | `src/components/BookingSidebar/index.tsx` | Client (`'use client'`) | Stats + prezzo + CTA scroll, sticky desktop, bottom bar mobile |
| `WhatWeLove` | `src/components/WhatWeLove/index.tsx` | Server | 2-5 foto editoriali con caption, layout adattivo |
| `HomeTruths` | `src/components/HomeTruths/index.tsx` | Server | Lista Truth blocks con icona |
| `ReviewsList` | `src/components/ReviewsList/index.tsx` | Server | Card quote dal Guestbook |
| `RelatedContent` | `src/components/RelatedContent/index.tsx` | Server | Griglia mista: appartamenti + mood + blog |
| `MapEmbed` | `src/components/MapEmbed/index.tsx` | Server | Google Maps iframe da coordinate |

### File di supporto

| File | Scopo |
|------|-------|
| `src/lib/cuddle-icons.ts` | Mapping slug→icona Lucide |

---

## Vertical Slices suggeriti

Ordine di implementazione per demo incrementali:

| Slice | Contenuto | Demo-abile |
|-------|-----------|------------|
| **S1** | Sidebar layout + BookingSidebar + spostamento stats/prezzo | Si vede subito il nuovo layout |
| **S2** | What We Love (query `featuredSlideshow` + componente) | Sezione editoriale nuova |
| **S3** | Home Truths (query `homeTruth` + componente) | Contenuto onesto, differenziante |
| **S4** | Mappa embed (upgrade InfoDetail + MapEmbed) | Valore funzionale immediato |
| **S5** | Reviews/Guestbook (query + ReviewsList) | Social proof |
| **S6** | Cuddles con icone (migration slug + mapping + redesign) | Richiede lavoro CMS |
| **S7** | Related content (query multiple + RelatedContent) | Cross-selling completo |
| **S8** | CIN/CIR + polish finale + responsive | Compliance + QA |

---

## Rischi e rabbit holes

| Rischio | Mitigazione |
|---------|-------------|
| Sidebar sticky + header fisso = conflitti z-index/scroll | Testare subito con `position: sticky` e `top: calc(var(--header-height) + 2rem)` |
| Bottom bar mobile potrebbe coprire contenuto | Aggiungere `pb-[80px]` al main content su mobile |
| Query Mood correlati inefficiente (fetch tutti, filtra client) | Accettabile con <50 mood totali; ottimizzare dopo se necessario |
| Google Maps embed potrebbe essere bloccato da ad-blocker | Fallback: link testuale a Google Maps (già presente) |
| Campo `slug` Cuddle richiede popolamento manuale | Creare script DatoCMS per auto-generare slug da nome |
| `homeTruth` è rich_text con Truth blocks — struttura da verificare | Verificare schema Truth block prima di S3 |

---

## No-go (fuori scope)

- Embed del widget Beddy nella sidebar (troppo complesso, Beddy resta in fondo)
- Mappa interattiva con Google Maps API (costi, configurazione)
- Sistema di recensioni interno (si usa solo il Guestbook DatoCMS)
- Calendario disponibilità (gestito da Beddy)
- Comparatore appartamenti
- Virtual tour / 360°
