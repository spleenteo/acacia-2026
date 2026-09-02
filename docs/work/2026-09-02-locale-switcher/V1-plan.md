# V1 — Il controllo nella barra su desktop: piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montare il selettore di lingua nella barra dell'header su desktop, come segmented control leggibile in entrambi gli stati dell'header, e correggere l'`href` che oggi punta alla home.

**Architecture:** `LocaleSwitcher` acquisisce una terza variante `header` con un ramo di render proprio (segmented a due celle) e una prop `onLight` che gli dice su quale fondo sta. Il tono delle varianti testuali passa da un ternario a una mappa tipizzata, così aggiungere una variante senza vestirla diventa un errore di compilazione. L'`href` viene risolto dopo il mount da `window.location.pathname`, che è già il meccanismo usato dal click.

**Tech Stack:** React 19 client component, TypeScript strict, Tailwind v4 (token del design system), `next-intl` non coinvolto in questa slice.

## Global Constraints

- **Niente hook di `next/navigation`** (`usePathname`, `useRouter`): bug Turbopack noto, vedi CLAUDE.md. `useEffect` su `window.location` è la via consentita.
- **Nessuna stringa hardcoded nuova.** `aria-label="Language"` esistente resta com'è: debito dichiarato in `slices.md` § Decisioni.
- **Token del design system dove esistono**: `text-label` (0.75rem), `rounded-pill`, `bg-dark`, `text-muted`, `border-border-strong`. L'unico valore arbitrario ammesso è `tracking-[0.06em]`, che replica quello della CTA accanto (`SiteHeader/index.tsx:169`).
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
 * The header segmented control inverts with the bar it sits on. Both states are
 * 20.2:1 against a flat fill — the dark bar is `bg-dark/20` over a hero photo,
 * so that figure is the floor, not the exact value. Filling the active cell
 * with `primary` instead would have measured 1.39:1 against the navy bar,
 * worse than the hairline border the spike rejected, and would have spent the
 * action colour on the one cell you cannot click, inches from a blackberry CTA.
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
  // `suffix` carries ?query and #hash so cmd-click lands exactly where a left
  // click would: handleSwitch already appends them, and Done #3 says the href
  // must behave "come il click".
  const [here, setHere] = useState<{ path: string; suffix: string } | null>(null);
  useEffect(
    () => setHere({ path: window.location.pathname, suffix: location.search + location.hash }),
    [],
  );

  const hrefFor = (l: Locale) =>
    override?.[l] ?? (here ? switchLocalePath(here.path, locale, l) + here.suffix : `/${l}`);

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
- Produces: niente per le slice successive; V2 rimuoverà solo il wrapper `hidden lg:flex`.

- [ ] **Step 1: Inserire il montaggio nel cluster destro**

Il cluster è il terzo figlio della griglia e contiene già CTA e hamburger. Lo switch entra **prima** della CTA, avvolto in un wrapper che lo tiene fuori da mobile: in V2 il wrapper sparisce e il controllo diventa visibile ovunque. Non va aggiunto come quarto figlio della griglia — `lg:grid-cols-[1fr_auto_1fr]` ne ha esattamente tre, e un quarto manderebbe il cluster a capo.

Sostituire la riga 161 e l'apertura del blocco CTA con:

```tsx
          <div className="flex items-center justify-end gap-3 lg:justify-self-end lg:gap-5">
            {/* Language — desktop only in V1; V2 drops the wrapper and shows it
                at every width, which is the point of the whole work. */}
            <div className="hidden lg:flex">
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

Atteso: `✓ Compiled successfully` e nessun errore. Il numero di pagine statiche dipende dal contenuto sul CMS: non è un valore da asserire.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteHeader/index.tsx
git commit -m "Mount the language switcher in the header bar on desktop"
```

---

### Task 3: Installare Playwright e verificare il Done sul sito vero

**Files:**

- Modify: `package.json` (aggiunge `playwright` a `devDependencies`)
- Create: `scripts/measure-header.mjs`

**Interfaces:**

- Consumes: il build di produzione servito su `localhost:3111`.
- Produces: `scripts/measure-header.mjs`, che V2 estende con la matrice delle larghezze — stesso nome che V2 dichiara, per non ritrovarsi due script o una rinomina.

- [ ] **Step 1: Installare Playwright**

I Done di tutte e tre le slice hanno bisogno di un browser pilotabile, e lo spike girava da una directory di sessione che non esiste più. Va nel repo adesso, non in V2.

```bash
npm i -D playwright
```

Atteso: `added N packages`. Il browser è il Chrome di sistema (`channel: 'chrome'`), quindi non serve `npx playwright install`.

- [ ] **Step 2: Raccogliere gli URL reali delle tre famiglie di pagina**

Done #2 nomina un mood, una FAQ profonda e un post del blog. Gli slug vanno presi dalla sitemap, non inventati.

```bash
PORT=3111 npm run start &
until curl -s -o /dev/null http://localhost:3111/it; do sleep 1; done
curl -s http://localhost:3111/sitemap.xml | grep -oE '/en/(moods|faq|magazine)/[^<]+' | sort -u | head -20
```

Annotare un URL per famiglia. La FAQ deve essere **profonda** (almeno due segmenti dopo `/faq/`): è il caso che esercita il catch-all ricorsivo.

- [ ] **Step 3: Scrivere `scripts/measure-header.mjs`**

```js
/**
 * Header checks for the locale-switcher work.
 *
 * V1: the switch keeps the visitor on the same page — by click and by the href
 * that cmd-click and "open in new tab" use — across the page families that
 * behave differently, and the segmented control inverts with the header state.
 * V2 will extend this with the width matrix.
 *
 * Usage: node scripts/measure-header.mjs [--base http://localhost:3111]
 */
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const BASE = arg('base', 'http://localhost:3111');

/** One per page family. `expect` is what the IT href and the landing path must match. */
const PAGES = JSON.parse(process.env.PAGES ?? '[]');

const SWITCH = 'header [role="group"][aria-label="Language"]';
const IT_LINK = `${SWITCH} a[hreflang="it"]`;

const failures = [];
const note = (m) => failures.push(m);

const browser = await chromium.launch({ channel: 'chrome' });

// --- Done #2 and #3: same page, by click and by href ---------------------
for (const { from, expect } of PAGES) {
  const re = new RegExp(expect);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + from, { waitUntil: 'domcontentloaded' });

  // The href is resolved in an effect, so wait for hydration to have run
  // rather than for the network to fall quiet.
  await page
    .waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && el.getAttribute('href') !== '/it';
      },
      IT_LINK,
      { timeout: 5000 },
    )
    .catch(() => note(`${from}: href still /it after hydration`));

  const href = await page.getAttribute(IT_LINK, 'href');
  if (!href || !re.test(href)) note(`${from}: href is ${href}, expected /${expect}/`);

  await page.click(IT_LINK);
  await page.waitForURL(re, { timeout: 8000 }).catch(() => {});
  const landed = new URL(page.url()).pathname;
  if (!re.test(landed)) note(`${from}: click landed on ${landed}, expected /${expect}/`);

  await page.close();
}

// --- Done #5: the footer switcher still works -----------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const { from, expect } = PAGES[0];
  await page.goto(BASE + from, { waitUntil: 'domcontentloaded' });
  const footerIt = 'footer [role="group"][aria-label="Language"] a[hreflang="it"]';
  const count = await page.locator(footerIt).count();
  if (count !== 1) note(`footer switcher: ${count} IT links, expected 1`);
  else {
    await page.click(footerIt);
    await page.waitForURL(new RegExp(expect), { timeout: 8000 }).catch(() => {});
    const landed = new URL(page.url()).pathname;
    if (!new RegExp(expect).test(landed)) note(`footer click landed on ${landed}`);
  }
  await page.close();
}

// --- Done #4: the control inverts with the header state -------------------
// Structural, not per-URL: read the header background and the active cell in
// both states and assert they swap. A page whose hero is dark starts in the
// dark state; one without starts light. Either way the pair must invert.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + (process.env.DARK_HERO_PAGE ?? PAGES[0].from), {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(600);

  const read = () =>
    page.evaluate((sel) => {
      const cell = document.querySelector(`${sel} [aria-current]`);
      const header = document.querySelector('header');
      const s = getComputedStyle(cell);
      return {
        fill: s.backgroundColor,
        text: s.color,
        bar: getComputedStyle(header).backgroundColor,
      };
    }, SWITCH);

  const before = await read();
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(600);
  const after = await read();

  if (before.fill === after.fill) {
    note(`contrast: active cell did not invert on scroll (${before.fill} both times)`);
  }
  for (const [label, s] of [
    ['unscrolled', before],
    ['scrolled', after],
  ]) {
    if (s.fill === s.text) note(`contrast ${label}: fill and text are the same colour (${s.fill})`);
  }
  console.log('  header state before scroll:', JSON.stringify(before));
  console.log('  header state after scroll: ', JSON.stringify(after));
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log('OK — href, click, footer and contrast inversion all check out');
```

- [ ] **Step 4: Eseguirlo con gli URL raccolti al Passo 2**

```bash
PAGES='[
  {"from":"/en/moods/<mood-slug>","expect":"^/it/moods/"},
  {"from":"/en/faq/<branch>/<leaf>","expect":"^/it/faq/"},
  {"from":"/en/magazine/<post-slug>","expect":"^/it/magazine/"},
  {"from":"/en/florence/accommodations","expect":"^/it/firenze/appartamenti"}
]' DARK_HERO_PAGE=/en/florence/accommodations node scripts/measure-header.mjs
```

Atteso: `OK — href, click, footer and contrast inversion all check out`.

Le prime tre pagine pubblicano URL alternati; la quarta è il controllo senza override, quella dove l'`href` prima di V1 puntava alla home. `DARK_HERO_PAGE` deve essere una pagina che monta `OverDarkHeader`: la home **non** lo fa (`Hero` senza `image` → `hasImage` falso), quindi lì l'header parte già chiaro e il confronto non proverebbe nulla.

- [ ] **Step 5: Done #3 — la forma servita dal server, per quello che è**

```bash
curl -s http://localhost:3111/en/florence/accommodations | grep -oi '<a[^>]*hreflang="it"[^>]*>' | head -1
```

Atteso: contiene ancora `href="/it"`. **Questo è un mancato raggiungimento del Done #3 come scritto**, non un dettaglio: l'attributo è corretto solo dopo l'idratazione, quindi cmd-click e tasto centrale funzionano ma i crawler no. Va registrato negli Scostamenti (Task 4), non silenziato.

L'attributo HTML è `hreflang` minuscolo: `grep` per `hrefLang` non trova mai nulla e passerebbe a vuoto.

- [ ] **Step 6: Fermare il server e committare**

```bash
lsof -ti tcp:3111 | xargs kill
git add package.json package-lock.json scripts/measure-header.mjs
git commit -m "Add Playwright and the header checks for V1"
```

`pkill -f "next-server.*3111"` non funziona: il titolo del processo di Next non porta la porta.

---

### Task 4: Registrare gli scostamenti e chiudere la slice

**Files:**

- Modify: `docs/work/2026-09-02-locale-switcher/slices.md` (§ _Scostamenti emersi_, tabella delle slice)
- Modify: `docs/work/2026-09-02-locale-switcher/STATUS.md` (checkbox V1, Log, `slice:`/`step:`)
- Modify: `docs/work/2026-09-02-locale-switcher/shaping.md` (riferimento di riga sbagliato in CUR3)

- [ ] **Step 1: Scrivere gli scostamenti in `slices.md`**

Quattro voci, sotto § _Scostamenti emersi_:

1. **Done #3 non raggiunto come scritto.** L'`href` è corretto solo dopo l'idratazione: cmd-click e tasto centrale sì, crawler no. Renderlo giusto in SSR richiede che il proxy inoltri il pathname in un header, cioè territorio di V3. **R4 resta parziale**: chiuso per le persone, aperto per i crawler.
2. **`satisfies Record<Exclude<Variant, 'header'>, Tone>`** invece del `Record<Variant, Tone>` che il mandato chiedeva: la variante `header` ha un ramo di render proprio e non un tono inline, e l'`Exclude` dà la stessa garanzia di esaustività (verificato: una quarta variante produce due errori di compilazione).
3. **Due file in più rispetto ai due dichiarati**: `package.json` (Playwright fra le devDependencies) e `scripts/measure-header.mjs`. Erano attribuiti a V2, ma i Done di V1 non sono eseguibili senza.
4. **`hrefFor` porta anche `?query` e `#hash`**, che il mandato non nominava: senza, cmd-click su una ricerca o su un'ancora atterrerebbe altrove rispetto al click sinistro, contro il "come il click" del Done #3.

- [ ] **Step 2: Correggere il riferimento di riga in `shaping.md`**

CUR3 cita `SiteHeader/index.tsx:283` per il montaggio dello switcher nell'overlay; la riga reale è **253**. V2 lavorerà proprio lì.

- [ ] **Step 3: Aggiornare `STATUS.md`**

Spuntare V1 nella lista delle slice, portare `slice: V2` e `step: piano`, aggiungere la riga di Log con cosa si è scoperto.

- [ ] **Step 4: Commit**

```bash
git add docs/work/2026-09-02-locale-switcher/
git commit -m "Close V1: record the deviations"
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

**Punto lasciato aperto di proposito**: l'HTML servito continua a contenere `href="/it"`, perché il pathname esiste solo nel browser. Vale per cmd-click e tasto centrale, non per i crawler — quindi il Done #3 **non è raggiunto come scritto**, e R4 resta parziale. Registrato come primo scostamento nel Task 4 invece che dichiarato passato.
