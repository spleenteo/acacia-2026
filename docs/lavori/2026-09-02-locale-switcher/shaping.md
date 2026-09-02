---
shaping: true
---

# Selettore di lingua nel menu principale — Shaping

**Stato:** Shaping · **Lavoro:** `locale-switcher` · **Data:** 2026-09-02 (Matteo)

## Source

> Il cambio lingua nel sito acaciafirenze è stato posizionato nel footer, pensando che la lingua
> di default del browser avrebbe risolto il problema. Invece no, e messo così in fondo molti non
> trovano il cambio lingua. Dobbiamo quindi trovare un modo di portare lo switch nel top menu.
> Non so come farlo: forse una voce aggiuntiva al menu principale (con dropdown)? O forse molto
> piccolo accanto alla CTA. Su mobile responsive sembra più facile.

Feedback raccolto a voce dagli utenti, nessun materiale scritto.

---

## Requirements (R)

| ID  | Requisito                                                                                              | Stato     |
| --- | ------------------------------------------------------------------------------------------------------ | --------- |
| R0  | Da qualunque pagina si cambia lingua senza scorrere fino in fondo                                      | Core goal |
| R1  | Su desktop il controllo è visibile nella barra, senza interazioni preliminari                          | Must-have |
| R2  | 🟡 Su mobile il controllo è raggiungibile senza aprire l'hamburger                                     | Must-have |
| R3  | Si riconosce a colpo d'occhio come controllo della lingua, senza interpretarlo                         | Must-have |
| R4  | Il cambio lingua resta sulla stessa pagina, non rimanda alla home                                      | Must-have |
| R5  | `NEXT_LOCALE` è scritto solo quando l'utente sceglie davvero, mai per il solo fatto di visitare un URL | Must-have |
| R6  | Il nav resta di competenza dell'editor: nessuna voce di sistema mescolata a quelle del CMS             | Must-have |
| R7  | La barra regge in EN e IT, da mobile a desktop, senza andare a capo né schiacciare la CTA              | Must-have |
| R8  | 🟡 Chi il cambio lingua lo cerca nel footer continua a trovarlo lì                                     | Must-have |

**Note sui requisiti**

- **R3 è il requisito che spiega il fallimento attuale.** Lo switch nel footer non è solo in basso: è
  `EN / IT` in `text-caption` bianco al 45%, che si legge come decorazione tipografica, non come
  controllo. Spostare la stessa forma più in alto sposta il problema, non lo risolve.
- **R5 nasce dal codice, non dagli utenti.** `rememberLocale()` in `proxy.ts:97` scrive il cookie a
  ogni visita con prefisso esplicito. Chi atterra da Google su `/en/...` si porta a casa
  `NEXT_LOCALE=en` senza aver scelto, e da lì in poi anche la home nuda lo manda in inglese.
- 🟡 **R2 deciso il 2026-09-02: Must-have.** Chi ha il problema è esattamente chi arriva nella lingua
  sbagliata da una ricerca: deve vedere il controllo senza toccare nulla. Questo è ciò che esclude B.
- 🟡 **R8 deciso il 2026-09-02: Must-have.** Il footer resta: chi ha imparato a cercarlo lì continua a
  trovarlo, e non toglie nulla a chi usa quello in alto.

---

## CURRENT: com'è fatto oggi

| Parte | Meccanismo                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| CUR1  | `LocaleSwitcher` client component, due varianti grafiche già esistenti: `footer` e `menu`                      |
| CUR2  | Desktop: montato **solo** nel footer (`SiteFooter/index.tsx:135`), banda navy, `text-white/45`                 |
| CUR3  | Mobile: montato nell'overlay dell'hamburger (`SiteHeader/index.tsx:283`), in fondo, sotto i CTA Contact e Book |
| CUR4  | Il click scrive `NEXT_LOCALE`, poi `window.location.assign()` sulla pagina equivalente nell'altra lingua       |
| CUR5  | `AlternateLocaleProvider` nel layout: le pagine con slug localizzato (mood, FAQ) pubblicano gli URL alternati  |
| CUR6  | `proxy.ts` negozia `Accept-Language` **solo** per URL senza prefisso di lingua                                 |
| CUR7  | `rememberLocale()` scrive `NEXT_LOCALE` a **ogni** visita con prefisso esplicito                               |

Il pezzo che regge già bene è CUR4+CUR5: il cambio lingua resta sulla stessa pagina, slug localizzati
compresi. Nessuna shape lo tocca.

---

## Parte comune a tutte le shape: il cookie

Non è una scelta di forma, è una correzione. Vale per A, B e C.

| Parte | Meccanismo                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| P1    | Rimuovere la chiamata a `rememberLocale()` dal ramo di visita con prefisso esplicito in `proxy.ts`                |
| P2    | Il cookie resta scritto in un solo posto: `setLocaleCookie()` dentro `LocaleSwitcher`, cioè su click dell'utente  |
| P3    | Conseguenza da accettare: chi non ha mai scelto e apre un URL senza prefisso viene negoziato da `Accept-Language` |

---

## A: Voce nel menu principale con dropdown

| Parte | Meccanismo                                                                                 | Flag |
| ----- | ------------------------------------------------------------------------------------------ | :--: |
| A1    | Una voce "Language / Lingua" in coda al nav centrale, renderizzata dal codice non dal CMS  |      |
| A2    | Click apre un pannellino con gli autonimi (English, Italiano) e la lingua corrente marcata |      |
| A3    | Su mobile la voce entra nell'overlay insieme alle altre, in coda al nav                    |      |
| A4    | Gestione focus, chiusura su Esc e su click fuori                                           |  ⚠️  |

Il nav centrale è alimentato da `navItems` (CMS). A1 significa appendere un elemento di sistema a una
lista che l'editor governa: le voci cambiano di numero, e la barra è una griglia a tre colonne con il
nav centrato. Una voce in più sposta il centro ottico.

---

## B: EN / IT accanto alla CTA

| Parte | Meccanismo                                                                                    | Flag |
| ----- | --------------------------------------------------------------------------------------------- | :--: |
| B1    | `LocaleSwitcher` con una nuova `variant="header"`, montato nella terza colonna prima del Book |      |
| B2    | Stessa forma di oggi: `EN / IT`, corrente in evidenza, l'altra cliccabile                     |      |
| B3    | Su mobile resta nell'overlay, ma risale **sopra** le voci di menu invece che sotto i CTA      |      |
| B4    | Nessuna modifica al nav dal CMS                                                               |      |

È la strada più corta: la variante grafica esiste già, il montaggio è una riga. Ma conserva la forma
che oggi non funziona — testo piccolo, poco contrastato, accanto a un bottone pieno che si prende
tutta l'attenzione.

---

## C: Controllo esplicito nella barra, desktop e mobile

| Parte | Meccanismo                                                                                    | Flag |
| ----- | --------------------------------------------------------------------------------------------- | :--: |
| C1    | `variant="header"`: due codici in un contenitore con bordo, la lingua corrente su fondo pieno |      |
| C2    | Desktop: nella terza colonna, prima della CTA Book, separato da essa                          |      |
| C3    | Mobile: **nella barra sempre visibile**, fra il wordmark e la CTA, non nell'overlay           |      |
| C4    | Nell'overlay mobile lo switch sparisce: sta già nella barra sopra                             |      |
| C5    | Il contrasto segue lo stato dell'header (`onLight`), come già fanno wordmark e hamburger      |      |
| C6    | Su mobile stretto (≤360px) la CTA Book perde il padding orizzontale per far spazio            |  ⚠️  |

La forma è un segmented control: si legge come "due opzioni, una attiva". A differenza di `EN / IT`
separati da uno slash, dice da sé che è un controllo e non un'etichetta.

---

## Fit Check

| Req | Requisito                                                                                              | Stato     | CURRENT |  A  |  B  |  C  |
| --- | ------------------------------------------------------------------------------------------------------ | --------- | :-----: | :-: | :-: | :-: |
| R0  | Da qualunque pagina si cambia lingua senza scorrere fino in fondo                                      | Core goal |   ❌    | ✅  | ✅  | ✅  |
| R1  | Su desktop il controllo è visibile nella barra, senza interazioni preliminari                          | Must-have |   ❌    | ✅  | ✅  | ✅  |
| R2  | 🟡 Su mobile il controllo è raggiungibile senza aprire l'hamburger                                     | Must-have |   ❌    | ❌  | ❌  | ✅  |
| R3  | Si riconosce a colpo d'occhio come controllo della lingua, senza interpretarlo                         | Must-have |   ❌    | ✅  | ❌  | ✅  |
| R4  | Il cambio lingua resta sulla stessa pagina, non rimanda alla home                                      | Must-have |   ✅    | ✅  | ✅  | ✅  |
| R5  | `NEXT_LOCALE` è scritto solo quando l'utente sceglie davvero, mai per il solo fatto di visitare un URL | Must-have |   ❌    | ✅  | ✅  | ✅  |
| R6  | Il nav resta di competenza dell'editor: nessuna voce di sistema mescolata a quelle del CMS             | Must-have |   ✅    | ❌  | ✅  | ✅  |
| R7  | La barra regge in EN e IT, da mobile a desktop, senza andare a capo né schiacciare la CTA              | Must-have |   ✅    | ❌  | ✅  | ❌  |
| R8  | 🟡 Chi il cambio lingua lo cerca nel footer continua a trovarlo lì                                     | Must-have |   ✅    | ✅  | ✅  | ✅  |

**Note**

- **A fallisce R6**: la voce di sistema si mescola al nav del CMS, che l'editor governa.
- **A fallisce R7**: il nav centrale è centrato in una griglia a tre colonne; una voce in più ne sposta
  il centro ottico, e il numero di voci lo decide l'editor.
- **A ha A4 flagged**: focus trap, Esc e click-fuori di un dropdown non sono ancora un meccanismo
  concreto in questo codice — non esiste un pattern di dropdown nell'header da riusare.
- **B fallisce R3**: conserva la forma che oggi non viene vista. È il fallimento attuale, spostato in alto.
- **C fallisce R7**: C6 è flagged — sotto i 360px la barra ospita wordmark, switch e CTA, e va provato
  davvero, non stimato.
- **R5 passa in A, B e C** perché la parte comune P vale per tutte.

---

## Shape selezionata: C, condizionata a uno spike

Con R2 e R8 promossi a Must-have, **A e B escono**: A fallisce R2, R6 e R7, B fallisce R2 e R3.
Resta **C**, che però ha ancora un ❌ su R7 per via di C6 flagged.

**C non è ancora dichiarabile in piedi.** Un ✅ è un'affermazione di conoscenza, e sotto i 360px non
sappiamo se wordmark, switch e CTA convivono. I conti a mano dicono che è al limite: a 320px, tolti i
`px-5` di padding, restano 280px per un wordmark su due righe (~85px), la CTA Book (~70px),
l'hamburger (32px) e due `gap-3` (24px) — cioè ~69px per lo switch, quando un segmented `EN|IT`
compatto ne chiede 64–70. Un conto che finisce sul filo non è una risposta.

### Spike S1 — lo spazio nella barra mobile

Da fare **prima** del piano della slice che monta lo switch su mobile. Vive in `spike-barra-mobile.md`.

| #     | Domanda                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------ |
| S1-Q1 | A 320, 360 e 390px, quanto spazio libero resta davvero nella barra fra wordmark, CTA e hamburger?      |
| S1-Q2 | Quanto misura un segmented `EN\|IT` alle dimensioni tipografiche del design system?                    |
| S1-Q3 | Se non ci sta, quali leve esistono già nel codice (wordmark su una riga, CTA più stretta, gap minori)? |
| S1-Q4 | Il contrasto sullo stato `onLight` regge sopra un hero scuro come sopra la barra chiara?               |

**Accettazione**: lo spike è chiuso quando sappiamo dire, con numeri misurati sul sito e non stimati,
se il controllo entra nella barra a 320px e con quale forma.

## Decisioni

- **2026-09-02 — R2 Must-have.** Alternativa reale scartata: tenere lo switch dentro l'overlay
  (rischio layout zero). Scartata perché chi ha il problema non apre l'hamburger per cercare una cosa
  che non sa esserci.
- **2026-09-02 — Footer tenuto.** Si accetta la ridondanza di due controlli sulla stessa pagina.
- **2026-09-02 — Il suggerimento di lingua resta fuori scope.** Chi atterra da Google su `/en` con
  browser italiano continuerà ad atterrare in inglese: P1–P3 tolgono il cookie che _incolla_ la lingua
  sbagliata, non l'atterraggio in sé. È il candidato naturale per il lavoro successivo.
