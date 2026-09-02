# V2 — Il controllo a ogni larghezza, e la CTA a icona: piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere il selettore di lingua visibile in tutte le larghezze — che è il punto dell'intero lavoro — liberando lo spazio necessario con una CTA a sola icona sotto i 400px.

**Architecture:** Cade il wrapper `hidden lg:flex` che V1 aveva messo intorno allo switch, e con esso il montaggio nell'overlay dell'hamburger e la variante `menu` che lo vestiva. La soglia dei 400px diventa un breakpoint di prima classe (`--breakpoint-xs`) invece di una classe arbitraria, perché `sm` in questo progetto è 480px e nasconderebbe la parola dove ci starebbe.

**Tech Stack:** React 19 client component, Tailwind v4 (`@theme`), `lucide-react` per l'icona, Playwright per le misure.

## Global Constraints

- **L'header non deve crescere.** `--header-height` è un `58px` fisso letto da sette punti (padding del `main`, overlay, hero, ancore `scroll-mt`): se la barra reale supera quel valore il contenuto finisce sotto l'header e le ancore atterrano fuori posto. Può accorciarsi senza danno.
- **Nessuna stringa hardcoded nuova.** Il nome accessibile della CTA a icona esce da `t('book')`, che esiste già ed è usata in due punti.
- **Le lezioni di V1 valgono qui** (`slices.md` § _V1 — fatta il 2026-09-02_): `lsof` e non `pkill`, `/bin/rm`, `grep -i` per gli attributi React, `grep -o … | wc -l` per contare.

---

## File Structure

| File                                      | Responsabilità dopo V2                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/global.css`                      | Aggiunge `--breakpoint-xs: 400px` al blocco `@theme`, accanto agli altri quattro.                                                     |
| `src/components/SiteHeader/index.tsx`     | Switch visibile a ogni larghezza; CTA testuale sopra `xs`, a sola icona sotto; sorgenti GA4 distinte; niente più switch nell'overlay. |
| `src/components/LocaleSwitcher/index.tsx` | Perde la variante `menu`, rimasta senza chiamanti.                                                                                    |
| `scripts/measure-header.mjs`              | Aggiunge la matrice `{it,en} × {320,360,390}` e il controllo sull'altezza della barra.                                                |

---

### Task 1: Il breakpoint `xs`

**Files:**

- Modify: `src/app/global.css:128-131`

**Interfaces:**

- Produces: la variante Tailwind `xs:` (min-width 400px), usata dal Task 2.

- [ ] **Step 1: Aggiungere il token**

Nel blocco `@theme`, prima di `--breakpoint-sm`:

```css
--breakpoint-xs: 400px;
--breakpoint-sm: 480px;
```

Sotto i 400px la CTA perde la parola. La soglia non è un breakpoint standard perché nessuno di quelli esistenti serve: `sm` è 480px in questo progetto, e a 768px restano 467px liberi nella barra — userebbe l'icona dove la parola sta comodissima.

- [ ] **Step 2: Verificare che la variante venga emessa**

```bash
/bin/rm -rf .next && npm run build 2>&1 | grep -E "Compiled|error"
grep -rl "min-width:400px" .next/static/chunks/*.css
```

Atteso: la build compila e almeno un file CSS contiene la media query. Se il `grep` non trova nulla dopo il Task 2, la variante non è stata usata da nessuna classe: è quello il caso da indagare, non il token.

- [ ] **Step 3: Commit**

```bash
git add src/app/global.css
git commit -m "Add the xs breakpoint at 400px"
```

---

### Task 2: Lo switch ovunque, la CTA a icona sotto `xs`

**Files:**

- Modify: `src/components/SiteHeader/index.tsx` — cluster destro (~riga 161), overlay (~riga 261)

**Interfaces:**

- Consumes: `xs:` dal Task 1; `LocaleSwitcher variant="header"` da V1.
- Produces: le sorgenti GA4 `header-bar`, `header-icon`, `header-menu`, che sostituiscono l'unico `header`.

- [ ] **Step 1: Importare l'icona**

In testa al file, accanto agli altri import:

```tsx
import { Calendar } from 'lucide-react';
```

- [ ] **Step 2: Togliere il wrapper e trasformare la CTA**

Sostituire il blocco che va dal commento `{/* Language — desktop only in V1 … */}` fino alla chiusura del bottone della CTA con:

```tsx
{
  /* Language — visible at every width: it is the point of the work.
                Inside the right-hand cluster, not as a fourth child of the
                grid, which is lg:grid-cols-[1fr_auto_1fr] and would wrap. */
}
<LocaleSwitcher locale={locale} variant="header" onLight={onLight} />;

{
  /* Primary CTA — Book. Below `xs` (400px) it drops to the icon
                alone: measured, the English label is 163.6px, 58% of a 320px
                bar, and it is a CMS string that can grow. The accessible name
                stays the same in both forms. */
}
<button
  type="button"
  aria-label={t('book')}
  onClick={() => {
    setMenuOpen(false);
    openBooking({ source: window.innerWidth < 400 ? 'header-icon' : 'header-bar' });
  }}
  className="inline-flex items-center justify-center rounded-pill bg-primary px-3 py-2 font-body text-caption font-medium tracking-[0.06em] text-white transition-colors duration-300 hover:bg-primary-hover xs:px-4 lg:px-5 lg:py-2.5"
>
  <Calendar aria-hidden className="size-[1.375rem] xs:hidden" />
  <span className="hidden xs:inline">{t('book')}</span>
</button>;
```

L'icona è alta `1.375rem` (22px), cioè la stessa altezza della riga di testo che sostituisce (`text-caption` 15px × line-height 1,5): così il bottone non cambia altezza e la barra resta a 58px.

- [ ] **Step 3: Togliere lo switch dall'overlay e distinguere la sua sorgente**

Alla riga ~261 eliminare:

```tsx
<LocaleSwitcher locale={locale} variant="menu" onNavigate={() => setMenuOpen(false)} />
```

e nel bottone Book dell'overlay (riga ~254) cambiare la sorgente:

```tsx
openBooking({ source: 'header-menu' });
```

Lo switch ora sta nella barra, che è `z-50` e resta cliccabile sopra l'overlay `z-40`: non serve duplicarlo dentro.

- [ ] **Step 4: Passare `onNavigate` dal mount nella barra**

Poiché la barra è cliccabile a menu aperto, il click deve chiudere l'overlay: senza, resterebbe aperto con `body { overflow: hidden }` per tutta la durata della navigazione.

```tsx
<LocaleSwitcher
  locale={locale}
  variant="header"
  onLight={onLight}
  onNavigate={() => setMenuOpen(false)}
/>
```

- [ ] **Step 5: Verificare**

```bash
npx tsc --noEmit && npm run lint 2>&1 | tail -3
```

Atteso: nessun errore di tipo; `0 errors` e i 3 warning preesistenti.

- [ ] **Step 6: Commit**

```bash
git add src/components/SiteHeader/index.tsx
git commit -m "Show the language switch at every width; icon-only CTA below 400px"
```

---

### Task 3: Togliere la variante `menu`

**Files:**

- Modify: `src/components/LocaleSwitcher/index.tsx`

**Interfaces:**

- Produces: `type Variant = 'footer' | 'header'`.

- [ ] **Step 1: Verificare che non abbia più chiamanti**

```bash
grep -rn "variant=\"menu\"\|variant='menu'" src/
```

Atteso: nessun risultato. Se ne compare uno, fermarsi: il Task 2 non ha rimosso tutto.

- [ ] **Step 2: Restringere l'union e togliere il tono**

```tsx
type Variant = 'footer' | 'header';
```

e in `INLINE_TONES` eliminare la riga `menu`. Il tipo `satisfies Record<Exclude<Variant, 'header'>, Tone>` diventa `Record<'footer', Tone>` da solo: se restasse una voce `menu` non più nell'union, il `satisfies` fallirebbe — è la stessa garanzia che ha protetto V1, al contrario.

- [ ] **Step 3: Verificare**

```bash
npx tsc --noEmit && npm run lint 2>&1 | tail -3 && npm run build 2>&1 | grep -E "Compiled|error"
```

Atteso: tutto verde.

- [ ] **Step 4: Commit**

```bash
git add src/components/LocaleSwitcher/index.tsx
git commit -m "Drop the menu variant, now that nothing mounts it"
```

---

### Task 4: La matrice delle larghezze

**Files:**

- Modify: `scripts/measure-header.mjs`

- [ ] **Step 1: Aggiungere il blocco di misura**

Prima di `await browser.close()`:

```js
// --- V2: the bar holds at every width, in both languages -----------------
// The spike's arithmetic (content − wordmark − cluster) cannot see this: it
// ignores whatever sits between those two, which is exactly where the switch
// now lives. Ask the layout instead.
{
  const WIDTHS = [320, 360, 390];
  const LOCALES = ['it', 'en'];
  for (const locale of LOCALES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await page.goto(`${BASE}/${locale}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const r = await page.evaluate(() => {
        const header = document.querySelector('header');
        const row = header.firstElementChild;
        const cs = getComputedStyle(row);
        const rb = row.getBoundingClientRect();
        const inner = {
          l: rb.left + parseFloat(cs.paddingLeft),
          r: rb.right - parseFloat(cs.paddingRight),
        };
        const visible = [...row.children].filter((el) => getComputedStyle(el).display !== 'none');
        return {
          overflows: row.scrollWidth > row.clientWidth + 1,
          headerHeight: Math.round(header.getBoundingClientRect().height * 10) / 10,
          escapes: visible
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.left < inner.l - 0.5 || b.right > inner.r + 0.5;
            })
            .map((el) => el.className.slice(0, 40)),
          wraps: [...row.querySelectorAll('a,button,span')]
            .filter((el) => el.getClientRects().length > 1)
            .map((el) => (el.textContent ?? '').trim().slice(0, 20)),
          switchVisible: !!document.querySelector(
            'header [role="group"][aria-label="Language"] a[hreflang]',
          ),
          ctaLabelVisible: !!document.querySelector('header button span:not(.hidden)'),
        };
      });

      const at = `${locale} @ ${width}px`;
      if (r.overflows) note(`${at}: the bar overflows`);
      if (r.escapes.length) note(`${at}: elements outside the bar — ${r.escapes.join(', ')}`);
      if (r.wraps.length) note(`${at}: wrapped onto two lines — ${r.wraps.join(', ')}`);
      if (r.headerHeight > 58) note(`${at}: header is ${r.headerHeight}px, must not exceed 58`);
      if (!r.switchVisible) note(`${at}: the language switch is not in the bar`);
      console.log(`  ${at}: height ${r.headerHeight}px, no overflow, switch present`);
      await page.close();
    }
  }
}
```

- [ ] **Step 2: Eseguire tutto**

```bash
lsof -ti tcp:3111 | xargs kill 2>/dev/null
/bin/rm -rf .next && npm run build 2>&1 | grep -E "Compiled|error"
PORT=3111 npm run start & until curl -s -o /dev/null http://localhost:3111/it; do sleep 1; done
PAGES='[{"from":"/en/moods/art-and-design","expect":"^/it/moods/"}]' \
  DARK_HERO_PAGE=/en/florence/accommodations/abaco node scripts/measure-header.mjs
```

Atteso: per ognuna delle sei combinazioni, `height ≤ 58px, no overflow, switch present`, e in chiusura `OK`.

- [ ] **Step 3: Done #3 — l'icona apre la modale**

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 360, height: 800 } });
  await p.goto('http://localhost:3111/en', { waitUntil: 'domcontentloaded' });
  const btn = p.getByRole('button', { name: 'Check availability' });
  console.log('accessible name found:', await btn.count());
  await btn.first().click();
  await p.waitForTimeout(800);
  console.log('modal open:', await p.locator('[role=dialog], .fixed.inset-0').count() > 0);
  await b.close();
});
"
```

Atteso: `accessible name found: 1` e `modal open: true`. Il nome accessibile deve funzionare a 360px, dove il bottone mostra solo l'icona.

- [ ] **Step 4: Done #5 e #6 — l'overlay e il conteggio degli switcher**

```bash
curl -s http://localhost:3111/en | grep -o 'aria-label="Language"' | wc -l
```

Atteso: **2** (barra + footer). Prima di V2 erano 3: l'overlay ne conteneva un terzo.

- [ ] **Step 5: Commit**

```bash
lsof -ti tcp:3111 | xargs kill
git add scripts/measure-header.mjs
git commit -m "Extend the header checks with the width matrix"
```

---

### Task 5: Chiudere la slice

- [ ] **Step 1:** Scrivere in `slices.md` la sezione _V2 — fatta il …_ con quello che si è scoperto misurando, e gli eventuali scostamenti.
- [ ] **Step 2:** Spuntare V2 in `STATUS.md`, portare `slice: V3` e `step: piano`, aggiungere la riga di Log.
- [ ] **Step 3:** Commit.

---

## Self-review

**Copertura del mandato V2:**

| Voce                                        | Task                          |
| ------------------------------------------- | ----------------------------- |
| Switch senza `hidden lg:`                   | 2, Step 2                     |
| Rimozione dall'overlay + variante `menu`    | 2 Step 3, 3                   |
| `onNavigate` dal mount nella barra          | 2, Step 4                     |
| `--breakpoint-xs: 400px`                    | 1                             |
| CTA a icona sotto `xs` con nome accessibile | 2, Step 2                     |
| Icona dimensionata come la pillola          | 2, Step 2 (`size-[1.375rem]`) |
| Sorgenti GA4 distinte                       | 2, Step 2 e 3                 |
| Script versionato con la matrice            | 4                             |

**Done della slice** → #1 e #2 dal Task 4 Step 2; #3 dal Task 4 Step 3; #4 (CTA testuale sopra 400px) dalla matrice, che a 430px mostrerebbe `ctaLabelVisible`; #5 e #6 dal Task 4 Step 4; #7 dai Task 2 e 3.

**Punto su cui l'implementazione dovrà stare attenta**: l'asserzione sull'altezza è `> 58` fallisce, non `!== 58`. La barra può accorciarsi senza danno — il padding del `main` lascerebbe qualche pixel d'aria — mentre se cresce il contenuto finisce sotto l'header.
