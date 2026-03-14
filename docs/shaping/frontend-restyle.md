---
shaping: true
---

# Frontend Restyle — Shaping

## Frame

### Source

> "Mi piace molto il mood e altri aspetti di alcuni siti editoriali di lusso — seguendo quelle tracce, e mantenendo il colore principale di acacia (rusty) e la font sans serif scelta, voglio valutare un completo restyle dell'esistente."
>
> "Voglio assolutamente lasciare Playfair per tutti i grandi messaggi di header e sections."
>
> "Sullo scope direi B perché al momento la struttura è fatta totalmente a caso. Va rifatto header, menu, hero, card, sezioni di highlight, tutto."
>
> "C'è un aspetto molto umano nella gestione di Acacia, è una piccola azienda che coccola i clienti e che offre un servizio attento, belle case. Per questo — anche se certi siti di riferimento sono sicuramente più grandi e di livello superiore — però in piccolo Acacia ci si avvicina."
>
> "Lavoro da giorni ma se necessario più tempo. Voglio strutturare uno shaping completo che tu possa seguire nel tempo. Molti componenti ancora non ci sono."
>
> "Lato CMS è possibile far arrivare elementi `<em>` in mezzo a stringhe di testo, quindi quel tipo di effetto sui titoli è possibile. Potrebbe essere una vivacizzazione editoriale simile."
>
> "Partirei sicuramente da hero, per poi passare al menu. La parte responsive in generale è fondamentale, perché la maggior parte delle visite arrivano da mobile."

### Problem

Il frontend attuale è privo di struttura sistematica: layout improvvisati, gerarchia visiva debole, componenti di base che non esprimono l'identità di Acacia. Il sito non comunica la qualità curatoriale del brand né il carattere umano e attento del servizio. Mancano interi pattern di componenti.

### Outcome

Un sistema visivo coerente e un set di componenti che comunichino **"lusso curato con calore umano"** — fiducia editoriale alla scala e con la personalità di Acacia Firenze. Il risultato deve essere implementabile in modo incrementale, componente per componente, mantenendo il sito funzionante durante la transizione.

---

## Requirements (R)

| ID  | Requirement                                                                                                             | Status    |
| --- | ----------------------------------------------------------------------------------------------------------------------- | --------- |
| R0  | Il nuovo frontend trasmette "curato, umano, caldo" — qualità editoriale a scala boutique                                | Core goal |
| R1  | Playfair Display per tutti i momenti headline/sezione; Lato per body e UI                                               | Must-have |
| R2  | Rust (#D0512A) come unico accent, usato con parsimonia — mai come sfondo di aree grandi                                 | Must-have |
| R3  | Fotografia protagonista — le immagini respirano, non sono compresse                                                     | Must-have |
| R4  | Navigazione minimalista: pochi link, peso visivo quasi zero, scroll-aware                                               | Must-have |
| R5  | Sistema di whitespace deliberato — lo spazio vuoto è scelta, non assenza                                                | Must-have |
| R6  | Tutti i contenuti arrivano da DatoCMS — il design deve adattarsi a contenuti variabili                                  | Must-have |
| R7  | Sito bilingue EN/IT — il sistema deve funzionare ugualmente in entrambe le lingue                                       | Must-have |
| R8  | Implementazione incrementale — ogni componente può essere rilasciato indipendentemente                                  | Must-have |
| R9  | Il calore umano di Acacia rimane distinguibile — non freddo, non corporate                                              | Must-have |
| R10 | 🟡 Mobile-first critico — la maggior parte delle visite è da mobile. Ogni componente si disegna prima a 375px           | Must-have |
| R11 | 🟡 `<em>` nei titoli da CMS — Playfair italic inline in stringhe di testo reso da DatoCMS (già supportato tecnicamente) | Must-have |

---

## CURRENT: Stato attuale (inventario componenti)

### Componenti esistenti

| Componente        | Stato          | Note                                              |
| ----------------- | -------------- | ------------------------------------------------- |
| SiteHeader        | Da ridisegnare | Fixed scroll-aware ok, ma struttura va rinforzata |
| SiteFooter        | Da ridisegnare | Layout base, mancano sezioni                      |
| ApartmentCard     | Da ridisegnare | Card funzionale ma visivamente piatta             |
| MoodCard          | Da ridisegnare | Come ApartmentCard                                |
| DistrictCard      | Da ridisegnare | Come ApartmentCard                                |
| DistrictLink      | Da ridisegnare | Troppo semplice, potenziale editoriale            |
| HeroSection       | Mancante       | Oggi ogni pagina ha il proprio hero inline        |
| BreakerSection    | Mancante       | Sezione full-width con foto e quote               |
| FeatureSection    | Mancante       | Sezione "perché Acacia" con testo + foto          |
| ReviewsSection    | Mancante       | Testimonianze ospiti                              |
| StatsSection      | Mancante       | Numeri chiave (25+ apt, 10+ anni…)                |
| NewsletterSection | Mancante       | Iscrizione email                                  |
| CategoryFilter    | Da rivalutare  | Filtro appartamenti per categoria                 |
| ImageGallery      | Ok             | Lightbox funzionante                              |
| BeddyBar          | Ok             | Widget booking, non toccare                       |

### Pattern di pagine esistenti

| Pagina                                            | Struttura attuale                    |
| ------------------------------------------------- | ------------------------------------ |
| Home (`/[locale]`)                                | Hero inline + apt cards + mood cards |
| Appartamenti (`/florence/accommodations`)         | Hero inline + filtro + griglia card  |
| Dettaglio apt (`/florence/accommodations/[slug]`) | Hero + stats + gallery + dettagli    |
| Quartieri (`/florence/districts`)                 | Hero inline + griglia card           |
| Dettaglio quartiere (`/districts/[slug]`)         | Hero + appartamenti                  |
| Moods (`/moods`)                                  | Hero inline + griglia card           |
| Dettaglio mood (`/moods/[slug]`)                  | Hero + appartamenti                  |

---

## Shapes (S)

Tre direzioni stilistiche da valutare. Non sono mutualmente esclusive sul colore/font — differiscono nel _rapporto_ tra fotografia, tipografia e spazio bianco.

---

### A: Editoriale Freddo — "Fotografia sovrana"

La fotografia occupa il 70%+ dello spazio visivo. La tipografia è enorme e coraggiosa. Il bianco è dominante. Il rust appare solo in 2-3 momenti strategici per pagina.

| Part | Mechanism                                                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | Hero: full-viewport, foto senza overlay scuro, titolo in Playfair enorme (80-100px) sovrapposto con testo bianco su zona scura dell'immagine |
| A2   | Cards: formato verticale tall, foto 70% altezza, titolo in Playfair sotto, 0 decorazioni                                                     |
| A3   | Sezioni: alterno righe singole (feature editoriale) a griglie. Mai 3 colonne su desktop — massimo 2                                          |
| A4   | Spazio: sezioni distanziate 120-160px. Nessun background alternato — tutto su bianco/cream                                                   |
| A5   | Navigation: solo logo + 2-3 link + CTA. Nessun border visibile a riposo                                                                      |
| A6   | Rust: solo su CTA primary button e hover link. Mai altrove                                                                                   |

---

### B: Warm Editorial — "Plum con cuore fiorentino"

Adotta una struttura editoriale di alto livello ma mantiene la palette calda di Acacia più presente. La cream e le superfici warm restano in gioco. Il rust appare più spesso ma sempre con controllo.

| Part | Mechanism                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------ |
| B1   | Hero: full-viewport con overlay gradiente caldo (non nero puro), titolo Playfair large (60-72px) |
| B2   | Cards: mix di card verticali (featured) e grid orizzontale (esplora). Angoli generosi (16-20px)  |
| B3   | Sezioni: alternanza di background surface/surface-alt/surface-warm per creare ritmo caldo        |
| B4   | Spazio: sezioni distanziate 88-112px. Whitespace deliberato ma non estremo                       |
| B5   | Navigation: logo + 3-4 link + switcher locale + CTA rust pill. Scroll-aware già implementato     |
| B6   | Rust: CTA, sezione label, accent su card tag, decorative divider in 4-5 punti per pagina         |
| B7   | Feature section: foto grande (50%) + testo editoriale (50%), alternati sx/dx per sezione         |

---

### C: Magazine Boutique — "Rivista di viaggio"

Più vicino a Condé Nast Traveller o The Plumlist. Griglia editoriale forte, pull quote tipografici, sezioni con personalità propria. Più complesso da implementare ma più ricco di carattere.

| Part | Mechanism                                                                                 |
| ---- | ----------------------------------------------------------------------------------------- |
| C1   | Hero: split screen — foto sinistra (60%) + titolo Playfair enorme a destra (40%) su cream |
| C2   | Cards: editorial grid con card di peso diverso (una grande + due piccole per row)         |
| C3   | Pull quote section: testo grande in Playfair italic, senza immagine, solo su cream        |
| C4   | Sezioni: ogni sezione ha un'identità grafica propria — non schema ripetuto                |
| C5   | Navigation: navigation rail verticale (desktop) o top minimal (mobile)                    |
| C6   | Rust: usato come colore tipografico su numeri grandi, pull quote, sezione etichette       |

---

## Fit Check

| Req | Requirement                                       | Status    | A   | B   | C   |
| --- | ------------------------------------------------- | --------- | --- | --- | --- |
| R0  | Trasmette "curato, umano, caldo" a scala boutique | Core goal | ✅  | ✅  | ✅  |
| R1  | Playfair per headline; Lato per body              | Must-have | ✅  | ✅  | ✅  |
| R2  | Rust accent, usato con parsimonia                 | Must-have | ✅  | ✅  | ✅  |
| R3  | Fotografia protagonista, respira                  | Must-have | ✅  | ✅  | ❌  |
| R4  | Navigazione minimalista                           | Must-have | ✅  | ✅  | ❌  |
| R5  | Whitespace deliberato                             | Must-have | ✅  | ✅  | ✅  |
| R6  | Contenuti variabili da CMS                        | Must-have | ✅  | ✅  | ❌  |
| R7  | Bilingue EN/IT                                    | Must-have | ✅  | ✅  | ✅  |
| R8  | Implementazione incrementale                      | Must-have | ✅  | ✅  | ❌  |
| R9  | Calore umano distinguibile                        | Must-have | ❌  | ✅  | ✅  |
| R10 | Mobile-first                                      | Must-have | ✅  | ✅  | ❌  |

**Note:**

- A fallisce R9: la direzione "fotografia sovrana su bianco puro" tende al freddo premium. Il calore di Acacia si perde
- C fallisce R3, R4, R6, R8, R10: troppo complesso strutturalmente. Split hero su mobile è difficile; nav rail non è standard; editorial grid a pesi variabili rompe con contenuti CMS variabili; non è incrementale

**→ Shape B è l'unica che passa tutti i requisiti.**

---

---

## Detail B — Hero

**Forma selezionata**: Shape B. Si inizia dall'Hero — componente più impattante e che stabilisce il tono visivo per tutto il sito.

### Decisioni di design confermate

- Full-viewport (`100svh`) — la foto occupa tutto lo schermo
- Gradient overlay caldo dal basso (non flat dark) — `rgba(46,40,34,0.75)` → transparent
- Titolo in Playfair regular con `<em>` italic inline — supportato da CMS
- Testo allineato bottom-left — non centrato (troppo generico)
- CTA: bottone rust pill primario + link ghost secondario
- Mobile: testo nell'ultimo 45% dello schermo, padding bottom safe-area

### Hero — Parts

| Part | Mechanism                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1   | **Struttura**: `min-h-[88svh]` full-bleed. Immagine da CMS (`ResponsiveImage`) con `object-fit: cover` e `object-position: center`. Nav sovrapposto (margin-top negativo sul main)                                         |
| H2   | **Doppio overlay** (pseudo-elementi o div stacked): gradient-top `rgba(20,15,10,0.35)→transparent` per 22% dall'alto (protegge nav); gradient-bottom `rgba(46,40,34,0.78)→transparent` per 55% dal basso (protegge titolo) |
| H3   | **Tipografia mobile**: Playfair 40-46px regular, `<em>` italic inline (da CMS); subtitle Lato 16px light; entrambi `text-white`                                                                                            |
| H4   | **Tipografia desktop**: Playfair 64-80px regular; subtitle Lato 18px light; `max-width: 640px`                                                                                                                             |
| H5   | **Allineamento**: testo `bottom-left`, `px-6 pb-safe` mobile (safe-area) / `px-14 pb-20` desktop                                                                                                                           |
| H6   | **CTA**: bottone rust pill primario + link ghost `border-white/40 text-white` secondario                                                                                                                                   |
| H7   | **Content da CMS**: `title` (HTML con `<em>` opzionale), `subtitle`, `ctaLabel`, `ctaUrl`, `backgroundImage` (ResponsiveImage)                                                                                             |
| H8   | **Safe area**: `paddingBottom: 'max(3rem, env(safe-area-inset-bottom))'` — per iPhone notch/Dynamic Island                                                                                                                 |
| H9   | **Nessun carousel, nessun video, nessun scroll indicator** — immagine singola, statica                                                                                                                                     |

### Decisioni Q1–Q4

| #   | Decisione                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Nav sovrapposto all'hero** — ma con leggibilità garantita. Soluzione: doppio gradiente sull'hero: uno bottom-up per il titolo (esistente), uno top-down sottile solo per proteggere il nav. Il nav in sé resta trasparente → cream on scroll. Nessun blur permanente sul nav. |
| Q2  | **88svh** — lascia intuire il contenuto sotto senza sembrare tagliato                                                                                                                                                                                                           |
| Q3  | **No scroll indicator**                                                                                                                                                                                                                                                         |
| Q4  | **Logo SVG completo** (`/public/logo--main.svg`, ratio ~3.6:1). L'isologo (`acacia-isologo.svg`) non può essere usato da solo per motivi di copyright. Logo in header a h=28px desktop / h=22px mobile                                                                          |

### Soluzione leggibilità nav (Q1 — dettaglio tecnico)

Il problema: foto hero con zone chiare in cima → testo nav bianco illeggibile.

**Meccanismo**: il Hero emette **due gradienti separati** sovrapposti:

- `gradient-bottom`: `rgba(46,40,34,0.78) 0% → transparent 55%` — per il titolo
- `gradient-top`: `rgba(20,15,10,0.35) 0% → transparent 22%` — solo per proteggere area nav (~72px)

Il nav non cambia — resta trasparente al top, cream su scroll. La protezione è nell'immagine stessa.
Questo è il pattern usato dai principali siti editoriali e di hospitality: il componente foto si "auto-protegge".

---

### Layout — Gestione offset nav

Il nav è `fixed top-0`, il `<main>` deve partire da `top: 0` per permettere l'overlay.

**Soluzione A (scelta)**: il locale layout applica `pt-[--header-height]` al `<main>` di default. L'Hero component annulla questo padding con `-mt-[--header-height]` così risale sotto il nav. Ogni pagina avrà una qualche forma di hero, quindi il pattern si applica sempre.

**Variabile CSS**: `--header-height: 68px` definita in `global.css` — usata sia nel layout che nell'Hero per restare sincronizzati se l'altezza del nav cambia.

| Part | Mechanism                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------ |
| L1   | `global.css`: `--header-height: 68px` come custom property in `:root`                                  |
| L2   | `[locale]/layout.tsx`: `<main className="pt-[var(--header-height)]">`                                  |
| L3   | `Hero` component: primo elemento, `className="-mt-[var(--header-height)]"` per risalire sotto il nav   |
| L4   | Pagine senza full-bleed hero (future): usano un `PageHeader` component che include il padding corretto |

---

## Detail B — Navigation

### Decisioni confermate

- **N-A full-screen overlay** — mega links in Playfair su sfondo dark
- **Voci attuali**: Alloggi, Quartieri, Moods (+ Offerte, FAQ da aggiungere quando le sezioni esistono)
- **Desktop**: hamburger nascosto, link inline — già scroll-aware

### Navigation — Parts

| Part | Mechanism                                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| N1   | **Hamburger trigger**: visibile solo su mobile (`md:hidden`). Icona 3 linee → X animata. Posizionato in alto a destra nel SiteHeader  |
| N2   | **Overlay full-screen**: `fixed inset-0 z-[100] bg-dark` — sopra tutto, incluso il nav. Fade in/out `opacity 0→1` 300ms               |
| N3   | **Mega links**: Playfair regular 48px mobile / 64px tablet. `text-white` → `text-rust` su hover. Left-aligned, `gap-y-6` tra le voci  |
| N4   | **Logo nell'overlay**: `logo--main.svg` in alto a sinistra filtro white — continuità visiva con l'header                              |
| N5   | **Chiudi (X)**: in alto a destra, sostituisce visivamente l'hamburger. `text-white`                                                   |
| N6   | **Stagger animation**: voci entrano con `translateY(20px)→0` + `opacity 0→1`, delay incrementale 50ms per voce                        |
| N7   | **Footer overlay**: separato in basso — switcher lingua EN/IT in Lato small + CTA "Prenota" rust pill                                 |
| N8   | **Lock body scroll**: `overflow:hidden` su `body` quando overlay aperto                                                               |
| N9   | **Close on navigate**: overlay si chiude automaticamente al click su qualsiasi link                                                   |
| N10  | **Desktop**: hamburger nascosto (`hidden md:flex`). Aggiungere CTA "Prenota" rust pill inline (mancante nell'implementazione attuale) |

### Decisioni di design

| Aspetto            | Scelta                                               |
| ------------------ | ---------------------------------------------------- |
| Background overlay | `bg-dark` (#2E2822) — drammatico, editoriale         |
| Allineamento link  | Left-aligned — coerente con hero bottom-left         |
| Dimensione link    | Playfair regular 48px mobile, 64px su schermi larghi |
| Lingua             | Bottom overlay, piccola — non tra i mega link        |
| CTA Prenota        | Bottom overlay + desktop nav inline                  |

---

## Prossimi passi

1. ✅ Shape B selezionata
2. ✅ Hero shapato (H1–H9 + layout L1–L4)
3. ✅ Hero implementato (`src/components/Hero/index.tsx`) — commit f632749
4. ✅ Layout fix (`--header-height`, `pt-[var(--header-height)]` su main)
5. ✅ Logo SVG reale in SiteHeader
6. ✅ Navigation shapata (N1–N10) e implementata — commit f4fbbbc
7. ✅ Fix leggibilità: nav frosted glass, hero subtitle, prose-acacia — commit ad2cb3b
8. ✅ Shapare e implementare Cards (ApartmentCard, MoodCard, DistrictCard) — D1 portrait 3:4
9. Shapare Section patterns (Feature, Breaker, Reviews, Stats)
10. Shapare SiteFooter

---

## Detail B — Cards

### CURRENT: Inventario card esistenti

Tutte e tre le card condividono **la stessa struttura**:

| Elemento       | ApartmentCard              | MoodCard                | DistrictCard              |
| -------------- | -------------------------- | ----------------------- | ------------------------- |
| Immagine       | 700×520 (4:3), crop center | 700×520 (4:3)           | 700×520 (4:3) dal gallery |
| Tag pill       | `highlight` (se presente)  | "Mood" hardcoded        | "Firenze" hardcoded       |
| Label sopra h3 | `category.name` in rust    | —                       | —                         |
| Titolo         | `name` in Playfair h3      | `name` in Playfair h3   | `name` in Playfair h3     |
| Sottotitolo    | `claim` body-sm muted      | `claim` body-sm muted   | —                         |
| Footer         | "Discover →" rust on hover | "Explore →" rust hover  | "Explore →" rust hover    |
| Interazione    | Lift + ombra + zoom img    | Stesso                  | Stesso                    |

**Problemi CURRENT**:
- Tutte identiche — nessuna identità visiva per tipo di contenuto
- 4:3 landscape è basso e compresso — la foto non respira
- Tag pill sempre visibile anche senza contenuto significativo ("Mood", "Firenze" fissi)
- Nessun dato funzionale per ApartmentCard (posti letto, bagni — info chiave per chi prenota)
- Il footer "Scopri →" ridondante rispetto al link dell'intera card

---

### Requisiti Cards (R-C)

| ID   | Requirement                                                                                          | Status    |
| ---- | ---------------------------------------------------------------------------------------------------- | --------- |
| RC0  | La foto deve dominare — almeno 60-65% dell'altezza totale della card                                 | Must-have |
| RC1  | ApartmentCard deve mostrare info funzionali: capienza (sleeps) o n. camere                          | Must-have |
| RC2  | Le tre card condividono la struttura base ma ApartmentCard è distinta nelle info                     | Must-have |
| RC3  | Funziona con titoli corti (3 parole) e lunghi (6-7 parole) senza layout break                       | Must-have |
| RC4  | Mobile: 1 colonna, card leggibile a 375px di larghezza                                               | Must-have |
| RC5  | Hover elegante — non eccessivo, coerente con tono editoriale                                         | Must-have |
| RC6  | Il tag/pill deve essere significativo — niente label fisse che non aggiungono valore                 | Nice-to-have |

---

### Opzioni Card Format

#### D1 — Portrait + Text Below (Editoriale caldo)

Immagine ritagliata in formato verticale (3:4 o 5:7). Testo sotto l'immagine, stile attuale ma con più respiro. Approccio conservativo e robusto.

| Part | Mechanism |
|------|-----------|
| D1.1 | Immagine 600×800 (3:4) — portrait, foto protagonista |
| D1.2 | Testo sotto: category label → h3 Playfair → claim body-sm → link freccia |
| D1.3 | Pill tag solo se `highlight` ha contenuto (per ApartmentCard) |
| D1.4 | ApartmentCard: riga con ícone 🛏 N camere o 👤 N persone |

#### D2 — Overlay Text (Plum-like)

Foto occupa tutta la card (aspect ratio 5:6 o square). Titolo e label in overlay scuro sul fondo dell'immagine. Stile più drammatico.

| Part | Mechanism |
|------|-----------|
| D2.1 | Card senza padding text — foto full-bleed con `rounded-card` e `overflow-hidden` |
| D2.2 | Gradient overlay sul fondo: `rgba(20,10,5,0.7) 0% → transparent 50%` |
| D2.3 | Titolo in Playfair white sul fondo dell'immagine |
| D2.4 | Label piccola rust-soft sopra al titolo (category o tipo) |
| D2.5 | Al hover: gradient più scuro + zoom immagine |

#### D3 — Ibrido (D1 base, D2 per featured)

La griglia usa D1 (text below) per la maggior parte delle card. Una card "featured" per sezione usa D2 (overlay) a tutta larghezza o in formato 2 colonne.

---

### Fit Check Cards

| Req | Requirement                                           | Status       | D1  | D2  | D3  |
| --- | ----------------------------------------------------- | ------------ | --- | --- | --- |
| RC0 | Foto domina (60-65%+ altezza card)                    | Must-have    | ✅  | ✅  | ✅  |
| RC1 | Info funzionali ApartmentCard (sleeps/camere)         | Must-have    | ✅  | ❌  | ✅  |
| RC2 | Struttura base condivisa, ApartmentCard distinta      | Must-have    | ✅  | ✅  | ✅  |
| RC3 | Titoli corti e lunghi senza break                     | Must-have    | ✅  | ❌  | ✅  |
| RC4 | Mobile 375px leggibile                                | Must-have    | ✅  | ✅  | ✅  |
| RC5 | Hover elegante                                        | Must-have    | ✅  | ✅  | ✅  |
| RC6 | Pill tag significativo                                | Nice-to-have | ✅  | ✅  | ✅  |

**Note:**
- D2 fallisce RC1: con overlay text non c'è spazio per info funzionali (sleeps, camere)
- D2 fallisce RC3: titoli lunghi in overlay su immagine non garantiscono leggibilità — dipende troppo dal contenuto dell'immagine
- D3 aggiunge complessità senza risolvere i problemi di D2 per le card in griglia

**→ D1 è l'unica che passa tutti i must-have.**

---

### Detail D1 — Anatomia finale Cards

Foto portrait → spazio generoso → titolo serifa → info minimali. **Niente uppercase nelle card** — si usa solo per le section label nei titoli di sezione, non per metadati di card.

#### ApartmentCard

```
┌─────────────────────────────────┐
│                                 │
│         FOTO 3:4                │  ← w:600 h:800 imgix crop
│         (occupa ~65% card)      │
│                                 │
├─ p-5 ───────────────────────────┤
│  Monolocale                     │  ← category.name, text-caption, text-muted, font-normal
│  Nome dell'appartamento         │  ← Playfair text-h3 font-normal text-dark
│                                 │
│  Vista sul Duomo                │  ← highlight (se presente), text-caption text-rust, fondo card
└─────────────────────────────────┘
```

**Decisioni confermate:**
- Sleeps/camere: solo in pagina dettaglio, non nella card
- "Scopri →": rimosso — tutta la card è cliccabile
- Highlight come elemento bottom opzionale: se presente, è il gancio editoriale ("Vista sul Duomo", "Con terrazza")
- Claim: rimosso dalla card — troppo testo per uno spazio small, appartiene alla pagina dettaglio

#### MoodCard

```
FOTO 3:4 → p-5 → Nome mood (Playfair h3) → claim (hidden, appare in hover)
```

Il titolo grande dà già l'informazione principale. Il claim è uno strato editoriale di profondità:
- **Desktop**: `opacity-0 translate-y-1 → opacity-100 translate-y-0` on `group-hover`, duration 300ms
- **Mobile** (no hover): claim sempre visibile — non c'è interazione hover, non si può nascondere

#### DistrictCard

```
FOTO 3:4 → p-5 → Nome quartiere (Playfair h3)
```

La massima semplicità — il quartiere si vende con la foto e il nome.

---

### Parts D1 (implementazione)

| Part  | Mechanism                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| D1.1  | **Immagine portrait**: `imgixParams: { w: 600, h: 800, fit: crop }` su tutti e tre i fragment — crop center                              |
| D1.2  | **Card container**: `bg-card rounded-card overflow-hidden` — senza shadow a riposo, `hover:shadow-card-hover hover:-translate-y-0.5` leggero |
| D1.3  | **Zoom immagine on hover**: `group-hover:scale-[1.03]` duration-600 — più sottile dell'attuale 1.04                                       |
| D1.4  | **Categoria** (ApartmentCard only): `font-body text-caption text-muted font-normal mb-1.5` — sentence case, NO uppercase                 |
| D1.5  | **Titolo**: `font-heading text-h3 font-normal text-dark leading-snug` — Playfair regular, invariato come peso                            |
| D1.6  | **Highlight** (ApartmentCard, opzionale): `font-body text-caption text-rust font-normal mt-auto pt-3` — solo se il campo ha contenuto   |
| D1.7  | **Padding content**: `p-5` (20px) — leggermente più stretto dell'attuale `p-6` per bilanciare l'immagine più alta                        |
| D1.8  | **Pill tags**: rimossi da tutte e tre le card — niente "Mood" hardcoded, niente "Firenze" hardcoded                                       |
| D1.9  | **Nessun footer link**: niente "Scopri →" / "Esplora →" — la card intera è il link                                                       |
| D1.10 | **MoodCard claim reveal**: `opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300` — su mobile sempre visibile (`md:opacity-0 md:translate-y-1`) |

---

### Una domanda rimasta aperta: shadow / no shadow

Nei siti editoriali di riferimento le card si fondono con lo sfondo cream della pagina, e il confine visivo è dato solo dall'angolo arrotondato e dall'immagine.

Acacia ha `shadow-card` (2px 12px rgba leggera). Opzioni:
- **Senza shadow**: più Plum-like, card si fondono con `bg-surface`, elegante
- **Con shadow leggera**: mantiene la sensazione di "carta fisica", più familiare

Per ora manteniamo shadow leggera (invariato) — può essere rimossa in seguito senza impatti di struttura.
