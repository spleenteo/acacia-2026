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
| R4  | 🟡 Il cambio lingua resta sulla stessa pagina, non rimanda alla home                                   | Must-have |
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

🟡 Aggiornata il 2026-09-02 con gli esiti dello spike S1.

| Parte | Meccanismo                                                                                                                                                                               | Flag |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| C1    | 🟡🟡 `variant="header"`: due celle, riempimento **invertito per stato** — barra chiara: attiva `dark` su bianco; barra scura: attiva bianca su `dark`. Entrambe 20,2:1                   |      |
| C2    | 🟡 **Una sola istanza** nel cluster destro già esistente, nell'ordine `switch · CTA · hamburger`                                                                                         |      |
| C3    | 🟡 Su mobile la stessa istanza resta nella barra sempre visibile, fuori dall'overlay                                                                                                     |      |
| C4    | Nell'overlay mobile lo switch sparisce: sta già nella barra sopra                                                                                                                        |      |
| C5    | Il contrasto segue lo stato dell'header (`onLight`), come già fanno wordmark e hamburger                                                                                                 |      |
| C6    | 🟡🟡 **Sotto 400px la CTA diventa un bottone a sola icona** (calendario, `lucide-react`), con nome accessibile da `t('book')`. Soglia via token `--breakpoint-xs`, non classe arbitraria |      |
| C7    | 🟡 Il segmented usa `--text-label` con padding 6px: 55,7px misurati, il compromesso fra leggibilità e ingombro                                                                           |      |

**Perché C1 è cambiata due volte.** Lo spike ha misurato i bordi del design system a 1,27:1 sulla barra
chiara e 2,49:1 sopra un hero navy — sotto la soglia 3:1 per i componenti non testuali: un contenitore
delimitato solo da quel bordo ricadrebbe nel difetto che R3 esiste per togliere.

🟡 Ma la prima correzione — cella attiva a fondo `primary` — era fondata sulla coppia sbagliata. Il
14,51:1 dello spike è _bianco su primary_, cioè il testo **dentro** la cella; la coppia che decide se il
controllo **si vede** è il riempimento contro il fondo della barra, e `#48182f` su `#00012a` fa
**1,39:1** — peggio del bordo che lo spike aveva bocciato. Con il menu aperto quella è anche la
condizione più frequente su mobile. In più `CLAUDE.md` assegna a blackberry il ruolo di colore
dell'azione: spenderlo sulla cella **non** cliccabile, a 12px da una CTA già blackberry, avrebbe
aggiunto la seconda pillola piena che questo stesso documento rimprovera alla shape B.

Da qui l'inversione per stato: navy su bianco quando la barra è chiara, bianco su navy quando è scura.
Entrambe 20,2:1, e il colore dell'azione resta alla CTA.

**Perché C6 è cambiata, e a che prezzo.** Il collo di bottiglia misurato non è lo switch ma la CTA:
163,6px in inglese, il 58% della barra a 320px. Con la CTA a icona il cluster destro scende da 207,6 a
~84px e lo switch entra ovunque, 320px compresi.

La soglia di 400px non è arbitraria: è dove la CTA **testuale** smette di convivere con lo switch
(380px in inglese, 344 in italiano), più un margine. A 400px restano ~20px di margine in inglese — il
minimo accettabile, visto che la label arriva dal CMS e può allungarsi.

Il prezzo è dichiarato: sotto i 400px la CTA perde la parola, e la parola è ciò che fa cliccare un
bottone di prenotazione. Nessuna misura dice quanto costi in conversioni; è la ragione per cui vale la
pena tenerlo d'occhio dopo il rilascio (GA4 traccia già i click sui CTA di prenotazione, evento
esistente dal lavoro di luglio).

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
| R4  | 🟡 Il cambio lingua resta sulla stessa pagina, non rimanda alla home                                   | Must-have |   ❌    | ❌  | ❌  | ✅  |
| R5  | `NEXT_LOCALE` è scritto solo quando l'utente sceglie davvero, mai per il solo fatto di visitare un URL | Must-have |   ❌    | ✅  | ✅  | ✅  |
| R6  | Il nav resta di competenza dell'editor: nessuna voce di sistema mescolata a quelle del CMS             | Must-have |   ✅    | ❌  | ✅  | ✅  |
| R7  | La barra regge in EN e IT, da mobile a desktop, senza andare a capo né schiacciare la CTA              | Must-have |   ✅    | ❌  | ✅  | ✅  |
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

## Shape selezionata: C 🟡 (spike chiuso)

Con R2 e R8 promossi a Must-have, **A e B escono**: A fallisce R2, R6 e R7, B fallisce R2 e R3.
Resta **C**, che però ha ancora un ❌ su R7 per via di C6 flagged.

🟡 **Lo spike S1 ha chiuso C6, e R7 passa.** Le misure sul build di produzione hanno smentito il conto
a mano in entrambe le direzioni: il wordmark è 53px, non ~85, ma la CTA è 127,3px in italiano e 163,6
in inglese, perché la sua label viene dalle traduzioni CMS. A 320px non entrava niente in nessuna
lingua. Con C6 nella nuova forma — CTA a icona sotto 400px — il cluster destro scende a ~84px e il
controllo entra a ogni larghezza. Dettagli e numeri in `spike-barra-mobile.md`.

### Spike S1 — chiuso il 2026-09-02

Esiti completi in `spike-barra-mobile.md`. In sintesi: il controllo non entrava a 320px in nessuna
lingua, entrava da 360px in italiano e da 390px in inglese, e i bordi tenui del design system sono
sotto la soglia di contrasto. Da qui le correzioni a C1 e C6.

## Decisioni

- **2026-09-02 — R2 Must-have.** Alternativa reale scartata: tenere lo switch dentro l'overlay
  (rischio layout zero). Scartata perché chi ha il problema non apre l'hamburger per cercare una cosa
  che non sa esserci.
- **2026-09-02 — Footer tenuto.** Si accetta la ridondanza di due controlli sulla stessa pagina.
- **2026-09-02 — Il suggerimento di lingua resta fuori scope.** Chi atterra da Google su `/en` con
  browser italiano continuerà ad atterrare in inglese: P1–P3 tolgono il cookie che _incolla_ la lingua
  sbagliata, non l'atterraggio in sé. È il candidato naturale per il lavoro successivo.
- 🟡 **2026-09-02 — CTA a sola icona sotto 400px.** Scelta dell'utente fra le leve misurate dallo spike.
  L'alternativa raccomandata era una label breve dedicata sotto `lg` (una chiave `Translation` in più,
  la parola conservata); scartata. Il rischio accettato è che sotto i 400px il bottone di prenotazione
  perda la parola. Da rivedere se i click sui CTA calano: l'evento GA4 esiste già.
- 🟡 **2026-09-02 — Soglia a 400px, non a un breakpoint standard.** Sotto `sm` (640px) e sotto `lg`
  l'icona comparirebbe anche dove lo spazio abbonda (a 768px restano 467px liberi). Serve quindi una
  soglia arbitraria `min-[400px]:`, e il Done della slice deve verificare che la classe sopravviva al
  build: su questo repo è già successo che una classe arbitraria non finisse nel CSS di produzione.
- 🟡 **2026-09-02 — Fase impatto: 21 problemi, le slice riscritte.** Cinque lenti in parallelo. Quattro
  problemi trovati indipendentemente da tre lenti diverse. Dettaglio in `slices.md`, sezione _Cosa ha
  trovato la fase impatto_.
- 🟡 **2026-09-02 — R4 era ✅ a torto, per CURRENT e per tutte le shape.** L'`href` renderizzato dallo
  switcher punta alla home su ogni pagina che non pubblichi URL alternati — cioè tutte tranne mood, FAQ
  e blog. Il click sinistro funziona perché il target vero è calcolato in `onClick`; cmd-click, tasto
  centrale, apri-in-nuova-scheda e i crawler no. Il difetto esiste già oggi, ma questo lavoro lo
  promuove da sepolto-nel-footer a primo elemento di ogni pagina, quindi lo risolve V1.
- 🟡 **2026-09-02 — Il cookie viene rinominato e rinnovato solo se esiste.** Safari tronca a 7 giorni i
  cookie scritti da JS: senza rinnovo server-side condizionale, R5 verrebbe soddisfatto e subito
  disfatto. La rinomina dà un taglio netto ai cookie già in circolazione.
- 🟡 **2026-09-02 — Debito accettato: `aria-label="Language"` resta inglese.** Deroga consapevole a
  `CLAUDE.md` § UI Translations, stesso giudizio applicato in `pre-launch-review.md` ad
  `aria-label="Breadcrumb"`.
