---
shaping: true
---

# Frontend Restyle — Shaping

## Frame

### Source

> "Mi piace molto il mood e altri aspetti del sito plumguide.com — seguendo quelle tracce, e mantenendo il colore principale di acacia (rusty) e la font sans serif scelta, voglio valutare un completo restyle dell'esistente."
>
> "Voglio assolutamente lasciare Playfair per tutti i grandi messaggi di header e sections."
>
> "Sullo scope direi B perché al momento la struttura è fatta totalmente a caso. Va rifatto header, menu, hero, card, sezioni di highlight, tutto."
>
> "C'è un aspetto molto umano nella gestione di Acacia, è una piccola azienda che coccola i clienti e che offre un servizio attento, belle case. Per questo — anche se Plum Guide è sicuramente più grande e di livello superiore — però in piccolo Acacia ci si avvicina."
>
> "Lavoro da giorni ma se necessario più tempo. Voglio strutturare uno shaping completo che tu possa seguire nel tempo. Molti componenti ancora non ci sono."
>
> "Lato CMS è possibile far arrivare elementi `<em>` in mezzo a stringhe di testo, quindi quel tipo di effetto sui titoli è possibile. Non necessariamente uguale a Plum, potrebbe essere però una vivacizzazione simile."
>
> "Partirei sicuramente da hero, per poi passare al menu. La parte responsive in generale è fondamentale, perché la maggior parte delle visite arrivano da mobile."

### Problem

Il frontend attuale è privo di struttura sistematica: layout improvvisati, gerarchia visiva debole, componenti di base che non esprimono l'identità di Acacia. Il sito non comunica la qualità curatoriale del brand né il carattere umano e attento del servizio. Mancano interi pattern di componenti.

### Outcome

Un sistema visivo coerente e un set di componenti che comunichino **"lusso curato con calore umano"** — la fiducia editoriale di Plum Guide alla scala e con la personalità di Acacia Firenze. Il risultato deve essere implementabile in modo incrementale, componente per componente, mantenendo il sito funzionante durante la transizione.

---

## Requirements (R)

| ID  | Requirement | Status |
|-----|-------------|--------|
| R0  | Il nuovo frontend trasmette "curato, umano, caldo" — qualità editoriale a scala boutique | Core goal |
| R1  | Playfair Display per tutti i momenti headline/sezione; Lato per body e UI | Must-have |
| R2  | Rust (#D0512A) come unico accent, usato con parsimonia — mai come sfondo di aree grandi | Must-have |
| R3  | Fotografia protagonista — le immagini respirano, non sono compresse | Must-have |
| R4  | Navigazione minimalista: pochi link, peso visivo quasi zero, scroll-aware | Must-have |
| R5  | Sistema di whitespace deliberato — lo spazio vuoto è scelta, non assenza | Must-have |
| R6  | Tutti i contenuti arrivano da DatoCMS — il design deve adattarsi a contenuti variabili | Must-have |
| R7  | Sito bilingue EN/IT — il sistema deve funzionare ugualmente in entrambe le lingue | Must-have |
| R8  | Implementazione incrementale — ogni componente può essere rilasciato indipendentemente | Must-have |
| R9  | Il calore umano di Acacia rimane distinguibile — non freddo, non corporate | Must-have |
| R10 | 🟡 Mobile-first critico — la maggior parte delle visite è da mobile. Ogni componente si disegna prima a 375px | Must-have |
| R11 | 🟡 `<em>` nei titoli da CMS — Playfair italic inline in stringhe di testo reso da DatoCMS (già supportato tecnicamente) | Must-have |

---

## CURRENT: Stato attuale (inventario componenti)

### Componenti esistenti

| Componente | Stato | Note |
|------------|-------|------|
| SiteHeader | Da ridisegnare | Fixed scroll-aware ok, ma struttura va rinforzata |
| SiteFooter | Da ridisegnare | Layout base, mancano sezioni |
| ApartmentCard | Da ridisegnare | Card funzionale ma visivamente piatta |
| MoodCard | Da ridisegnare | Come ApartmentCard |
| DistrictCard | Da ridisegnare | Come ApartmentCard |
| DistrictLink | Da ridisegnare | Troppo semplice, potenziale editoriale |
| HeroSection | Mancante | Oggi ogni pagina ha il proprio hero inline |
| BreakerSection | Mancante | Sezione full-width con foto e quote |
| FeatureSection | Mancante | Sezione "perché Acacia" con testo + foto |
| ReviewsSection | Mancante | Testimonianze ospiti |
| StatsSection | Mancante | Numeri chiave (25+ apt, 10+ anni…) |
| NewsletterSection | Mancante | Iscrizione email |
| CategoryFilter | Da rivalutare | Filtro appartamenti per categoria |
| ImageGallery | Ok | Lightbox funzionante |
| BeddyBar | Ok | Widget booking, non toccare |

### Pattern di pagine esistenti

| Pagina | Struttura attuale |
|--------|-------------------|
| Home (`/[locale]`) | Hero inline + apt cards + mood cards |
| Appartamenti (`/florence/accommodations`) | Hero inline + filtro + griglia card |
| Dettaglio apt (`/florence/accommodations/[slug]`) | Hero + stats + gallery + dettagli |
| Quartieri (`/florence/districts`) | Hero inline + griglia card |
| Dettaglio quartiere (`/districts/[slug]`) | Hero + appartamenti |
| Moods (`/moods`) | Hero inline + griglia card |
| Dettaglio mood (`/moods/[slug]`) | Hero + appartamenti |

---

## Shapes (S)

Tre direzioni stilistiche da valutare. Non sono mutualmente esclusive sul colore/font — differiscono nel *rapporto* tra fotografia, tipografia e spazio bianco.

---

### A: Plum Guide Close — "Fotografia sovrana"

Segue Plum Guide molto da vicino. La fotografia occupa il 70%+ dello spazio visivo. La tipografia è enorme e coraggiosa. Il bianco è dominante. Il rust appare solo in 2-3 momenti strategici per pagina.

| Part | Mechanism |
|------|-----------|
| A1 | Hero: full-viewport, foto senza overlay scuro, titolo in Playfair enorme (80-100px) sovrapposto con testo bianco su zona scura dell'immagine |
| A2 | Cards: formato verticale tall, foto 70% altezza, titolo in Playfair sotto, 0 decorazioni |
| A3 | Sezioni: alterno righe singole (feature editoriale) a griglie. Mai 3 colonne su desktop — massimo 2 |
| A4 | Spazio: sezioni distanziate 120-160px. Nessun background alternato — tutto su bianco/cream |
| A5 | Navigation: solo logo + 2-3 link + CTA. Nessun border visibile a riposo |
| A6 | Rust: solo su CTA primary button e hover link. Mai altrove |

---

### B: Warm Editorial — "Plum con cuore fiorentino"

Adotta la struttura editoriale di Plum Guide ma mantiene la palette calda di Acacia più presente. La cream e le superfici warm restano in gioco. Il rust appare più spesso ma sempre con controllo.

| Part | Mechanism |
|------|-----------|
| B1 | Hero: full-viewport con overlay gradiente caldo (non nero puro), titolo Playfair large (60-72px) |
| B2 | Cards: mix di card verticali (featured) e grid orizzontale (esplora). Angoli generosi (16-20px) |
| B3 | Sezioni: alternanza di background surface/surface-alt/surface-warm per creare ritmo caldo |
| B4 | Spazio: sezioni distanziate 88-112px. Whitespace deliberato ma non estremo |
| B5 | Navigation: logo + 3-4 link + switcher locale + CTA rust pill. Scroll-aware già implementato |
| B6 | Rust: CTA, sezione label, accent su card tag, decorative divider in 4-5 punti per pagina |
| B7 | Feature section: foto grande (50%) + testo editoriale (50%), alternati sx/dx per sezione |

---

### C: Magazine Boutique — "Rivista di viaggio"

Più vicino a Condé Nast Traveller o The Plumlist. Griglia editoriale forte, pull quote tipografici, sezioni con personalità propria. Più complesso da implementare ma più ricco di carattere.

| Part | Mechanism |
|------|-----------|
| C1 | Hero: split screen — foto sinistra (60%) + titolo Playfair enorme a destra (40%) su cream |
| C2 | Cards: editorial grid con card di peso diverso (una grande + due piccole per row) |
| C3 | Pull quote section: testo grande in Playfair italic, senza immagine, solo su cream |
| C4 | Sezioni: ogni sezione ha un'identità grafica propria — non schema ripetuto |
| C5 | Navigation: navigation rail verticale (desktop) o top minimal (mobile) |
| C6 | Rust: usato come colore tipografico su numeri grandi, pull quote, sezione etichette |

---

## Fit Check

| Req | Requirement | Status | A | B | C |
|-----|-------------|--------|---|---|---|
| R0 | Trasmette "curato, umano, caldo" a scala boutique | Core goal | ✅ | ✅ | ✅ |
| R1 | Playfair per headline; Lato per body | Must-have | ✅ | ✅ | ✅ |
| R2 | Rust accent, usato con parsimonia | Must-have | ✅ | ✅ | ✅ |
| R3 | Fotografia protagonista, respira | Must-have | ✅ | ✅ | ❌ |
| R4 | Navigazione minimalista | Must-have | ✅ | ✅ | ❌ |
| R5 | Whitespace deliberato | Must-have | ✅ | ✅ | ✅ |
| R6 | Contenuti variabili da CMS | Must-have | ✅ | ✅ | ❌ |
| R7 | Bilingue EN/IT | Must-have | ✅ | ✅ | ✅ |
| R8 | Implementazione incrementale | Must-have | ✅ | ✅ | ❌ |
| R9 | Calore umano distinguibile | Must-have | ❌ | ✅ | ✅ |
| R10 | Mobile-first | Must-have | ✅ | ✅ | ❌ |

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

| Part | Mechanism |
|------|-----------|
| H1 | **Struttura**: `min-h-[88svh]` full-bleed. Immagine da CMS (`ResponsiveImage`) con `object-fit: cover` e `object-position: center`. Nav sovrapposto (margin-top negativo sul main) |
| H2 | **Doppio overlay** (pseudo-elementi o div stacked): gradient-top `rgba(20,15,10,0.35)→transparent` per 22% dall'alto (protegge nav); gradient-bottom `rgba(46,40,34,0.78)→transparent` per 55% dal basso (protegge titolo) |
| H3 | **Tipografia mobile**: Playfair 40-46px regular, `<em>` italic inline (da CMS); subtitle Lato 16px light; entrambi `text-white` |
| H4 | **Tipografia desktop**: Playfair 64-80px regular; subtitle Lato 18px light; `max-width: 640px` |
| H5 | **Allineamento**: testo `bottom-left`, `px-6 pb-safe` mobile (safe-area) / `px-14 pb-20` desktop |
| H6 | **CTA**: bottone rust pill primario + link ghost `border-white/40 text-white` secondario |
| H7 | **Content da CMS**: `title` (HTML con `<em>` opzionale), `subtitle`, `ctaLabel`, `ctaUrl`, `backgroundImage` (ResponsiveImage) |
| H8 | **Safe area**: `paddingBottom: 'max(3rem, env(safe-area-inset-bottom))'` — per iPhone notch/Dynamic Island |
| H9 | **Nessun carousel, nessun video, nessun scroll indicator** — immagine singola, statica |

### Decisioni Q1–Q4

| # | Decisione |
|---|-----------|
| Q1 | **Nav sovrapposto all'hero** — ma con leggibilità garantita. Soluzione: doppio gradiente sull'hero: uno bottom-up per il titolo (esistente), uno top-down sottile solo per proteggere il nav. Il nav in sé resta trasparente → cream on scroll. Nessun blur permanente sul nav. |
| Q2 | **88svh** — lascia intuire il contenuto sotto senza sembrare tagliato |
| Q3 | **No scroll indicator** |
| Q4 | **Logo SVG completo** (`/public/logo--main.svg`, ratio ~3.6:1). L'isologo (`acacia-isologo.svg`) non può essere usato da solo per motivi di copyright. Logo in header a h=28px desktop / h=22px mobile |

### Soluzione leggibilità nav (Q1 — dettaglio tecnico)

Il problema: foto hero con zone chiare in cima → testo nav bianco illeggibile.

**Meccanismo**: il Hero emette **due gradienti separati** sovrapposti:
- `gradient-bottom`: `rgba(46,40,34,0.78) 0% → transparent 55%` — per il titolo
- `gradient-top`: `rgba(20,15,10,0.35) 0% → transparent 22%` — solo per proteggere area nav (~72px)

Il nav non cambia — resta trasparente al top, cream su scroll. La protezione è nell'immagine stessa.
Questo è il pattern usato da Netflix, Airbnb, Plum Guide: il componente foto si "auto-protegge".

---

### Layout — Gestione offset nav

Il nav è `fixed top-0`, il `<main>` deve partire da `top: 0` per permettere l'overlay.

**Soluzione A (scelta)**: il locale layout applica `pt-[--header-height]` al `<main>` di default. L'Hero component annulla questo padding con `-mt-[--header-height]` così risale sotto il nav. Ogni pagina avrà una qualche forma di hero, quindi il pattern si applica sempre.

**Variabile CSS**: `--header-height: 68px` definita in `global.css` — usata sia nel layout che nell'Hero per restare sincronizzati se l'altezza del nav cambia.

| Part | Mechanism |
|------|-----------|
| L1 | `global.css`: `--header-height: 68px` come custom property in `:root` |
| L2 | `[locale]/layout.tsx`: `<main className="pt-[var(--header-height)]">` |
| L3 | `Hero` component: primo elemento, `className="-mt-[var(--header-height)]"` per risalire sotto il nav |
| L4 | Pagine senza full-bleed hero (future): usano un `PageHeader` component che include il padding corretto |

---

## Detail B — Navigation

Da shapare dopo l'implementazione dell'Hero. Punti da decidere:

- **Logo**: `logo--main.svg` in header (confermato). Colore: bianco su hero/trasparente, scuro su cream scrolled.
- **Mobile nav**: hamburger → overlay full-screen (Plum style) vs slide-in laterale → da shapare
- **Desktop**: scroll-aware già implementato, aggiungere CTA "Prenota" rust
- **Voci**: Alloggi / Quartieri / Moods / Lingua

---

## Prossimi passi

1. ✅ Shape B selezionata
2. ✅ Hero shapato (H1–H9 + layout L1–L4)
3. 🟡 Implementare Hero component + layout fix
4. Shapare Navigation (mobile first)
5. Proseguire con Card e Section patterns

