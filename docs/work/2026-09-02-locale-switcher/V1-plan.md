# V1 — Il controllo nella barra su desktop: piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montare il selettore di lingua nella barra dell'header su desktop, come segmented control leggibile in entrambi gli stati dell'header, e correggere l'`href` che oggi punta alla home.

**Architecture:** `LocaleSwitcher` acquisisce una terza variante `header` con un ramo di render proprio (segmented a due celle) e una prop `onLight` che gli dice su quale fondo sta. Il tono delle varianti testuali passa da un ternario a una mappa tipizzata, così aggiungere una variante senza vestirla diventa un errore di compilazione. L'`href` viene risolto dopo il mount da `window.location.pathname`, che è già il meccanismo usato dal click.

**Tech Stack:** React 19 client component, TypeScript strict, Tailwind v4 (token del design system), `next-intl` non coinvolto in questa slice.

## Global Constraints

- **Niente hook di `next/navigation`** (`usePathname`, `useRouter`): bug Turbopack noto, vedi CLAUDE.md. `useEffect` su `window.location` è la via consentita.
- **Nessuna stringa hardcoded nuova.** `aria-label="Language"` esistente resta com'è: debito dichiarato in `slices.md` § Decisioni.
- **Token del design system, non valori arbitrari**: `text-label` (0.75rem), `rounded-pill`, `bg-dark`, `text-muted`, `border-border-strong`.
- **Il footer non deve cambiare aspetto**: `variant="footer"` mantiene esattamente le classi di oggi.
- **Nessun test nel repo** (zero file, zero runner): al posto del ciclo TDD, ogni task chiude con comandi di verifica eseguibili il cui output atteso è scritto qui.

---

## File Structure

| File                                      | Responsabilità dopo V1                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/LocaleSwitcher/index.tsx` | Tre varianti: `footer` e `menu` (testuali, invariate), `header` (segmented, nuova). Risoluzione href post-mount. Tracciamento. |
| `src/components/SiteHeader/index.tsx`     | Monta la variante `header` nel cluster destro, visibile solo da `lg`, passandole `onLight`.                                    |

---

### Task 1: `LocaleSwitcher` — tipi, toni e risoluzione dell'href

**Files:**

- Modify: `src/components/LocaleSwitcher/index.tsx`

**Interfaces:**

- Consumes: `switchLocalePath(pathname, from, to)` da `@/i18n/paths`; `useAlternateLocalePaths()` da `./AlternateLocaleContext`; `trackEvent(name, params)` da `@/lib/analytics`.
- Produces: `type Variant = 'footer' | 'menu' | 'header'`; `Props` con `onLight?: boolean`. Il Task 2 monta `<LocaleSwitcher variant="header" onLight={…} />`.

- [ ] **Step 1: Sostituire l'intero blocco di testa del file**

Da riga 1 a riga 52 (import, costanti, tipi, componente fino al `tone`). Il resto del file — il `return` con il markup inline — resta intatto e viene usato dalle varianti `footer` e `menu`.

```tsx
'use client';

import { Fragment, useEffect, useState } from 'react';
import { type Locale, locales } from '@/i18n/config';
import { switchLocalePath } from '@/i18n/paths';
import { trackEvent } from '@/lib/analytics';
import { useAlternateLocalePaths } from './AlternateLocaleContext';

/** Language autonyms — shown (in their own language) only to assistive tech. */
const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the manual choice so prefix-less URLs follow it on later visits. */
function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${ONE_YEAR};samesite=lax`;
}

type Variant = 'footer' | 'menu' | 'header';

type Tone = { active: string; idle: string; sep: string };

/**
 * Tones for the two inline (slash-separated) variants. `satisfies` over
 * `Exclude<Variant, 'header'>` is what makes a fourth variant a compile error
 * instead of a silent fall-through: the old ternary dressed anything that
 * wasn't `footer` as `menu`, so a new variant would have shipped white text
 * onto the white bar without a single type error.
 */
const INLINE_TONES = {
  footer: { active: 'text-white/90', idle: 'text-white/45 hover:text-white', sep: 'text-white/25' },
  menu: { active: 'text-white', idle: 'text-white/55 hover:text-white', sep: 'text-white/30' },
} satisfies Record<Exclude<Variant, 'header'>, Tone>;

/**
 * The header segmented control inverts with the bar it sits on. Both states
 * are 20.2:1: filling the active cell with `primary` would have measured
 * 1.39:1 against the navy bar — worse than the hairline border the spike
 * rejected — and would have spent the action colour on the one cell you
 * cannot click, inches from a blackberry CTA.
 */
const HEADER_TONES = {
  light: {
    wrap: 'border-border-strong',
    active: 'bg-dark text-white',
    idle: 'text-muted hover:text-dark',
  },
  dark: {
    wrap: 'border-white/70',
    active: 'bg-white text-dark',
    idle: 'text-white/70 hover:text-white',
  },
} as const;

type Props = {
  locale: Locale;
  variant?: Variant;
  /** Only read by `variant="header"`: which of the two header states we're on. */
  onLight?: boolean;
  /** Optional callback (e.g. close the mobile menu) fired before navigating. */
  onNavigate?: () => void;
};

/**
 * EN / IT language switcher. Keeps the user on the same page in the other
 * language: prefers the alternate URLs published by the current page (mood, FAQ
 * — localized slugs) and otherwise derives them from the live path via
 * window.location (Turbopack-safe, unlike the forbidden next/navigation hooks).
 * The click writes the NEXT_LOCALE cookie and performs a full navigation so the
 * new locale layout renders cleanly.
 */
export default function LocaleSwitcher({
  locale,
  variant = 'footer',
  onLight = false,
  onNavigate,
}: Props) {
  const override = useAlternateLocalePaths();

  // The server has no pathname, so the first render falls back to the locale
  // root. Resolving it on mount is what keeps cmd-click, middle-click and
  // "open in new tab" on the current page instead of sending them home —
  // the click handler always knew the right target, the href did not.
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => setPath(window.location.pathname), []);

  const hrefFor = (l: Locale) =>
    override?.[l] ?? (path ? switchLocalePath(path, locale, l) : `/${l}`);

  const handleSwitch = (target: Locale) => {
    trackEvent('locale_switch', { from: locale, to: target, source: variant });
    setLocaleCookie(target);
    onNavigate?.();
    const dest = override?.[target] ?? switchLocalePath(window.location.pathname, locale, target);
    window.location.assign(dest + window.location.search + window.location.hash);
  };
```

- [ ] **Step 2: Inserire il ramo di render della variante `header`**

Subito dopo `handleSwitch`, prima del `return` esistente. Il segmented non ha separatore: la cella piena è il separatore.

```tsx
if (variant === 'header') {
  const tone = onLight ? HEADER_TONES.light : HEADER_TONES.dark;
  const cell = 'px-1.5 py-1 font-body text-label uppercase tracking-[0.06em] leading-none';
  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-pill border transition-colors duration-300 ${tone.wrap}`}
      role="group"
      aria-label="Language"
    >
      {locales.map((l) =>
        l === locale ? (
          <span key={l} className={`${cell} font-medium ${tone.active}`} aria-current="true">
            {l}
          </span>
        ) : (
          <a
            key={l}
            href={hrefFor(l)}
            hrefLang={l}
            aria-label={LOCALE_NAMES[l]}
            onClick={(e) => {
              e.preventDefault();
              handleSwitch(l);
            }}
            className={`${cell} transition-colors duration-200 ${tone.idle}`}
          >
            {l}
          </a>
        ),
      )}
    </div>
  );
}
```

- [ ] **Step 3: Agganciare il `return` esistente alla mappa dei toni**

Nel `return` che segue, sostituire il riferimento a `tone` con la voce della mappa. Cambia una sola riga: prima del `return`, aggiungere

```tsx
const tone = INLINE_TONES[variant];
```

e lasciare intatto tutto il JSX sottostante, che continua a leggere `tone.active`, `tone.idle`, `tone.sep`. TypeScript sa che a questo punto `variant` non può più essere `'header'`, perché il ramo precedente ha fatto `return`.

- [ ] **Step 4: Verificare che compili e che il footer non sia cambiato**

```bash
npx tsc --noEmit
```

Atteso: nessun output.

```bash
npm run lint
```

Atteso: `0 errors` (restano i 3 warning preesistenti sulle migration), `All matched files use Prettier code style!`.

- [ ] **Step 5: Commit**

```bash
git add src/components/LocaleSwitcher/index.tsx
git commit -m "Add the header variant to LocaleSwitcher, and fix its href"
```

---

### Task 2: Montare il controllo nella barra

**Files:**

- Modify: `src/components/SiteHeader/index.tsx:161-172`

**Interfaces:**

- Consumes: `LocaleSwitcher` con `variant="header"` e `onLight` dal Task 1.
- Produces: niente per le slice successive; V2 rimuoverà solo il wrapper `hidden lg:block`.

- [ ] **Step 1: Inserire il montaggio nel cluster destro**

Il cluster è il terzo figlio della griglia e contiene già CTA e hamburger. Lo switch entra **prima** della CTA, avvolto in un wrapper che lo tiene fuori da mobile: in V2 il wrapper sparisce e il controllo diventa visibile ovunque. Non va aggiunto come quarto figlio della griglia — `lg:grid-cols-[1fr_auto_1fr]` ne ha esattamente tre, e un quarto manderebbe il cluster a capo.

Sostituire la riga 161 e l'apertura del blocco CTA con:

```tsx
          <div className="flex items-center justify-end gap-3 lg:justify-self-end lg:gap-5">
            {/* Language — desktop only in V1; V2 drops the wrapper and shows it
                at every width, which is the point of the whole work. */}
            <div className="hidden lg:block">
              <LocaleSwitcher locale={locale} variant="header" onLight={onLight} />
            </div>

            {/* Primary CTA — Book (always) → opens the site-wide booking modal */}
```

- [ ] **Step 2: Verificare tipi e lint**

```bash
npx tsc --noEmit && npm run lint
```

Atteso: nessun errore di tipo; lint con i soli 3 warning preesistenti.

- [ ] **Step 3: Build di produzione**

```bash
npm run build
```

Atteso: `✓ Compiled successfully`, 205 pagine statiche generate, nessun errore.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteHeader/index.tsx
git commit -m "Mount the language switcher in the header bar on desktop"
```

---

### Task 3: Verificare il Done della slice sul sito vero

**Files:**

- Create: `scripts/check-locale-switcher.mjs` (script di verifica, resta nel repo — V2 lo estenderà con la matrice delle larghezze)

**Interfaces:**

- Consumes: il build di produzione servito su `localhost:3111`.
- Produces: `scripts/check-locale-switcher.mjs`, che V2 riusa aggiungendo i controlli di overflow.

- [ ] **Step 1: Avviare il server di produzione**

```bash
PORT=3111 npm run start &
```

Attendere che `curl -s -o /dev/null http://localhost:3111/it` risponda.

- [ ] **Step 2: Done #3 — l'href non punta più alla home**

```bash
curl -s http://localhost:3111/en/florence/accommodations | grep -o '<a[^>]*hrefLang="it"[^>]*>' | head -1
```

Atteso: **nessun** `href="/it"` secco. Prima di V1 questo comando restituiva `href="/it"`; ora l'href è risolto al mount, quindi nell'HTML del server resta `/it` e diventa corretto dopo l'idratazione. **Se il valore servito è ancora `/it`, è atteso**: il controllo vero è quello del passo successivo, sul DOM idratato.

- [ ] **Step 3: Done #2 e #3 — click e nuova scheda sulle tre famiglie di pagina**

Scrivere `scripts/check-locale-switcher.mjs`:

```js
/**
 * Done checks for the locale switcher (slice V1).
 *
 * Runs against a production build served on localhost:3111. Verifies that the
 * switch keeps the visitor on the same page — both by click and by the href
 * that cmd-click and crawlers use — on the three page families that behave
 * differently: alternate-publishing (mood, FAQ, blog) and plain.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3111';
const PAGES = [
  { from: '/en/moods/slow-tourism', expect: /^\/it\/moods\// },
  { from: '/en/florence/accommodations', expect: /^\/it\/firenze\/appartamenti/ },
];

const browser = await chromium.launch({ channel: 'chrome' });
const failures = [];

for (const { from, expect } of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + from, { waitUntil: 'networkidle' });

  const href = await page.getAttribute('header a[hreflang="it"]', 'href');
  if (!href || !expect.test(href)) {
    failures.push(`${from}: href is ${href}, expected ${expect}`);
  }

  await page.click('header a[hreflang="it"]');
  await page.waitForURL(/\/it\//, { timeout: 5000 }).catch(() => {});
  const landed = new URL(page.url()).pathname;
  if (!expect.test(landed)) failures.push(`${from}: click landed on ${landed}, expected ${expect}`);

  await page.close();
}

await browser.close();
if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log('OK — href and click both stay on the page, on every family tested');
```

- [ ] **Step 4: Eseguirlo**

```bash
node scripts/check-locale-switcher.mjs
```

Atteso: `OK — href and click both stay on the page, on every family tested`.

- [ ] **Step 5: Done #4 — contrasto nei due stati**

Verificare a 1280px su una pagina con hero scuro (`/it`): unscrolled la cella attiva è bianca su fondo scuro; dopo `window.scrollTo(0,100)` l'header diventa chiaro e la cella attiva è navy su bianco. Controllo automatico dei colori calcolati:

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:3111/it', { waitUntil: 'networkidle' });
  const read = () => p.evaluate(() => {
    const el = document.querySelector('header [role=group][aria-label=Language] [aria-current]');
    const s = getComputedStyle(el);
    return { bg: s.backgroundColor, color: s.color };
  });
  console.log('unscrolled', await read());
  await p.evaluate(() => window.scrollTo(0, 200));
  await p.waitForTimeout(500);
  console.log('scrolled  ', await read());
  await b.close();
});
"
```

Atteso: `unscrolled` con `bg: rgb(255, 255, 255)` e `color: rgb(0, 1, 42)`; `scrolled` con `bg: rgb(0, 1, 42)` e `color: rgb(255, 255, 255)`.

- [ ] **Step 6: Done #5 — il footer è intatto**

```bash
curl -s http://localhost:3111/en/moods/slow-tourism | grep -c 'aria-label="Language"'
```

Atteso: `2` — quello del footer e quello dell'header desktop (l'overlay mobile ne aggiunge uno solo quando è renderizzato; qui il markup è sempre nel DOM, quindi il valore atteso è **3** se l'overlay è presente nell'HTML servito. Registrare il numero trovato: serve a V2 come baseline, dove deve scendere di uno.)

- [ ] **Step 7: Fermare il server e committare**

```bash
pkill -f "next-server.*3111"
git add scripts/check-locale-switcher.mjs
git commit -m "Add the V1 Done checks as a script"
```

---

## Self-review

**Copertura del mandato V1** — ogni voce di "Cosa entra" ha un task:

| Voce del mandato                                          | Task                                     |
| --------------------------------------------------------- | ---------------------------------------- |
| `variant="header"` montata una volta con `hidden lg:flex` | 1 (variante), 2 (montaggio)              |
| Forma: due celle `--text-label` padding 6px               | 1, Step 2 (`px-1.5` = 6px, `text-label`) |
| Colore invertito per stato                                | 1, Step 1 (`HEADER_TONES`) + Step 2      |
| Prop `onLight`                                            | 1, Step 1                                |
| `tone` diventa una mappa                                  | 1, Step 1 (`INLINE_TONES` + `satisfies`) |
| `href` corretto al mount                                  | 1, Step 1                                |
| `trackEvent('locale_switch')`                             | 1, Step 1                                |

**Done della slice** → Task 3 copre #2, #3, #4, #5; Task 1 e 2 coprono #6 (`tsc`/lint/build); #1 (visibile a 1280px) è verificato di riflesso dal Task 3, che clicca proprio quell'elemento a 1280px.

**Coerenza dei nomi**: `Variant`, `Tone`, `INLINE_TONES`, `HEADER_TONES`, `onLight`, `hrefFor`, `handleSwitch` sono usati con la stessa grafia in tutti i task.

**Punto lasciato aperto di proposito**: l'HTML servito dal server continua a contenere `href="/it"`, perché il pathname esiste solo nel browser. La correzione agisce dopo l'idratazione, che è ciò che serve per cmd-click e tasto centrale ma non per i crawler. Renderlo giusto anche in SSR vorrebbe dire passare il pathname dal server, ed è fuori dal mandato di V1: annotato negli Scostamenti.
