---
shaping: true
---

# Selettore di lingua nel menu principale — Slices

**Lavoro:** `locale-switcher` · Deriva da [`shaping.md`](./shaping.md), shape **C** · Spike chiuso in
[`spike-barra-mobile.md`](./spike-barra-mobile.md)

Tre slice, ognuna dimostrabile da sola. L'ordine mette per prime quelle a rischio basso: V1 insegna la
forma del controllo dove lo spazio abbonda, V2 la porta dove lo spazio è conteso, V3 tocca un
comportamento che riguarda tutti i visitatori.

Il breadboard è stato saltato: le affordance sono sei, su tre file già noti (`LocaleSwitcher`,
`SiteHeader`, `proxy.ts`), e i collegamenti sono già espliciti nelle parti di C.

| Slice  | Copre          | File toccati                                       | Rischio | Stato   |
| ------ | -------------- | -------------------------------------------------- | ------- | ------- |
| **V1** | C1, C2, C7     | `LocaleSwitcher/index.tsx`, `SiteHeader/index.tsx` | basso   | da fare |
| **V2** | C3, C4, C5, C6 | `SiteHeader/index.tsx`                             | medio   | da fare |
| **V3** | P1, P2, P3     | `proxy.ts`                                         | medio   | da fare |

---

## V1 — Il controllo nella barra, su desktop

**Cosa entra**

- Nuova `variant="header"` in `LocaleSwitcher`: due celle, quella attiva a fondo pieno `primary` con
  testo bianco, l'altra cliccabile. Dimensione `--text-label`, padding 6px per cella (55,7px misurati).
- Montaggio in `SiteHeader` nella terza colonna, prima della CTA, visibile da `lg` in su.
- Il contrasto segue lo stato `onLight` dell'header.

**Cosa resta fuori**

- Il mobile: la barra sotto `lg` non cambia, lo switch resta nell'overlay dov'è oggi.
- La CTA: nessuna modifica.
- `proxy.ts`.

**Done**

1. Su viewport ≥1024px il controllo è visibile nella barra senza aprire nulla, su una pagina qualsiasi.
2. Da una pagina EN, un click su IT porta **alla stessa pagina** in italiano — verificato su un mood e
   su una FAQ, cioè dove lo slug è localizzato e l'override del context entra in gioco.
3. Il controllo è leggibile in entrambi gli stati dell'header: sopra un hero scuro (`onDark`) e sulla
   barra chiara. Verifica a occhio più i rapporti di contrasto già calcolati nello spike.
4. Il footer continua a funzionare come prima (R8).
5. `tsc --noEmit`, `eslint`, `prettier --check` e `next build` verdi.

**Gotcha noti**

- `Variant` è un union type `'footer' | 'menu'`: va esteso, non sostituito — l'overlay mobile usa
  ancora `menu` fino a V2.
- Il componente è `'use client'` e non può usare gli hook di `next/navigation` (Turbopack). La
  navigazione passa già da `window.location`: non toccarla.
- Nessuna stringa hardcoded: l'etichetta accessibile del gruppo esce da `LOCALE_NAMES`, che è già lì.

---

## V2 — Il controllo nella barra, su mobile

**Cosa entra**

- Montaggio nella barra sempre visibile, fra wordmark e cluster destro, sotto `lg`.
- Rimozione dello switch dall'overlay dell'hamburger (C4): ora sta sopra, nella barra.
- Sotto 400px la CTA diventa un bottone a sola icona (calendario, `lucide-react`) con nome accessibile
  preso da `t('book')`, la chiave che oggi ne fa il testo.

**Cosa resta fuori**

- `proxy.ts`.
- Qualsiasi modifica alla CTA sopra i 400px: resta testuale come oggi.

**Done**

1. A 320, 360 e 390px il controllo è visibile nella barra senza aprire l'hamburger, **in entrambe le
   lingue** — è la larghezza inglese quella critica, non l'italiana.
2. Sotto 400px la CTA è un'icona con nome accessibile; sopra i 400px è di nuovo testuale.
3. Niente va a capo e niente esce dalla barra a 320px: verificato rimisurando con lo script dello
   spike, non a occhio.
4. Nell'overlay dell'hamburger lo switch non c'è più, e il resto dell'overlay è intatto.
5. **La classe arbitraria `min-[400px]:` è presente nel CSS di produzione**, non solo in dev: va cercata
   nel foglio di stile buildato dentro `.next/`. Su questo repo è già successo che una classe arbitraria
   non ci arrivasse.
6. `tsc --noEmit`, `eslint`, `prettier --check` e `next build` verdi.

**Gotcha noti**

- La soglia di 400px non è un breakpoint standard: `sm` (640px) e `lg` nasconderebbero la parola dove
  lo spazio abbonda (a 768px restano 467px liberi).
- L'icona da sola non basta: senza nome accessibile il bottone di prenotazione diventa muto per uno
  screen reader.
- La larghezza della CTA dipende da un record `Translation` su DatoCMS. Il margine misurato a 400px in
  inglese è ~20px: se un domani quella label si allunga, il primo posto che si rompe è questo.

---

## V3 — Il cookie scritto solo quando l'utente sceglie

**Cosa entra**

- Rimozione di `rememberLocale()` dal ramo delle visite con prefisso esplicito in `proxy.ts` (P1).
- `NEXT_LOCALE` resta scritto in un solo posto: `setLocaleCookie()` dentro `LocaleSwitcher`, cioè sul
  click (P2).

**Cosa resta fuori**

- Il suggerimento di lingua a chi atterra nella lingua sbagliata: fuori scope dichiarato in apertura.
- La negoziazione `Accept-Language`, che resta com'è per gli URL senza prefisso.

**Done**

1. Con browser in italiano e cookie puliti: visito `/en/florence/accommodations`, poi apro `/` →
   finisco su `/it`. Prima di questa slice restavo su `/en`.
2. Dopo un click sullo switch verso EN: `/` porta su `/en` e ci resta. La scelta esplicita vale ancora.
3. `NEXT_LOCALE` compare fra i cookie **solo** dopo un click sullo switch, mai per la sola visita.
4. L'header `x-next-intl-locale` continua a essere impostato: le traduzioni non devono tornare a
   cadere in inglese su `/it` (è già successo, vedi changelog v0.7.0).
5. `tsc --noEmit`, `eslint`, `prettier --check` e `next build` verdi.

**Gotcha noti**

- `rememberLocale()` è chiamata in **due** punti di `proxy.ts`: nel ramo di rewrite e in quello di
  `next()`. Vanno tolte entrambe, o il comportamento resta per metà delle pagine.
- La stessa funzione imposta il cookie sulla `NextResponse`: rimuoverla non deve toccare l'header
  `x-next-intl-locale` impostato lì accanto.
- Chi ha già un `NEXT_LOCALE` sbagliato in corpo se lo tiene finché non clicca: la slice ferma
  l'emorragia, non ripulisce i cookie già scritti. Va detto, non nascosto.

---

## Scostamenti emersi

<!-- Da riempire scrivendo i piani di dettaglio: cosa il piano ha dovuto cambiare rispetto al mandato -->

## Decisioni

- **2026-09-02 — Breadboard saltato.** Sei affordance su tre file già letti, collegamenti già espliciti
  nelle parti di C. Mapparli avrebbe prodotto un documento che ripete la shape.
- **2026-09-02 — V3 per ultima, non per prima.** È la slice che cambia il comportamento per tutti i
  visitatori, comprese le sessioni già in corso; le altre due cambiano solo ciò che si vede. Se qualcosa
  va storto, si scopre da sola invece che mescolata a un cambio di layout.
