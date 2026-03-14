---
shaping: true
---

# Acacia Firenze Rebuild — Shaping

Fonte: [pitches/init.md](init.md)

**Appetito:** 2 settimane, sviluppatore singolo + Claude Code
**Deploy:** Vercel free tier

---

## Requirements (R)

| ID     | Requirement                                                                                                                                | Status    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **R0** | Un turista può navigare appartamenti, quartieri e mood e arrivare alla prenotazione su Beddy                                               | Core goal |
| **R1** | **Pagine contenuto**                                                                                                                       | Must-have |
| R1.1   | Home page: hero con Beddy search widget, appartamenti in evidenza, sezione moods, footer                                                   | Must-have |
| R1.2   | Listing appartamenti con filtro client-side per tipologia (Studio, 1BR–4BR, Villa)                                                         | Must-have |
| R1.3   | Dettaglio appartamento: galleria, descrizione, amenities/cuddles, Beddy widget per prenotazione singola                                    | Must-have |
| R1.4   | Listing e dettaglio quartieri (con appartamenti del quartiere)                                                                             | Must-have |
| R1.5   | Listing e dettaglio mood (con appartamenti filtrati per mood)                                                                              | Must-have |
| **R2** | Sito bilingue EN/IT con URL locale-prefixed (`/en/...`, `/it/...`)                                                                         | Must-have |
| **R3** | Widget Beddy funzionanti: search generico (home/listing) + prenotazione singola (dettaglio)                                                | Must-have |
| **R4** | Content editor possono vedere bozze prima di pubblicare (Draft Mode + Visual Editing)                                                      | Must-have |
| **R5** | Aggiornamenti contenuto riflessi sul sito senza rebuild (ISR + cache tags)                                                                 | Must-have |
| **R6** | SEO: hreflang, canonical URLs, meta tags da DatoCMS, sitemap                                                                               | Must-have |
| **R7** | Immagini responsive con lazy loading e blur-up via DatoCMS image service                                                                   | Must-have |
| **R8** | I campi testo legacy (markdown/WYSIWYG) devono renderizzarsi correttamente, con approccio sostituibile quando si migrerà a Structured Text | Must-have |

---

## Decisioni prese

- **Styling**: Tailwind CSS (non CSS puro)
- **Routing locale**: segmento `[locale]` dinamico (no middleware, no edge functions)
- **Moods → Appartamenti**: usare MoodItems.object con adapter isolato (`src/lib/datocms/adapters/moodApartments.ts`). L'adapter estrae solo gli `ApartmentRecord` dalla union, i componenti a valle ricevono `Apartment[]` e non conoscono MoodItems. Quando DatoCMS cambia struttura, si tocca solo l'adapter. Struttura MoodItems da ripensare in ciclo futuro.

---

## Questioni risolte

### Q3: MoodItems — semplificato

Il campo `object` di MoodItems è una union legacy (`Apartment | Post | Service | Tip`). Questa struttura verrà sostituita in futuro. Per ora **evitiamo di sviluppare su MoodItems**: la pagina mood detail mostra gli appartamenti associati a quel mood tramite query inversa su Apartment, non tramite MoodItems.boxes.

**Implicazione**: il campo `Mood.boxes` viene ignorato. Serve verificare se esiste un campo su Apartment che linka ai Mood, o se la relazione è solo da Mood → MoodItems → Apartment (nel qual caso dovremo comunque leggere MoodItems.object filtrando solo per ApartmentRecord).

### Q4: HTML legacy — `dangerouslySetInnerHTML` con wrapper sostituibile

I campi `description`, `abstract`, `claim` ecc. si queryano con `markdown: true` → DatoCMS restituisce HTML. Si renderizzano con `dangerouslySetInnerHTML` (fonte trusted). Creiamo un componente `<HtmlContent html={...} />` wrapper che in futuro verrà sostituito con un renderer Structured Text.

### Q5: Beddy widget — risolto, nessuno spike necessario

Il widget Beddy è un **web component** standard (`<beddy-bar>`), non script injection nel DOM:

```html
<!-- Script CDN caricato una volta nel layout -->
<script defer src="https://cdn.beddy.io/bol/prod/beddybar.js?release13052020_v0"></script>

<!-- Uso come web component -->
<beddy-bar lang="en" widgetcode="BEDDY_ID_FROM_DATOCMS"></beddy-bar>
```

- **Home/Listing**: `widgetcode` = `HomePage.beddyId`
- **Apartment detail**: `widgetcode` = `Apartment.beddyId` (solo se presente)
- **Implementazione Next.js**: lo script va nel `<head>` via `next/script` con `strategy="lazyOnload"`. Il tag `<beddy-bar>` è un custom element HTML → funziona in server components senza problemi di hydration. Nessun workaround necessario.

### Q1: Tailwind CSS — confermato

Setup Tailwind con design tokens per brand Acacia. Il CSS puro del template viene rimosso.

### Q2: Routing `[locale]` — confermato

Segmento dinamico `[locale]` nel path. Nessun middleware. `generateStaticParams` per `['en', 'it']`.

---

## A: Rebuild completo Next.js + Tailwind + Vercel

| Part    | Mechanism                                                                                                                                                                                                | Flag |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| **A1**  | **Routing bilingue** — App Router con `[locale]` segmento dinamico, `generateStaticParams` per en/it, nessun middleware                                                                                  |      |
| **A2**  | **Home page** — Server component, query HomePage model (hero, moods links, promo apartments). `<beddy-bar>` con `HomePage.beddyId`. Sezione moods con cards linkate alle pagine mood                     |      |
| **A3**  | **Apartments listing** — Server component carica tutti ~40 appartamenti, client component per filtro tipologia via ApartmentCategory. `<beddy-bar>` con `HomePage.beddyId`                               |      |
| **A4**  | **Apartment detail** — Route `[slug]`, query con relazioni: district, gallery, cuddles, ups, infoDetail blocks. `<beddy-bar>` con `Apartment.beddyId` se presente                                        |      |
| **A5**  | **Districts listing + detail** — Route `[slug]`, detail mostra appartamenti del quartiere tramite query inversa (`allApartments(filter: {district: {eq: ID}})`)                                          |      |
| **A6**  | **Moods listing + detail** — Route `[slug]`, detail mostra appartamenti estratti da `Mood.boxes[].object` via adapter isolato che filtra per `ApartmentRecord`                                           |      |
| **A7**  | **Draft Mode + Visual Editing** — Infrastruttura già nel template (enable/disable endpoints, draft token, content-link overlays). Estendere `recordInfo.ts` con mapping URL per tutti i modelli in scope |      |
| **A8**  | **Cache invalidation** — Webhook `/api/invalidate-cache` già funzionante. Cache tag `datocms` invalida tutto. Sufficiente per ~50 pagine totali                                                          |      |
| **A9**  | **Tailwind setup** — Installazione Tailwind CSS, design tokens (colori brand, tipografia, spaziatura), rimozione CSS puro del template                                                                   |      |
| **A10** | **Beddy widget** — `next/script` per CDN script, componente `<BeddyBar>` che wrappa il web component `<beddy-bar>` con props lang/widgetcode                                                             |      |
| **A11** | **HtmlContent component** — Wrapper per `dangerouslySetInnerHTML`, usato per tutti i campi testo legacy. Sostituibile con Structured Text renderer in futuro                                             |      |

---

## Fit Check: R × A

| Req  | Requirement                                                | Status    | A   |
| ---- | ---------------------------------------------------------- | --------- | --- |
| R0   | Turista naviga e arriva a prenotazione Beddy               | Core goal | ✅  |
| R1.1 | Home page completa                                         | Must-have | ✅  |
| R1.2 | Listing appartamenti con filtro                            | Must-have | ✅  |
| R1.3 | Dettaglio appartamento completo                            | Must-have | ✅  |
| R1.4 | Quartieri listing + detail                                 | Must-have | ✅  |
| R1.5 | Mood listing + detail                                      | Must-have | ✅  |
| R2   | Bilingue EN/IT con locale URLs                             | Must-have | ✅  |
| R3   | Widget Beddy funzionanti                                   | Must-have | ✅  |
| R4   | Draft Mode + Visual Editing                                | Must-have | ✅  |
| R5   | ISR + cache tags                                           | Must-have | ✅  |
| R6   | SEO completo                                               | Must-have | ✅  |
| R7   | Immagini responsive                                        | Must-have | ✅  |
| R8   | Campi testo legacy renderizzati con approccio sostituibile | Must-have | ✅  |

**Notes:**

- Tutti i requisiti soddisfatti. Shape A non ha flag ⚠️ aperti.

---

## Slicing

Shape A selezionata e sliced in 5 incrementi verticali → [init-slices.md](init-slices.md)
