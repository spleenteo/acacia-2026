---
shaping: true
---

# Selettore di lingua nel menu principale — Slices

**Lavoro:** `locale-switcher` · Deriva da [`shaping.md`](./shaping.md), shape **C** · Spike chiuso in
[`spike-barra-mobile.md`](./spike-barra-mobile.md)

> 🟡 **Riscritte il 2026-09-02 dopo la fase impatto.** Cinque lenti (Existence, Flusso e vicini, Memoria
> e debito, Context e consumer, Copertura test) hanno prodotto 21 problemi distinti, quattro dei quali
> trovati indipendentemente da tre lenti diverse. La versione precedente di questo documento dava per
> scontate cose false: i dettagli stanno in fondo, sotto _Cosa ha trovato la fase impatto_.

Tre slice, ognuna dimostrabile da sola. Il breadboard è stato saltato: le affordance sono sei, su file
già noti, e i collegamenti sono espliciti nelle parti di C.

| Slice  | Copre          | File toccati                                                                      | Rischio | Stato   |
| ------ | -------------- | --------------------------------------------------------------------------------- | ------- | ------- |
| **V1** | C1, C2, C7     | `LocaleSwitcher/index.tsx`, `SiteHeader/index.tsx`                                | medio   | da fare |
| **V2** | C3, C4, C5, C6 | `SiteHeader/index.tsx`, `global.css`, `scripts/measure-header.mjs`                | medio   | da fare |
| **V3** | P1, P2, P3     | `proxy.ts`, `LocaleSwitcher/index.tsx`, `NotFoundScene`, `error.tsx`, `CLAUDE.md` | medio   | da fare |

**Una sola istanza del componente.** Il piano precedente ne montava due (una desktop, una mobile) più
quella del footer: tre `role="group"` identici nel DOM. Ne va montata **una sola**, dentro il cluster
destro che già esiste (`SiteHeader/index.tsx:161`), nell'ordine `switch · CTA · hamburger`. Costa un
gap invece di due — 12px recuperati a ogni viewport, e a 320px il margine è tutto — e lascia la griglia
desktop `lg:grid-cols-[1fr_auto_1fr]` con i suoi tre figli, invece di dargliene un quarto che manderebbe
il cluster a capo.

**Il repo non ha test.** Zero file di test, nessun runner, nessuna CI di verifica (l'unico workflow è il
cron di re-index del Site Search). Ogni criterio Done che non sia `tsc`/`eslint`/`prettier`/`build` è
manuale: per questo qui sotto sono scritti come comandi eseguibili e non come descrizioni.

---

## V1 — Il controllo nella barra, su desktop

**Cosa entra**

- `variant="header"` in `LocaleSwitcher`, montata **una volta** nel cluster destro con `hidden lg:flex`
  (in V2 diventerà visibile a tutte le larghezze).
- Forma: due celle, `--text-label` con padding 6px (55,7px misurati). **Colore invertito per stato**:
  - barra chiara (`onLight`): cella attiva `dark` pieno con testo bianco (20,2:1), cella idle `text-muted` (7,8:1);
  - barra scura: cella attiva **bianca** con testo `dark` (20,2:1), cella idle `text-white/70`.
- **Nuova prop `onLight: boolean`**, passata da `SiteHeader`. Non è ricostruibile dentro il componente:
  deriva da `menuOpen`, `scrolled` e `useHeaderOverDark()`, e il footer sta fuori da `HeaderThemeProvider`.
- **`tone` diventa `Record<Variant, Tone>`**, non più un ternario.
- **`href` corretto al mount**: `useEffect(() => setPath(window.location.pathname), [])` e
  `override?.[l] ?? (path ? switchLocalePath(path, locale, l) : '/' + l)`.
- `trackEvent('locale_switch', { from, to, source: variant })` in `handleSwitch`.

**Cosa resta fuori**

- Il mobile: sotto `lg` la barra non cambia, lo switch resta nell'overlay dov'è oggi.
- La CTA e `proxy.ts`.

**Done**

1. A 1280px il controllo è visibile nella barra senza aprire nulla.
2. Da `/en/moods/slow-tourism`, da una FAQ profonda e da un post `/en/magazine/<slug>`, un click su IT
   porta alla **stessa pagina** in italiano. Il blog è il caso che attraversa insieme il rewrite del
   proxy e l'override del contesto, ed era l'unico dei tre escluso.
3. **In nuova scheda funziona come il click**: `curl -s http://localhost:3111/en/moods/slow-tourism | grep -o '<a[^>]*hrefLang[^>]*>'`
   non deve contenere `href="/it"` secco. Verificare anche con cmd-click.
4. Contrasto, misurato e non a occhio: su una pagina con hero scuro, unscrolled, cella attiva bianca su
   fondo scuro; dopo `window.scrollTo(0,100)` l'header passa a `onLight` e la cella attiva è navy su
   bianco. Nessun bordo è l'unico delimitatore del controllo.
5. Il footer è intatto: `variant="footer"` non toccata, su `/en/moods/slow-tourism` il suo switch porta
   ancora a `/it/moods/turismo-lento`.
6. `npx tsc --noEmit`, `npm run lint`, `npm run build` verdi.

**Gotcha noti**

- Estendere l'union `Variant` **compila pulito** e manda la variante nuova nel ramo `else` del ternario:
  testo bianco su barra bianca, senza un solo errore. Da qui la mappa `Record<Variant, Tone>`.
- Il markup è unico per tutte le varianti e stampa sempre il separatore `/`: il segmented richiede un
  ramo di render, non solo un tono in più.
- Il componente è `'use client'` e non può usare gli hook di `next/navigation` (Turbopack). `useEffect`
  su `window.location` va bene, `usePathname` no.
- `aria-label="Language"` resta la stringa inglese hardcoded — **debito dichiarato**, vedi Decisioni.

---

## V2 — Il controllo nella barra a ogni larghezza, e la CTA a icona

**Cosa entra**

- Lo switch perde `hidden lg:`: una sola istanza, visibile a tutte le larghezze.
- Rimozione dello switch dall'overlay dell'hamburger (C4) e della variante `menu`, che resta senza
  chiamanti. `onNavigate` resta e viene passata dal mount nella barra: la barra è `z-50` sopra l'overlay
  `z-40`, quindi lo switch è cliccabile a menu aperto e senza callback l'overlay resterebbe aperto con
  `body { overflow: hidden }` per tutta la navigazione.
- `--breakpoint-xs: 400px` nel blocco `@theme` di `global.css`: variante `xs:` di prima classe, non una
  classe arbitraria. Sotto quella soglia la CTA diventa un bottone a sola icona (`Calendar` di
  `lucide-react`, `aria-hidden`), con nome accessibile da `t('book')` sul bottone.
- L'icona è dimensionata **come la pillola che sostituisce**, non più grande: l'altezza della barra è un
  budget, non una variabile libera.
- GA4: sorgenti distinte — `'header-bar'`, `'header-icon'`, `'header-menu'` — al posto dell'unico
  `'header'` che oggi aggrega barra e overlay.
- `scripts/measure-header.mjs` versionato, con `playwright` in `devDependencies`.

**Cosa resta fuori**

- `proxy.ts` e tutto ciò che riguarda il cookie.
- La CTA sopra i 400px, che resta testuale.

**Done**

1. Matrice `{it,en} × {320,360,390}px`, con lo script versionato: `rowOverflows === false`, nessun
   elemento fuori dai bordi interni, nessun elemento che va a capo. **Non** la sottrazione usata nello
   spike: quella somma wordmark e cluster e ignorerebbe proprio l'elemento aggiunto in mezzo,
   restituendo un numero rassicurante mentre la barra straborda.
2. `headerHeight === 58` su tutta la matrice, con e senza scroll. `--header-height` è una costante
   scritta a mano, letta da sette punti fra `main`, overlay, hero e ancore `scroll-mt`: se cresce, il
   sintomo non è nell'header ma in file che nessuno sta guardando.
3. A 390px un tap sull'icona apre la `BookingModal` come il bottone testuale, e
   `page.getByRole('button', { name: 'Check availability' })` la trova anche a 320px.
4. Sopra i 400px la CTA è di nuovo testuale.
5. Nell'overlay lo switch non c'è più; le voci cascano con lo stesso stagger, la riga Contact+Book resta
   a due colonne uguali, il bordo superiore c'è ancora. Screenshot before/after a 390px.
6. Un solo gruppo "Language" visibile per viewport, più quello del footer.
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` verdi.

**Gotcha noti**

- **`sm` in questo progetto è 480px, non 640** (`global.css:128-131` ridefinisce i breakpoint). Il
  motivo per cui non si usa `sm:` è che fra 400 e 480px la parola ci starebbe: sono 80px di differenza,
  non 240.
- La larghezza della CTA dipende da un record `Translation` su DatoCMS. Il margine a 400px in inglese è
  ~32px con una sola istanza: se quella label si allunga, il primo posto che si rompe è questo.
- `'Apri menu'` / `'Chiudi menu'` (`SiteHeader/index.tsx:178`) sono hardcoded **in italiano** e serviti
  anche agli utenti inglesi. Bug preesistente, si lavora accanto: non toccarlo, ma è annotato.

---

## V3 — Il cookie scritto solo quando l'utente sceglie

**Cosa entra**

- **Rinomina del cookie** in `acacia_locale`, nei due soli punti che lo toccano. Il vecchio
  `NEXT_LOCALE` diventa inerte per tutti nell'istante del deploy, invece di restare addosso ai
  visitatori ricorrenti fino a 365 giorni. `next-intl` qui non lo usa: risolve il locale via
  `x-next-intl-locale` e `requestLocale`, non via cookie.
- Rimozione delle due chiamate a `rememberLocale()` dai rami di visita con prefisso esplicito, **e**
  della funzione e di `ONE_YEAR` che restano orfani (`tsconfig` non ha `noUnusedLocals`: passerebbero
  inosservati).
- **Rinnovo condizionale**: il proxy riscrive il cookie solo se ne trova già uno valido. Safari (ITP)
  tronca a 7 giorni i cookie scritti da JavaScript ignorando il `max-age`; finora il limite era
  mascherato dalla riscrittura server-side a ogni visita. Senza questo, su iPhone la scelta esplicita
  svanisce dopo una settimana e il Done #2 passerebbe il test manuale fallendo all'ottavo giorno.
- **Riscrittura di `CLAUDE.md:52`**, che dice «redirects paths without locale prefix to `/en`»: già
  falso oggi, e dopo V3 diventa la descrizione del comportamento opposto. Insieme alla decisione
  archiviata A12 del lavoro `init` formerebbe due fonti concordi che invitano a rimettere l'hard
  redirect, annullando questa slice in buona fede.
- **404 ed errore**: `NotFoundScene` e `error.tsx` ricavano il prefisso da `window.location.pathname` e
  puntano a `/<locale>` con fallback `/en`. Oggi il loro link nudo a `/` atterrava nella lingua che si
  stava leggendo grazie al cookie scritto a ogni visita; senza correzione, dopo V3 un italiano che
  legge `/en/...` dopo un 404 si ritroverebbe su `/it`.

**Cosa resta fuori**

- Il suggerimento di lingua a chi atterra nella lingua sbagliata: fuori scope dall'apertura.
- La negoziazione `Accept-Language`, che resta com'è per gli URL senza prefisso.

**Done** — baseline da registrare in `STATUS.md` **prima** di toccare `proxy.ts`, o metà del criterio 1
diventa non verificabile per costruzione. Baseline già catturato il 2026-09-02: `location: /en`.

1. `curl -s -o /dev/null -D - -c /tmp/jar -H 'Accept-Language: it-IT,it;q=0.9' http://localhost:3111/en/florence/accommodations`
   → nessuna riga `Set-Cookie`; `x-next-intl-locale: en` resta.
2. Con quel jar, `curl … -b /tmp/jar … http://localhost:3111/` → `location: /it` (oggi: `/en`).
3. Dopo un click sullo switch verso EN (Playwright, contesto isolato con
   `extraHTTPHeaders: {'Accept-Language': 'it-IT,it;q=0.9'}`): il cookie compare, e `/` porta a `/en`.
   Prima del click `ctx.cookies()` è vuoto.
4. `x-next-intl-locale` su **entrambi** i rami — `curl -sI /it` e `curl -sI /it/firenze/appartamenti` —
   più il sintomo vero: `curl -s /it | grep -c 'Disponibilità'` > 0 e `grep -c 'Check availability'` = 0.
   L'header è il meccanismo, la stringa inglese su pagina italiana è l'osservabile (regressione v0.7.0).
5. **I 301 di canonicalizzazione sopravvivono**: `/it/florence/accommodations` → 301 verso
   `/it/firenze/appartamenti`; `/en/blog` → 301 verso `/en/magazine`. Vivono nello stesso ramo che V3
   modifica, e `build` e `tsc` resterebbero verdi se si rompessero.
6. Da un 404 in inglese, il link "torna alla home" porta a `/en`, non a `/it`.
7. `npx tsc --noEmit`, `npm run lint`, `npm run build` verdi.

**Gotcha noti**

- `rememberLocale()` è chiamata in **due** punti (`proxy.ts:83` e `:90`), adiacenti alle due
  `headers.set('x-next-intl-locale')` (`:82` e `:89`), che vanno lasciate stare.
- Il ramo `if (restOfPath && restOfPath !== '/')` contiene sia il 301 sia il rewrite: un errore di
  editing lì dentro rompe il lavoro SEO di `c18bb9c` senza che nessun gate se ne accorga.

---

## Cosa ha trovato la fase impatto

Le voci che hanno cambiato le slice, con la lente che le ha trovate. Le altre sono già incorporate sopra.

| #   | Problema                                                                                         | Lenti |
| --- | ------------------------------------------------------------------------------------------------ | ----- |
| 1   | Cella attiva `primary` = 1,39:1 sul navy, peggio del bordo che lo spike aveva bocciato           | 3     |
| 2   | `href` renderizzato = home su ogni pagina senza alternate: **R4 era ✅ a torto**                 | 3     |
| 3   | `aria-label="Language"` hardcoded: il gotcha diceva il falso                                     | 3     |
| 4   | `--header-height` è una costante fissa letta da sette punti, e già disallineata                  | 3     |
| 5   | Safari ITP: 7 giorni per i cookie scritti da JS, finora mascherati dalla riscrittura server-side | 1     |
| 6   | GA4 aggrega barra e overlay sotto `'header'`: la leva che giustifica C6 non misura               | 2     |
| 7   | `sm` è 480px, non 640: l'argomento della soglia era costruito su un numero sbagliato             | 2     |
| 8   | Lo script dello spike non è nel repo, e ignorerebbe l'elemento che V2 aggiunge                   | 2     |
| 9   | `CLAUDE.md:52` + A12 archiviata dicono l'opposto di V3                                           | 1     |
| 10  | Il ternario `tone`: estendere l'union compila pulito e veste male la variante nuova              | 2     |
| 11  | `onLight` non è raggiungibile dal componente: serve una prop che V1 non dichiarava               | 2     |
| 12  | 404 ed errore cambiano lingua dopo V3                                                            | 1     |
| 13  | Nessuna metrica dice se il lavoro ha risolto il problema                                         | 1     |
| 14  | Due istanze evitabili, e costano 12px dove il margine è tutto                                    | 1     |
| 15  | I 301 di `proxy.ts` non erano coperti da nessun criterio                                         | 1     |
| 16  | Il blog era escluso dalle pagine di prova di V1                                                  | 1     |

Verificato pulito, e quindi non più da temere: stega (le traduzioni non ne portano), Turbopack (nessun
hook di `next/navigation` introdotto), Iubenda e Beddy (prendono la lingua dalla route, non dal cookie),
sitemap/canonical/hreflang (non dipendono dal proxy), Googlebot (non manda `Accept-Language`, continua a
risolvere `/` in inglese), `AlternateLocaleProvider` (avvolge davvero l'header), e la variante
`min-[Npx]:` (arriva in produzione — l'incidente storico riguardava valori con underscore in `calc()`).

## Scostamenti emersi

<!-- Da riempire scrivendo i piani di dettaglio -->

## Decisioni

- **2026-09-02 — Breadboard saltato.** Sei affordance su file già letti.
- **2026-09-02 — V3 per ultima.** È la sola che cambia il comportamento per tutti i visitatori: se
  sbanda, conviene che lo faccia da sola invece che mescolata a un cambio di layout.
- **2026-09-02 — Una sola istanza del componente.** Recupera 12px, toglie due gruppi duplicati dal DOM,
  lascia la griglia desktop a tre figli.
- **2026-09-02 — Cella attiva invertita per stato**, non `primary`. Blackberry è il colore dell'azione:
  spenderlo sulla cella non cliccabile, a 12px da una CTA già blackberry, avrebbe aggiunto la seconda
  pillola piena che lo shaping rimproverava alla shape B.
- **2026-09-02 — Soglia 400px con token `xs`, non `sm`.** Con una sola istanza la CTA testuale entra da
  ~370px in inglese; a 400 il margine è ~32px. `sm` (480) userebbe l'icona in una fascia di 80px dove la
  parola ci starebbe.
- **2026-09-02 — Cookie rinominato in `acacia_locale`.** Taglio netto: il vecchio diventa inerte al
  deploy invece di restare addosso ai ricorrenti per un anno.
- **2026-09-02 — Rinnovo server-side condizionale.** Alternativa scartata: cookie server-side sul click
  con redirect, concettualmente più pulito ma un redirect in più a ogni cambio lingua.
- **2026-09-02 — `aria-label="Language"` resta hardcoded: debito dichiarato.** Stesso giudizio che
  `docs/pre-launch-review.md:52` applica a `aria-label="Breadcrumb"`. Nessun record `Translation` nuovo
  in questo lavoro. Va scritto qui perché è una deroga consapevole a `CLAUDE.md` § UI Translations, non
  una svista: chi la trova fra sei mesi deve sapere che è stata guardata e lasciata.
