---
shaping: true
---

# Acacia Firenze Rebuild — Slices

Fonte: [init-shaping.md](init-shaping.md)

---

## Dipendenze tra slice

```
V1 (Foundation + Design System + Home)
 ├── V2 (Apartments) ── dipende da V1 per ApartmentCard, BeddyBar, HtmlContent, design system
 │    ├── V3 (Districts) ── dipende da V2 per apartment detail links
 │    └── V4 (Moods) ── dipende da V2 per ApartmentCard
 └── V5 (SEO + Draft Mode) ── dipende da tutte le pagine esistenti
```

V3 e V4 sono indipendenti tra loro e possono essere sviluppati in parallelo dopo V2.

---

## V1: Foundation + Design System + Home Page

**Demo:** Home page visibile in `/en` e `/it` con look & feel del sito attuale tradotto in Tailwind, Beddy widget, appartamenti in evidenza, sezione moods.

### Design System — Brand Acacia in Tailwind

Estratto dal sito corrente. Configurazione Tailwind con design tokens.

**Colori:**

| Token | Valore | Uso |
|-------|--------|-----|
| `primary` | `#C58049` (rust) | Header bg, accenti, CTA |
| `secondary` | `#48a3c7` (cyan) | Badge highlight, link hover |
| `body` | `#6D6E77` (gray-dark) | Testo base |
| `body-light` | `#66656b` (gray) | Testo secondario |
| `heading` | `#393948` (black) | Titoli, bordi |
| `cream` | `#f1efec` | Background sezioni, footer menu |
| `beige` | `#cdc0b0` | Accenti decorativi |
| `gold` | `#E8A10A` | Accenti premium |
| `salvia` | `#7e836c` (green) | Accenti natura |
| `purple` | `#7d3c4f` | Accenti decorativi |
| `alert` | `#b62c3b` (red) | Errori |
| `notice` | `#e9604b` (orange) | Warning |

**Tipografia:**

| Ruolo | Font | Peso | Uso |
|-------|------|------|-----|
| Heading | Source Sans Pro | 200 (ultralight) | Titoli principali — carattere leggero ed elegante |
| Serif | Cormorant Garamond | 300/600, italic 300/600 | Claim, citazioni, testo editoriale |
| Body | Lato | 400/900 | Testo corpo, navigazione, labels |

**Dimensioni testo:**

| Token | Size |
|-------|------|
| `huge` | 50px |
| `alpha` | 35px |
| `beta` | 30px |
| `gamma` | 26px |
| `delta` | 20px |
| `base` | 15px |
| `small` | 13px |
| `milli` | 12px |

**Breakpoint:**

| Nome | Width | Mapping Tailwind |
|------|-------|-----------------|
| palm | 0px | default (mobile-first) |
| tab | 480px | `sm` |
| lap | 720px | `md` |
| desk | 1024px | `lg` |
| wall | 1500px | `xl` |

**Spacing:** Unità base `12px`, multipli: 1× (12px), 2× (24px), 3× (36px), 5× (60px), 8× (96px)

**Patterns chiave dal sito attuale:**

- Header: sfondo `primary` semi-trasparente (`rgba(primary, 0.7)`), posizionato `absolute` sopra l'hero, testo bianco uppercase bold small
- Logo: blocco con sfondo `primary` pieno, posizionato sopra l'header
- Footer: due fasce — menu su sfondo `cream`, info su sfondo `heading` (scuro) con testo bianco
- Card (box): hover con scale immagine 1.3×, transizione 0.5s, bordo inferiore punteggiato, hover sfondo `cream`
- Badge: sfondo `secondary`, testo bianco uppercase, border-radius 5px, piccola ombra
- Line-height corpo: 1.5

### Cosa si costruisce

| Affordance | Tipo | Dettaglio |
|------------|------|-----------|
| Tailwind + design tokens | Non-UI | Installazione Tailwind CSS, configurazione con tutti i token sopra (colori, font, spacing, breakpoint). Google Fonts per Lato, Source Sans Pro, Cormorant Garamond. Rimozione CSS puro template |
| Layout con `[locale]` | UI | Root layout con segmento `[locale]`, `generateStaticParams` per `['en', 'it']` |
| `<SiteHeader>` | UI | Header con navigazione: logo Acacia, menu items (Accommodations, Districts, Moods), language switcher EN/IT. Sfondo primary semi-trasparente, testo bianco uppercase |
| `<SiteFooter>` | UI | Footer a due fasce: sezione menu (sfondo cream) + sezione info/credits (sfondo scuro). Contatti, social links, legal |
| `<BeddyBar>` | UI | Client component wrapper per `<beddy-bar>`, props: `lang`, `widgetCode`. Script CDN via `next/script` nel layout |
| `<HtmlContent>` | UI | Wrapper per `dangerouslySetInnerHTML`, usato per campi testo legacy. Stili tipografici per il contenuto HTML (heading, paragrafi, liste) |
| `<ApartmentCard>` | UI | Card: immagine responsive con hover scale, nome (font heading ultralight), claim (font serif italic), tipologia (bold small uppercase), badges (sfondo cyan). Bordo inferiore punteggiato, hover sfondo cream |
| `<MoodCard>` | UI | Card mood con immagine, nome, link alla pagina mood |
| Home page | UI | Query `HomePage` model: hero con BeddyBar (widgetcode da `HomePage.beddyId`), sezione promo apartments (via PromoApartment blocks → `<ApartmentCard>`), sezione moods (`<MoodCard>`), footer |

### Parts di Shape A coperte
A1 (routing), A2 (home), A9 (tailwind), A10 (beddy), A11 (htmlcontent)

### Requisiti soddisfatti dopo V1
- R2 (bilingue) — parziale, struttura routing pronta
- R3 (beddy) — parziale, widget home funzionante
- R7 (immagini responsive) — infrastruttura pronta
- R8 (html legacy) — componente pronto

---

## V2: Apartments (Listing + Detail)

**Demo:** Navigazione completa degli appartamenti: listing con filtro tipologia → detail con galleria, amenities, Beddy.

### Cosa si costruisce

| Affordance | Tipo | Dettaglio |
|------------|------|-----------|
| Apartments listing page | UI | Route `/[locale]/florence/accommodations`. Server component: query `allApartments` + `allApartmentCategories` + `pageApartments` (titolo/sottotitolo). Grid di `<ApartmentCard>`. BeddyBar con `HomePage.beddyId` |
| `<CategoryFilter>` | UI | Client component: bottoni per tipologia (Studio, 1BR–4BR, Villa, All). Stile: pill/bottoni con bordo, attivo con sfondo primary. Filtra la lista client-side |
| Apartment detail page | UI | Route `/[locale]/florence/accommodations/[slug]`. Query con relazioni: district, category, gallery, cuddles, ups, infoDetail |
| `<ImageGallery>` | UI | Galleria: featured image cliccabile → slideshow con swiper/carousel. Lazy loading. Immagini responsive via DatoCMS |
| `<CuddlesList>` | UI | Lista amenities/cuddles con nome. Font serif per titolo sezione |
| `<UpsList>` | UI | Lista lifestyle features (highlights). Font serif per titolo sezione |
| `<InfoDetail>` | UI | Rendering blocks `InfoText` (label + testo) e `InfoAddress` (label + indirizzo/mappa). Dati da `Apartment.infoDetail` |
| `<DistrictLink>` | UI | Sezione "Get lost in [District]" con link alla pagina quartiere. Font heading, stile editoriale |
| BeddyBar (apartment) | UI | `<BeddyBar>` con `Apartment.beddyId`, mostrato solo se presente |

### Parts di Shape A coperte
A3 (listing), A4 (detail)

### Requisiti soddisfatti dopo V2
- R0 (core goal) — turista può navigare appartamenti e prenotare
- R1.2 (listing con filtro) — completo
- R1.3 (detail completo) — completo
- R3 (beddy) — completo, entrambi i widget funzionanti

---

## V3: Districts

**Demo:** Browsing quartieri: listing → detail con descrizione e appartamenti del quartiere.

### Cosa si costruisce

| Affordance | Tipo | Dettaglio |
|------------|------|-----------|
| Districts listing page | UI | Route `/[locale]/florence/districts`. Query `allDistricts` + `pageDistricts`. Grid di `<DistrictCard>` |
| `<DistrictCard>` | UI | Card quartiere: immagine con hover scale, nome (heading ultralight). Fragment colocato. Stile coerente con ApartmentCard |
| District detail page | UI | Route `/[locale]/florence/districts/[slug]`. Query district + `allApartments(filter: {district: {eq: ID}})` |
| District gallery | UI | Galleria immagini del quartiere (riuso `<ImageGallery>` o griglia semplificata) |
| Appartamenti del quartiere | UI | Griglia di `<ApartmentCard>` filtrati per district |

### Parts di Shape A coperte
A5 (districts)

### Requisiti soddisfatti dopo V3
- R1.4 (quartieri listing + detail) — completo

---

## V4: Moods

**Demo:** Browsing moods: listing → detail con appartamenti associati al mood.

### Cosa si costruisce

| Affordance | Tipo | Dettaglio |
|------------|------|-----------|
| Moods listing page | UI | Route `/[locale]/moods`. Query `allMoods` + `pageMoods`. Grid di `<MoodCard>` (già creata in V1) |
| Mood detail page | UI | Route `/[locale]/moods/[slug]`. Query mood con `boxes.object` |
| `moodApartments` adapter | Non-UI | `src/lib/datocms/adapters/moodApartments.ts` — estrae `ApartmentRecord` da `MoodItems.object[]`, unico punto di contatto con struttura legacy |
| Appartamenti del mood | UI | Griglia di `<ApartmentCard>` filtrati dall'adapter |

### Parts di Shape A coperte
A6 (moods)

### Requisiti soddisfatti dopo V4
- R1.5 (mood listing + detail) — completo

---

## V5: SEO + Draft Mode + Polish

**Demo:** Sito production-ready: meta tags su tutte le pagine, preview funzionante da DatoCMS, sitemap.

### Cosa si costruisce

| Affordance | Tipo | Dettaglio |
|------------|------|-----------|
| SEO meta tags | Non-UI | `_seoMetaTags` query su tutte le pagine, rendering via `renderMetaTags` di react-datocms |
| hreflang tags | Non-UI | Tag `<link rel="alternate" hreflang="...">` su ogni pagina, puntano alla versione nell'altra lingua |
| Canonical URLs | Non-UI | `<link rel="canonical">` su ogni pagina |
| Sitemap | Non-UI | `sitemap.xml` generato da Next.js con tutte le pagine in entrambe le lingue |
| `recordInfo.ts` completo | Non-UI | Mapping URL per tutti i modelli: Apartment, District, Mood. Usato da Web Previews e SEO Analysis plugin |
| Content-link overlays | UI | Estensione degli overlay click-to-edit a tutti i componenti (draft mode) |
| Olark widget | UI | Script embed nel layout, equivalente all'attuale |

### Parts di Shape A coperte
A7 (draft mode), A8 (cache), parte di A1 (SEO routing)

### Requisiti soddisfatti dopo V5
- R1.1 (home completa) — completo con SEO
- R2 (bilingue) — completo con hreflang
- R4 (draft mode + visual editing) — completo
- R5 (ISR + cache) — verificato end-to-end
- R6 (SEO) — completo

---

## Riepilogo

| Slice | Demo | Parts | Effort stimato |
|-------|------|-------|----------------|
| **V1** | Home page bilingue con design system Acacia | A1, A2, A9, A10, A11 | ~4 giorni |
| **V2** | Apartments listing + detail | A3, A4 | ~3 giorni |
| **V3** | Districts listing + detail | A5 | ~1 giorno |
| **V4** | Moods listing + detail + adapter | A6 | ~1 giorno |
| **V5** | SEO, Draft Mode, polish | A7, A8 | ~1 giorno |

**Totale: ~10 giorni lavorativi = 2 settimane**
