---
shaping: true
---

# CMS Realignment — Shaping

Adattare il frontend ai cambiamenti drastici dello schema DatoCMS: rinomina modelli, nuovi blocchi (Button, Hero, Menu), nuovo singleton App.

---

## Requirements (R)

| ID  | Requirement                                                                                                                                   | Status    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| R0  | La build deve passare senza errori dopo le modifiche CMS                                                                                      | Core goal |
| R1  | La pagina Accommodations index deve funzionare con il modello rinominato `index_apartment` (ex `page_apartments`)                             | Must-have |
| R2  | L'hero della home page deve supportare i `ButtonBlock` dal CMS (primary/secondary/tertiary) al posto dei CTA hardcoded                        | Must-have |
| R3  | Il `HeroBlock` (header + image + buttons) deve essere utilizzabile come componente riusabile anche nella pagina Accommodations                | Must-have |
| R4  | La navigazione (SiteHeader) deve essere guidata dal CMS tramite il modello `App.navItems` (MenuItem, MenuExternalItem, MenuDropdown)          | Must-have |
| R5  | Il footer (SiteFooter) deve essere guidato dal CMS tramite `App.footerLinks`, `App.footerText`, `App.legalText`, `App.socialLinks`            | Must-have |
| R6  | Il `ButtonBlock.url` (JSON link field) deve gestire sia link interni che esterni                                                              | Must-have |
| R7  | Il `ButtonBlock.style` deve mappare a varianti visive coerenti col design system (primary=rust filled, secondary=outline, tertiary=text link) | Must-have |
| R8  | Le pagine non toccate (districts, moods, apartment detail) non devono rompersi                                                                | Must-have |

---

## Shape A: Tre slice incrementali

### A1: Fix rinomina + sblocca build

| Part | Mechanism                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| A1.1 | Rinomina `pageApartments` → `indexApartment` in tutte le query GraphQL (`page.tsx` meta + data)                           |
| A1.2 | Rinomina `pageApartments` → `indexApartment` in `AccommodationsContent.tsx` (destructuring + tutti i riferimenti nel JSX) |
| A1.3 | Aggiorna `recordInfo.ts` se necessario (verifica item type ID per index_apartment)                                        |
| A1.4 | Rigenera `graphql-env.d.ts` via `npx gql.tada generate output`                                                            |
| A1.5 | Verifica build pulita                                                                                                     |

### A2: ButtonBlock + HeroBlock nel frontend

| Part | Mechanism                                                                                                                                                                                    | Flag |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| A2.1 | Nuovo componente `Button` con fragment `ButtonBlockFragment` — renderizza `<Link>` o `<a>` in base a `url` (JSON: internal vs external), stile da `style` field (primary/secondary/tertiary) |      |
| A2.2 | Aggiorna `Hero` per accettare `buttons: ButtonBlock[]` al posto di `ctaLabel/ctaUrl/ctaSecondaryLabel/ctaSecondaryUrl`                                                                       |      |
| A2.3 | Aggiorna query `HomeQuery` — fetch `homePage.buttons` con `ButtonBlockFragment`, rimuovi `ctaLabel`/`ctaText` se non più necessari                                                           |  ⚠️  |
| A2.4 | Aggiorna `HomeContent` per passare `buttons` al `Hero`                                                                                                                                       |      |
| A2.5 | Opzionale: pagina Accommodations usa `HeroBlock` (sections) da `IndexApartmentRecord` al posto dell'hero inline attuale                                                                      |  ⚠️  |

**Flag notes:**

- A2.3 ⚠️: Verificare se `ctaLabel`/`ctaText`/`ctaImage` esistono ancora su `HomePageRecord` o se sono stati sostituiti. Dallo schema attuale: `ctaImage`, `ctaLabel`, `ctaText` esistono ancora → coesistenza. Decidere se usare `buttons` o mantenere i vecchi campi.
- A2.5 ⚠️: `IndexApartmentRecord.sections` è `[HeroBlockRecord!]!` — l'hero potrebbe venire da lì. Verificare se il contenuto è stato popolato nel CMS.

### A3: Nav e footer dal CMS (modello App)

| Part | Mechanism                                                                                                                                                                                                    | Flag |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: |
| A3.1 | Query `App` singleton nel locale layout — fetch `navItems`, `footerLinks`, `footerText`, `legalText`, `socialLinks`, `calloutText`, `calloutBackground`                                                      |      |
| A3.2 | Aggiorna `SiteHeader` per ricevere `navItems` come prop — renderizza `MenuItem` (link interni), `MenuExternalItem` (link esterni), `MenuDropdown` (dropdown con sotto-pagine). Elimina array `nav` hardcoded |      |
| A3.3 | Gestione `MenuDropdown` in SiteHeader — desktop: hover dropdown, mobile: espandibile                                                                                                                         |  ⚠️  |
| A3.4 | Aggiorna `SiteFooter` per ricevere `footerLinks` (array di `FooterMenuBlock` con `widgetLabel` + `navLinks`), `footerText` (structured text), `legalText`, `socialLinks` come props                          |      |
| A3.5 | Renderizza `socialLinks` con icone Lucide (`iconName` field → componente Lucide dinamico)                                                                                                                    |      |
| A3.6 | Callout banner opzionale — `calloutText` + `calloutBackground` (ColorField) — barra sopra l'header o nel footer                                                                                              |  ⚠️  |

**Flag notes:**

- A3.3 ⚠️: Design del dropdown menu da definire — va breadboardato
- A3.6 ⚠️: Posizione e design del callout da decidere

---

## Fit Check: R × A

| Req | Requirement                                   | Status    | A   |
| --- | --------------------------------------------- | --------- | --- |
| R0  | Build passa senza errori                      | Core goal | ✅  |
| R1  | Accommodations funziona con `index_apartment` | Must-have | ✅  |
| R2  | Hero supporta ButtonBlock dal CMS             | Must-have | ✅  |
| R3  | HeroBlock riusabile anche per Accommodations  | Must-have | ❌  |
| R4  | Nav guidata dal CMS (App.navItems)            | Must-have | ✅  |
| R5  | Footer guidato dal CMS (App.footerLinks etc.) | Must-have | ✅  |
| R6  | ButtonBlock gestisce link interni/esterni     | Must-have | ✅  |
| R7  | ButtonBlock stili coerenti col design system  | Must-have | ✅  |
| R8  | Pagine non toccate non si rompono             | Must-have | ✅  |

**Notes:**

- R3 ❌: A2.5 è flaggato — serve verificare se `IndexApartmentRecord.sections` è popolato nel CMS e decidere se l'hero Accommodations viene dal `HeroBlock` o resta inline

---

## Slices

### V1 — Fix rinomina, sblocca build (A1)

**Scope:** Rinomina meccanica `pageApartments` → `indexApartment`. Zero cambiamenti visivi.

| File                                                                 | Cambiamento                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/app/[locale]/florence/accommodations/page.tsx`                  | Query `pageApartments` → `indexApartment` (meta + data) |
| `src/app/[locale]/florence/accommodations/AccommodationsContent.tsx` | Destructuring + JSX references                          |
| `src/lib/datocms/recordInfo.ts`                                      | Verificare/aggiornare item type ID se cambiato          |
| Rigenera types                                                       | `npx gql.tada generate output`                          |

**Demo:** Build passa, pagina Accommodations si carica correttamente.

---

### V2 — ButtonBlock + Hero CMS-driven (A2)

**Scope:** Nuovo componente `Button`, hero della home page usa `buttons` dal CMS.

| File                               | Cambiamento                                         |
| ---------------------------------- | --------------------------------------------------- |
| `src/components/Button/index.tsx`  | Nuovo componente + `ButtonBlockFragment`            |
| `src/components/Hero/index.tsx`    | Accetta `buttons` prop, depreca vecchie CTA props   |
| `src/app/[locale]/page.tsx`        | Query aggiunge `buttons { ...ButtonBlockFragment }` |
| `src/app/[locale]/HomeContent.tsx` | Passa `buttons` a `Hero`                            |

**Demo:** Home page hero mostra bottoni dal CMS con stili primary/secondary/tertiary.

**Da decidere prima:**

- Coesistenza `ctaLabel/ctaText` vs `buttons`: mantenere entrambi con fallback o migrare?
- Hero Accommodations: usa `HeroBlock` da `sections` o resta com'è?

---

### V3 — Nav e footer dal CMS (A3)

**Scope:** SiteHeader e SiteFooter leggono dati dal singleton `App`.

| File                                  | Cambiamento                                                         |
| ------------------------------------- | ------------------------------------------------------------------- |
| `src/app/[locale]/layout.tsx`         | Query `App` singleton, passa dati a header/footer                   |
| `src/components/SiteHeader/index.tsx` | Props `navItems`, renderizza MenuItem/MenuExternalItem/MenuDropdown |
| `src/components/SiteFooter/index.tsx` | Props `footerLinks`, `footerText`, `legalText`, `socialLinks`       |

**Demo:** Header e footer mostrano link e contenuti dal CMS, editabili da DatoCMS.

**Da decidere prima:**

- Design del MenuDropdown (desktop hover / mobile expand)
- Callout banner: dove e se includerlo

---

## Prossimi passi

1. **V1 subito** — fix meccanico, sblocca la build
2. **V2** — risolvere i flag (⚠️ A2.3, A2.5) prima di implementare
3. **V3** — risolvere i flag (⚠️ A3.3, A3.6) e fare design del dropdown prima di implementare
