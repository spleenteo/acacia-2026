---
name: Acacia Firenze
description: Sito editoriale di appartamenti a Firenze, serif ad alto contrasto su fondi sage e sand, azioni color blackberry.
colors:
  blackberry-ink: '#48182f'
  blackberry-ink-hover: '#381325'
  blackberry-pale: '#efe2e9'
  rust: '#d53302'
  rust-pale: '#fbe3da'
  gold: '#ffaa4d'
  gold-soft: '#ffc680'
  sage: '#a0cbad'
  slate: '#8fb1be'
  night-navy: '#00012a'
  muted-navy: '#4c5168'
  light-navy: '#6b7088'
  surface-white: '#ffffff'
  surface-sage: '#eaf2f1'
  surface-sand: '#fbf3e3'
  hairline: '#dce6e6'
typography:
  hero:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: '4.2rem'
    fontWeight: 400
    lineHeight: 1.05
    fontVariation: "'opsz' 144, 'SOFT' 0, 'WONK' 0"
  h1:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: '3.15rem'
    fontWeight: 400
    lineHeight: 1.1
    fontVariation: "'opsz' 144, 'SOFT' 0, 'WONK' 0"
  h2:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: '2.7rem'
    fontWeight: 400
    lineHeight: 1.12
    fontVariation: "'opsz' 144, 'SOFT' 0, 'WONK' 0"
  h3:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: '1.8rem'
    fontWeight: 400
    lineHeight: 1.18
    fontVariation: "'opsz' 144, 'SOFT' 0, 'WONK' 0"
  h4:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: '1.35rem'
    fontWeight: 400
    lineHeight: 1.28
    fontVariation: "'opsz' 144, 'SOFT' 0, 'WONK' 0"
  body-lg:
    fontFamily: "Lato, 'Helvetica Neue', sans-serif"
    fontSize: '1.3125rem'
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Lato, 'Helvetica Neue', sans-serif"
    fontSize: '1.1875rem'
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Lato, 'Helvetica Neue', sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Lato, 'Helvetica Neue', sans-serif"
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Lato, 'Helvetica Neue', sans-serif"
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1
    letterSpacing: '0.18em'
rounded:
  card: '4px'
  card-lg: '6px'
  card-xl: '8px'
  pill: '100px'
components:
  button-primary:
    backgroundColor: '{colors.blackberry-ink}'
    textColor: '{colors.surface-white}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: '14px 32px'
  button-primary-hover:
    backgroundColor: '{colors.blackberry-ink-hover}'
  button-secondary-dark:
    textColor: '{colors.night-navy}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: '14px 32px'
  widget-label:
    backgroundColor: '{colors.rust-pale}'
    textColor: '{colors.rust}'
    typography: '{typography.label}'
    rounded: '{rounded.card}'
    padding: '4px 10px'
  card-image:
    rounded: '{rounded.card}'
---

# Design System: Acacia Firenze

## Overview

**Creative North Star: "The Quiet Concierge"**

Il sito parla come un concierge discreto: tutto è calmo e nitido, il colore compare dove serve e non prima. Un serif ad alto contrasto dà la voce editoriale, un sans leggibile porta il testo di servizio, i fondi alternano bianco, sage e sand come pagine di una guida. L'unico gesto "a mano" è l'evidenziatore sghembo, che segna una parola o un nome come farebbe qualcuno con una penna su una cartina.

La densità è bassa e il ritmo lento: immagini verticali grandi, titoli che respirano, una sola azione per schermata. Il rilievo è affidato al movimento (zoom, comparsa, sottolineatura che si disegna), non agli effetti di superficie.

**Key Characteristics:**

- Serif Fraunces nel suo taglio più affilato, corsivo per i titoli di sezione o per la loro parola chiave.
- Fondo navy mai nero puro, azioni sempre color blackberry.
- Superfici piatte a riposo, angoli netti da 4px, bottoni a pillola.
- Evidenziatori a parallelogramma (`wonkyClip`) come firma, ogni istanza con inclinazione propria ma stabile.
- Movimento lento e morbido, disattivato con `prefers-reduced-motion`.

## Colors

Una palette calda e fredda insieme: blackberry e rust contro sage, slate e un navy profondo. I nomi dei token restano, i valori si possono cambiare in un solo punto (`@theme` in `src/app/global.css`).

### Primary

- **Blackberry Ink** (#48182f): il colore dell'azione. CTA, link, corsivo dei titoli di sezione, stato hover del titolo di una card. Hover più scuro **Blackberry Ink Hover** (#381325); come fondo pallido **Blackberry Pale** (#efe2e9).

### Secondary

- **Rust** (#d53302): accento caldo per tocchi mirati, come l'impulso del widget di prenotazione. Su fondo chiaro la versione pallida **Rust Pale** (#fbe3da) segna i testi evidenziati nei contenuti.
- **Gold** (#ffaa4d) e **Gold Soft** (#ffc680): evidenziatore dietro la parola chiave dell'hero home.
- **Sage** (#a0cbad): selezione del testo e evidenziatore di navigazione.
- **Slate** (#8fb1be): secondo tono freddo per evidenziatori e chip.

### Neutral

- **Night Navy** (#00012a): testo, fondi scuri, bordo forte. Non si usa mai il nero puro.
- **Muted Navy** (#4c5168) e **Light Navy** (#6b7088): testo secondario e terziario.
- **Surface White** (#ffffff), **Surface Sage** (#eaf2f1), **Surface Sand** (#fbf3e3): pagina, banda alternata fredda, banda alternata calda.
- **Hairline** (#dce6e6): bordi e separatori sottili.

### Named Rules

**The One Action Rule.** Blackberry Ink è il colore di ogni azione primaria. Rust, gold, sage e slate non fanno mai da CTA: colorano, evidenziano, segnano.

**The Inverted Action Rule.** Su Night Navy il blackberry sparisce (1,39:1): l'azione primaria si inverte in Surface Sand con testo Night Navy (18:1), hover Gold Soft. Il blackberry resta l'azione su tutti i fondi chiari. Le azioni secondarie sui fondi scuri hanno bordo bianco al 70% e testo bianco.

**The No Pure Black Rule.** Il nero più scuro è Night Navy. Un `#000` è un errore.

## Typography

**Display Font:** Fraunces (con Georgia, Times New Roman, serif)
**Body Font:** Lato (con Helvetica Neue, sans-serif)

**Character:** Fraunces è bloccato sul taglio affilato (`opsz` 144, `SOFT` 0, `WONK` 0) per restare nitido a ogni misura; Lato è un sans umanista leggibile, senza personalità propria, che lascia la scena al titolo.

### Hierarchy

- **Hero** (400, 4.2rem / 67px, 1.05): titolo della home e delle testate editoriali.
- **H1** (400, 3.15rem / 50px, 1.1): titolo di pagina.
- **H2** (400, 2.7rem / 43px, 1.12): titolo di sezione.
- **H3** (400, 1.8rem / 29px, 1.18): titolo delle card e dei sottoblocchi.
- **H4** (400, 1.35rem / 22px, 1.28): titoli minori.
- **Body Lg** (Lato 400, 1.3125rem / 21px, 1.55): introduzioni.
- **Body** (Lato 400, 1.1875rem / 19px, 1.65): testo corrente, impostato su `<body>`.
- **Body Sm** (Lato 400, 1.0625rem / 17px, 1.6): navigazione, note.
- **Caption** (Lato 400, 0.9375rem / 15px, 1.5): bottoni, didascalie.
- **Label** (Lato 500, 0.75rem / 12px, interlettera 0.18em, maiuscolo): kicker delle card, etichette di sezione.
- **Tag** (0.625rem / 10px) e **Fine** (0.6875rem / 11px): micro-testi, da usare con parsimonia.

I contenuti dal CMS (`.prose-acacia`) usano un'altra scala: h2 1.75rem, h3 1.375rem, h4 1.2rem, peso 600/700, corpo in Muted Navy con interlinea 1.75.

### Named Rules

**The Italic Title Rule.** Il corsivo Fraunces peso 400 è la voce dei titoli di sezione: un `<em>` in H1-H3 può avvolgere l'intero titolo oppure solo la parola chiave, come negli hero editoriali dal CMS. È color Blackberry Ink, con un filo sottile che si disegna quando entra in vista. I titoli dei widget e dei modali restano in corsivo Night Navy, senza filo. Il nome dell'appartamento nell'hero non è mai in corsivo.

**The Sharp Cut Rule.** Fraunces non si usa mai con `WONK` o `SOFT` attivi: il carattere "giocoso" è del solo evidenziatore, non delle lettere.

## Layout

Colonna centrale `max-w-6xl` con gutter laterali di 20px (32px da `lg`). Il ritmo verticale è ampio e si regge su bande alternate di bianco, sage e sand piuttosto che su linee. Le liste di card sono griglie di ritratti 3:4; le pagine di dettaglio alternano testo e galleria. Breakpoint: xs 400, sm 480, md 720, lg 1024, xl 1500.

L'intestazione è fissa, alta 58px, e diventa trasparente sopra gli hero scuri. L'hero resta agganciato in alto solo se la finestra è alta almeno 950px; sotto quella soglia scorre.

## Elevation & Depth

Il sistema è piatto a riposo. Le card non hanno ombra: il rilievo compare solo al passaggio del mouse, con una zoomata lenta dell'immagine (scala 1.03, 700ms) e una leggera ombra navy-tinta. La profondità statica la danno i toni di fondo, non le ombre.

### Shadow Vocabulary

- **Card** (`box-shadow: 0 1px 0 0 rgba(0, 1, 42, 0.06)`): un filo di base per card e contenitori.
- **Card Hover** (`box-shadow: 0 4px 6px -1px rgba(0, 1, 42, 0.1), 0 2px 4px -2px rgba(0, 1, 42, 0.1)`): solo in hover sull'immagine della card.

### Named Rules

**The Flat-By-Default Rule.** Una superficie ferma non ha ombra. L'ombra è la risposta a un gesto.

## Shapes

Angoli netti da 4px per card, immagini e chip (`rounded-card`); 6px e 8px per contenitori più grandi. I bottoni sono pillole piene (100px). L'unica forma "libera" è il parallelogramma dell'evidenziatore, ottenuto con `clip-path` e un'inclinazione di 6-12px, a destra o a sinistra a seconda del seme.

## Components

### Buttons

- **Shape:** pillola piena (100px), padding 14px 32px, testo Caption peso 500 con interlettera 0.06em.
- **Primary:** fondo Blackberry Ink, testo bianco; in hover passa a Blackberry Ink Hover in 300ms.
- **Secondary:** bordo sottile trasparente (bianco al 40% su fondo scuro, Night Navy al 30% su fondo chiaro), testo coerente; hover scurisce il bordo.
- **Tertiary:** solo testo sottolineato, offset 4px, il filo si rafforza in hover.
- **Focus:** anello unico globale in `:focus-visible` (2px Blackberry Ink, offset 2px, alone Surface White per restare visibile su navy e foto). La CTA invertita su Night Navy usa Gold.

### Chips (WidgetLabel)

- **Style:** testo Label maiuscolo con interlettera 0.16em, peso 600, angoli 4px, padding 4px 10px.
- **Tones:** quattro toni a coppia fondo/testo: rust (#fbe3da / #9c2602), gold (#ffeccb / #9a6e18), sage (#dcebe0 / #3f7757), slate (#e3edf1 / #3a5662).

### Cards / Containers

- **Corner Style:** 4px.
- **Background:** nessuno, la card si fonde con la pagina.
- **Image:** ritratto 3:4, clippato, zoom 1.03 in hover.
- **Content:** kicker Label in Muted Navy, titolo H3 in Night Navy che passa a Blackberry Ink in hover.
- **Signature:** dietro il nome dell'appartamento un evidenziatore a parallelogramma tinto con un colore tratto dalla foto stessa.
- **Divider:** filo Hairline solo nella lista degli appartamenti.

### Inputs / Fields

- **Style:** campo trasparente dentro un contenitore, testo Body, segnaposto Muted Navy al 70%.
- **Focus:** il campo non ha outline proprio; l'anello Blackberry Ink si disegna sul contenitore a pillola.

### Navigation

- **Style:** voci Body Sm in Muted Navy (bianco all'80% sopra un hero scuro), interlettera "wide".
- **Hover:** dietro la voce si disegna un evidenziatore wonky con tinta ciclica (sage, gold, slate, rust), il testo diventa Night Navy.
- **Mobile:** menu a tutto schermo su Night Navy con voci Fraunces grandi (da 2.75rem a 4rem) che entrano da sinistra in sequenza, con leggero rimbalzo.

### Evidenziatore wonky (firma)

Un pannello tinto a parallelogramma che si disegna da sinistra a destra in 700ms. Sulla parola chiave dell'hero home è Gold Soft; nella navigazione e nei nomi delle card segue la rotazione dei toni. Ogni istanza ha un seme stabile, quindi la stessa voce ha sempre la stessa inclinazione.

## Do's and Don'ts

### Do:

- **Do** usare Blackberry Ink (#48182f) per ogni azione primaria su fondo chiaro e per il corsivo dei titoli; su Night Navy vale l'Inverted Action Rule.
- **Do** far parlare le foto per prime: nelle pagine di dettaglio l'impatto visivo viene prima, subito dopo i fatti per verificare. È un criterio di progetto dichiarato da PRODUCT.md (principio 1), rivedibile solo se aumenta la prenotazione diretta.
- **Do** su fondo scuro tingere i kicker di Gold (#ffaa4d, 10,7:1) e il testo secondario di bianco al 60-70%.
- **Do** tenere le superfici piatte a riposo e dare rilievo solo in hover.
- **Do** passare ogni nuovo evidenziatore da `wonkyClip(seed)` con un seme stabile.
- **Do** rispettare `prefers-reduced-motion`: animazioni d'ingresso e scorrimento morbido si spengono.
- **Do** aggiungere uno stato `:focus-visible` visibile a ogni elemento interattivo nuovo. È la direzione dichiarata in PRODUCT.md: avvicinarsi a WCAG AA senza perdere impatto.

### Don't:

- **Don't** usare nero puro: il più scuro è Night Navy (#00012a).
- **Don't** colorare una CTA con rust, gold, sage o slate: sono accenti, non azioni. Fa eccezione solo lo stato hover Gold Soft della CTA invertita su Night Navy.
- **Don't** usare il verde del marchio WhatsApp come fondo di un pulsante con testo bianco (1,98:1): il verde resta nell'icona (#25d366), il pulsante è secondario.
- **Don't** attivare `WONK` o `SOFT` su Fraunces.
- **Don't** mettere ombre a riposo sulle card.
- **Don't** togliere l'outline di un campo senza un sostituto visibile.
- **Don't** usare `@import url()` per i font: Turbopack lo rimuove, i font passano da `next/font/google`.
