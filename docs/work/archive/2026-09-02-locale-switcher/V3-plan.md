# V3 — Il cookie scritto solo quando l'utente sceglie: piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smettere di memorizzare una lingua che nessuno ha scelto, senza che la scelta vera evapori dopo una settimana su Safari e senza lasciare in giro le conseguenze.

**Architecture:** Il proxy smette di scrivere il cookie a ogni visita e si limita a **rinnovare** quello che trova, col valore che ha già. Il cookie cambia nome, così quelli sbagliati già in circolazione diventano inerti al deploy invece di restare addosso ai visitatori per un anno. Le pagine 404 ed errore imparano da sole in che lingua stavano, perché il loro link nudo a `/` dipendeva proprio dal cookie che togliamo.

**Tech Stack:** Next.js proxy (edge), React 19 client component per il link locale-aware.

## Global Constraints

- **`x-next-intl-locale` non si tocca.** Le due `headers.set` a `proxy.ts:82` e `:89` stanno accanto alle due chiamate da rimuovere: perderle significa rimandare tutte le pagine italiane in inglese, che è già successo (changelog v0.7.0).
- **Il ramo `if (restOfPath && restOfPath !== '/')` contiene anche i 301 di canonicalizzazione**: sono lavoro SEO recente (`c18bb9c`) e nessun gate se ne accorgerebbe.
- **Niente hook di `next/navigation`** nei componenti client.
- **Le lezioni di V1 e V2 valgono qui**: `lsof` non `pkill`, `/bin/rm`, restringere i selettori a `header`, e verificare che un'asserzione sappia fallire.

**Baseline registrato prima di toccare il codice** (2026-09-02): `/` con `Accept-Language: it-IT` → `location: /en`, e una visita a `/en/...` risponde `Set-Cookie: NEXT_LOCALE=en`.

---

## File Structure

| File                                      | Responsabilità dopo V3                                    |
| ----------------------------------------- | --------------------------------------------------------- |
| `src/proxy.ts`                            | Rinnova il cookie se esiste, non lo crea mai. Nome nuovo. |
| `src/components/LocaleSwitcher/index.tsx` | Scrive il cookie col nome nuovo: resta l'unico a crearlo. |
| `src/components/HomeLink/index.tsx`       | Nuovo: link alla home nella lingua che si stava leggendo. |
| `src/components/NotFoundScene/index.tsx`  | Usa `HomeLink` invece di `href="/"`.                      |
| `src/app/[locale]/error.tsx`              | Idem.                                                     |
| `CLAUDE.md`                               | La riga sul proxy dice quello che il proxy fa davvero.    |

---

### Task 1: Il cookie nel proxy

**Files:**

- Modify: `src/proxy.ts`

- [ ] **Step 1: Rinominare la costante**

```ts
/**
 * The name changed with the rename in V3: every `NEXT_LOCALE` already on a
 * visitor's machine — most of them written by a visit rather than a choice —
 * goes inert the moment this ships, instead of steering them for another year.
 * next-intl does not read it: it resolves the locale from `x-next-intl-locale`
 * and `requestLocale`, so the conventional name bought us nothing.
 */
const LOCALE_COOKIE = 'acacia_locale';
```

- [ ] **Step 2: Sostituire `rememberLocale` con un rinnovo condizionale**

```ts
/**
 * Refreshes an existing choice; never creates one. Two reasons it exists at
 * all instead of simply dropping the write:
 *
 * - Safari's ITP caps cookies written by JavaScript at seven days, ignoring
 *   max-age. Until now the per-visit `Set-Cookie` hid that: without a
 *   server-side renewal the explicit choice would quietly expire after a week,
 *   which is the very defect this slice removes, arriving from the other side.
 * - It renews the value it finds, not the locale of the page being visited.
 *   Renewing with the visited locale would be the old behaviour under a new
 *   name.
 */
function renewLocaleChoice(request: NextRequest, response: NextResponse) {
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  if (chosen && locales.includes(chosen as Locale)) {
    response.cookies.set(LOCALE_COOKIE, chosen, {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
    });
  }
}
```

- [ ] **Step 3: Aggiornare le due chiamate**

Alle righe 83 e 90, `rememberLocale(response, locale)` diventa `renewLocaleChoice(request, response)`. Le `headers.set('x-next-intl-locale', locale)` adiacenti restano intatte.

- [ ] **Step 4: Verificare**

```bash
npx tsc --noEmit && npm run lint 2>&1 | grep problems
grep -n "rememberLocale\|ONE_YEAR\|LOCALE_COOKIE" src/proxy.ts
```

Atteso: nessun errore; `rememberLocale` non compare più; `ONE_YEAR` e `LOCALE_COOKIE` sono ancora usati (dal rinnovo e da `negotiateLocale`).

---

### Task 2: Il nome nuovo anche nello switcher

**Files:**

- Modify: `src/components/LocaleSwitcher/index.tsx`

- [ ] **Step 1: Cambiare il nome scritto dal click**

```ts
function setLocaleCookie(locale: Locale) {
  document.cookie = `acacia_locale=${locale};path=/;max-age=${ONE_YEAR};samesite=lax`;
}
```

- [ ] **Step 2: Verificare che non resti traccia del vecchio nome**

```bash
grep -rn "NEXT_LOCALE" src/ | grep -v "x-next-intl-locale"
```

Atteso: nessun risultato.

---

### Task 3: La home nella lingua che si stava leggendo

**Files:**

- Create: `src/components/HomeLink/index.tsx`
- Modify: `src/components/NotFoundScene/index.tsx`, `src/app/[locale]/error.tsx`

**Interfaces:**

- Produces: `<HomeLink className="…">children</HomeLink>`, che punta a `/<locale corrente>`.

- [ ] **Step 1: Il componente**

```tsx
'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { type Locale, locales, defaultLocale } from '@/i18n/config';

/**
 * "Back home" for the pages that live outside the locale layout — 404 and the
 * error boundary. They have no locale context, and their bare `/` used to land
 * in the language the visitor was reading only because the proxy rewrote the
 * cookie on every visit. V3 stops doing that, so the link has to work it out
 * from the URL instead — otherwise an Italian reading /en/... gets sent to /it
 * right after something already went wrong.
 *
 * Reads location through useSyncExternalStore for the same reasons as
 * LocaleSwitcher: react-hooks forbids setState in an effect, the server
 * snapshot is null instead of a hydration mismatch, and next/navigation's
 * hooks are off limits under Turbopack.
 */
const subscribe = () => () => {};
const getPathname = () => window.location.pathname;
const getServerPathname = () => null;

export default function HomeLink({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const pathname = useSyncExternalStore(subscribe, getPathname, getServerPathname);
  const segment = pathname?.split('/')[1];
  const locale = locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;

  return (
    <Link href={`/${locale}`} className={className} style={style}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Usarlo nelle due pagine**

In `NotFoundScene/index.tsx` e in `error.tsx`, sostituire `<Link href="/" …>` con `<HomeLink …>` mantenendo `className` e `style` invariati, e aggiungere l'import. In `NotFoundScene` va tolto l'import di `Link` se non resta usato altrove — verificarlo con un grep, non a memoria.

- [ ] **Step 3: Verificare**

```bash
npx tsc --noEmit && npm run lint 2>&1 | grep problems
```

---

### Task 4: `CLAUDE.md` dice quello che il proxy fa

**Files:**

- Modify: `CLAUDE.md` (la riga sul proxy nella sezione "Locale routing")

- [ ] **Step 1: Riscrivere la riga**

Da «`proxy.ts` … redirects paths without locale prefix to `/en`» a una descrizione vera:

> `proxy.ts` (the Next.js 16 replacement for the deprecated `middleware` convention) content-negotiates the locale for prefix-less paths — an explicit choice in the `acacia_locale` cookie first, then `Accept-Language`, then English — and rewrites translated path segments to canonical filesystem paths. The cookie is written **only** by a click on the language switcher; the proxy renews an existing one but never creates it.

La riga com'era è già falsa oggi, e insieme alla decisione archiviata A12 del lavoro `init` («redirect `/` → `/en`, nessuna content negotiation») formerebbe due fonti concordi che invitano a rimettere l'hard redirect, annullando questa slice in buona fede.

---

### Task 5: Verificare il Done

- [ ] **Step 1: Build e server**

```bash
lsof -ti tcp:3111 | xargs kill 2>/dev/null
/bin/rm -rf .next && npm run build 2>&1 | grep -E "Compiled|error"
PORT=3111 npm run start & until curl -s -o /dev/null http://localhost:3111/it; do sleep 1; done
```

- [ ] **Step 2: Done #1 e #3 — nessun cookie da una visita**

```bash
/bin/rm -f /tmp/jar
curl -s -o /dev/null -D - -c /tmp/jar -H 'Accept-Language: it-IT,it;q=0.9' \
  http://localhost:3111/en/florence/accommodations | grep -iE '^(set-cookie|x-next-intl-locale)'
```

Atteso: **nessuna** riga `set-cookie`; `x-next-intl-locale: en` presente. Baseline pre-V3: `Set-Cookie: NEXT_LOCALE=en`.

```bash
curl -s -o /dev/null -D - -b /tmp/jar -H 'Accept-Language: it-IT,it;q=0.9' \
  http://localhost:3111/ | grep -i '^location'
```

Atteso: `location: /it`. Baseline pre-V3: `/en`.

- [ ] **Step 3: Done #2 — la scelta esplicita vale ancora, e viene rinnovata**

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ locale: 'it-IT', extraHTTPHeaders: { 'Accept-Language': 'it-IT,it;q=0.9' } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3111/en/florence/accommodations', { waitUntil: 'domcontentloaded' });
  console.log('cookie prima del click:', (await ctx.cookies()).map(c => c.name));
  await p.locator('header').getByRole('link', { name: 'Italiano' }).click();
  await p.waitForURL(/\\/it\\//, { timeout: 8000 }).catch(() => {});
  console.log('dopo il click:', (await ctx.cookies()).map(c => c.name + '=' + c.value));
  await p.goto('http://localhost:3111/');
  console.log('la home segue la scelta:', new URL(p.url()).pathname);
  await b.close();
});
"
```

Atteso: prima del click nessun cookie; dopo, `acacia_locale=it`; la home porta a `/it` malgrado l'`Accept-Language` sia italiano — il controllo vero è il caso opposto, quindi ripetere con una scelta verso EN e verificare che `/` porti a `/en`.

- [ ] **Step 4: Done #4 — le traduzioni non cadono**

```bash
curl -sI http://localhost:3111/it | grep -i x-next-intl-locale
curl -sI http://localhost:3111/it/firenze/appartamenti | grep -i x-next-intl-locale
curl -s http://localhost:3111/it | grep -c 'Disponibilità'
curl -s http://localhost:3111/it | grep -c 'Check availability'
```

Atteso: `it` da entrambi i rami del proxy; la stringa italiana presente, quella inglese assente.

- [ ] **Step 5: Done #5 — i 301 sopravvivono**

```bash
curl -sI http://localhost:3111/it/florence/accommodations | grep -iE '^(HTTP|location)'
curl -sI http://localhost:3111/en/blog | grep -iE '^(HTTP|location)'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3111/it/firenze/appartamenti
```

Atteso: 301 verso `/it/firenze/appartamenti`; 301 verso `/en/magazine`; 200.

- [ ] **Step 6: Done #6 — il 404 non cambia lingua**

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ extraHTTPHeaders: { 'Accept-Language': 'it-IT,it;q=0.9' } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3111/en/moods/non-esiste-affatto', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(400);
  const href = await p.locator('a[href^=\"/en\"], a[href^=\"/it\"]').first().getAttribute('href');
  console.log('link della 404:', href, '(atteso /en)');
  await b.close();
});
"
```

Atteso: `/en`. Con `Accept-Language` italiano ma URL inglese, il link deve seguire l'URL.

- [ ] **Step 7: Commit e chiusura**

Commit del codice, poi `slices.md` (§ _V3 — fatta il …_), `STATUS.md` con `phase: conclusa` e `stato: chiuso`.

---

## Self-review

**Copertura del mandato:** rinomina (Task 1 e 2), rimozione delle scritture da visita (Task 1), rinnovo condizionale (Task 1), `CLAUDE.md` (Task 4), 404/errore (Task 3). I sei Done sono coperti dai passi 2–6 del Task 5.

**Punto delicato:** il rinnovo rinnova il **valore trovato**, non il locale della pagina. Se qualcuno lo cambia in `renewLocaleChoice(request, response, locale)` per "semplificare", il vecchio comportamento torna sotto un nome nuovo e nessun test se ne accorge — perché il Done #1 verifica solo l'assenza di `Set-Cookie` su un browser senza cookie. Da dire nel commento, che infatti lo dice.

**Fuori scope, ribadito:** i visitatori con un `NEXT_LOCALE` vecchio non vengono ripuliti; il cookie resta sul loro browser fino a scadenza naturale, semplicemente non lo legge più nessuno.
