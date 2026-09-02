---
shaping: true
---

# Spike S1 — lo spazio nella barra mobile

Relativo a `shaping.md`, parte **C6** (flagged). Chiude il ❌ di C su R7.

## Context

La shape C mette il selettore di lingua nella barra sempre visibile anche su mobile (C3). Il conto a
mano fatto durante lo shaping finiva sul filo: ~69px liberi contro 64–70 richiesti. Un conto sul filo
non è una risposta, quindi le misure sono state prese sul sito vero.

**Metodo**: build di produzione servito su `localhost:3111`, Playwright con il Chrome di sistema,
`getBoundingClientRect()` sugli elementi reali dell'header a quattro viewport. Le forme candidate sono
state iniettate nel DOM della pagina e misurate con i token tipografici del design system letti da
`:root`, così le larghezze vengono dal font vero alla dimensione vera. Script in
`scratchpad/spike-s1.mjs`, `spike-s1b.mjs`, `cta-en.mjs`.

## Esiti

### S1-Q1 — quanto spazio resta davvero

Il wordmark misura **53px** (non ~85 come stimato) e il cluster destro dipende dalla lingua, perché la
label della CTA arriva dalle traduzioni.

| Viewport | Contenuto | Wordmark | Cluster destro      | Libero **IT** | Libero **EN** |
| -------- | --------- | -------- | ------------------- | ------------- | ------------- |
| 320px    | 280       | 53       | IT 171,3 · EN 207,6 | **55,7**      | **19,4**      |
| 360px    | 320       | 53       | —                   | 95,7          | 59,4          |
| 390px    | 350       | 53       | —                   | 125,7         | 89,4          |
| 430px    | 390       | 53       | —                   | 165,7         | 129,4         |

Lo spazio _utilizzabile_ è minore: servono due gap da 12px (`gap-3`) per separare lo switch dal
wordmark e dal cluster. Quindi −24px da ogni cella della tabella.

### S1-Q2 — quanto misura il controllo

Misurato con Lato ai token del design system (`--text-caption` .9375rem, `--text-label` .75rem,
`--text-tag` .625rem):

| Forma                                          | Larghezza | Altezza |
| ---------------------------------------------- | --------- | ------- |
| Segmented, caption, padding 8px                | 71,1      | 25      |
| Segmented, caption, padding 6px                | 63,1      | 25      |
| Segmented, label, padding 8px                  | 63,7      | 22      |
| Segmented, label, padding 6px                  | 55,7      | 22      |
| Segmented, tag, padding 6px                    | 50,8      | 20      |
| Pillola singola (solo l'altra lingua), caption | 43,9      | 25      |
| Pillola singola, label                         | 39,5      | 22      |
| Forma attuale `EN / IT` (riferimento)          | 49,6      | 23      |

### S1-Q3 — la vera leva è la CTA, non lo switch

**Il collo di bottiglia non è il selettore.** La CTA occupa da sola il 45% della barra in italiano e il
**58% in inglese**:

| Locale | Label CTA            | Larghezza |
| ------ | -------------------- | --------- |
| `it`   | "Disponibilità"      | 127,3     |
| `en`   | "Check availability" | 163,6     |

Incrociando con S1-Q2, il segmented più piccolo (50,8 + 24 di gap = 74,8) entra:

- in **italiano** da 360px;
- in **inglese** solo da **390px**.

A 320px non entra niente in nessuna delle due lingue: in inglese restano 19,4px, meno della pillola
singola più compatta.

**E il vincolo non è nemmeno stabile.** `t('book')` viene dal modello `Translation` su DatoCMS: un
editor può allungare quella label domani e rompere il layout senza toccare il codice. Qualsiasi
soluzione che assuma una larghezza fissa della CTA è appesa a un contenuto che non governiamo.

Leve disponibili, in ordine di efficacia:

| Leva                                                           | Guadagno | Nota                                                                |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| Label CTA breve sotto `lg` (nuova chiave, es. `nav.bookShort`) | ~60–90px | Risolve entrambe le lingue e toglie la dipendenza dalla label lunga |
| CTA a sola icona sotto una soglia                              | ~100px   | Perde la parola, e la parola è ciò che fa cliccare                  |
| `gap-3` → `gap-2` nel cluster                                  | 4px      | Marginale                                                           |
| Padding CTA `px-4` → `px-3`                                    | 8px      | Marginale                                                           |
| Switch a sinistra accanto al wordmark                          | 0        | Sposta il problema: il totale della riga non cambia                 |

### S1-Q4 — il contrasto, e una scoperta su R3

Rapporti WCAG calcolati sui token reali (`#00012a` navy, `#4c5168` muted, `#48182f` primary,
`#dce6e6` border):

| Combinazione                             | Rapporto  | Esito        |
| ---------------------------------------- | --------- | ------------ |
| Testo `dark` su barra bianca (`onLight`) | **20,24** | ✅           |
| Testo `muted` su barra bianca            | **7,82**  | ✅           |
| Bordo `border` (#dce6e6) su barra bianca | **1,27**  | ❌ sotto 3:1 |
| Testo bianco su hero navy (`onDark`)     | **20,24** | ✅           |
| Bianco/55 su hero navy                   | **6,19**  | ✅           |
| Bordo bianco/30 su hero navy             | **2,49**  | ❌ sotto 3:1 |
| Cella attiva: bianco su `primary`        | **14,51** | ✅           |

**Il bordo tenue del design system non basta a far leggere il controllo come tale**: 1,27 su fondo
chiaro e 2,49 su fondo scuro sono entrambi sotto la soglia 3:1 per i componenti non testuali. Un
segmented delimitato solo da quel bordo ricadrebbe nel difetto che R3 vuole togliere.

Ciò che regge è il **riempimento della cella attiva** (14,51 con `primary`). La forma deve dire "questa
è attiva, quell'altra è cliccabile" con un fondo pieno, non con una linea.

## Conclusioni

1. **C3 non regge come descritta.** Sotto i 390px in inglese e sotto i 360px in italiano, lo switch non
   entra nella barra insieme alla CTA attuale. R7 resta ❌ finché la shape non prende una leva.
2. **La leva giusta è la label della CTA sotto `lg`**, non la compressione dello switch: è l'unico
   intervento che libera abbastanza spazio in entrambe le lingue e che toglie di mezzo una dipendenza
   da contenuto editabile.
3. **C1 va corretta**: la cella attiva è a fondo pieno `primary`, non un contenitore con bordo tenue.
   Questa è una modifica alla shape che arriva dallo spike, non una scelta di stile.

## Accettazione

Chiusa. Sappiamo, con numeri misurati sul sito e non stimati, che il controllo **non** entra nella barra
a 320px in nessuna lingua, entra da 360px in italiano e da 390px in inglese, e che la strada per farlo
entrare ovunque passa dall'accorciare la CTA su mobile.
