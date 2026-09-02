/**
 * Header checks for the locale-switcher work.
 *
 * V1: the switch keeps the visitor on the same page — by click and by the href
 * that cmd-click and "open in new tab" use — across the page families that
 * behave differently, and the segmented control inverts with the header state.
 * V2 extends this with the width matrix.
 *
 * Needs a production build served somewhere (default localhost:3111) and the
 * system Chrome. Pages are passed in, not hardcoded, because the slugs come
 * from the CMS:
 *
 *   PAGES='[{"from":"/en/moods/x","expect":"^/it/moods/"}]' \
 *   DARK_HERO_PAGE=/en/florence/accommodations/abaco \
 *   node scripts/measure-header.mjs [--base http://localhost:3111]
 */
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const BASE = arg('base', 'http://localhost:3111');
const PAGES = JSON.parse(process.env.PAGES ?? '[]');

if (!PAGES.length) {
  console.error('Set PAGES to a JSON array of { from, expect } objects.');
  process.exit(2);
}

const SWITCH = 'header [role="group"][aria-label="Language"]';
const IT_LINK = `${SWITCH} a[hreflang="it"]`;

const failures = [];
const note = (m) => failures.push(m);

const browser = await chromium.launch({ channel: 'chrome' });

// --- Done #2 and #3: same page, by click and by href ----------------------
for (const { from, expect } of PAGES) {
  const re = new RegExp(expect);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + from, { waitUntil: 'domcontentloaded' });

  // The href is resolved once hydrated, so wait for that rather than for the
  // network to fall quiet — networkidle says nothing about React having run.
  await page
    .waitForFunction(
      (sel) => document.querySelector(sel)?.getAttribute('href')?.length > 4,
      IT_LINK,
      { timeout: 5000 },
    )
    .catch(() => note(`${from}: href never resolved past the locale root`));

  const href = await page.getAttribute(IT_LINK, 'href');
  if (!href || !re.test(href)) note(`${from}: href is ${href}, expected to match ${expect}`);

  await page.click(IT_LINK);
  await page.waitForURL(re, { timeout: 8000 }).catch(() => {});
  const landed = new URL(page.url()).pathname;
  if (!re.test(landed)) note(`${from}: click landed on ${landed}, expected to match ${expect}`);

  await page.close();
}

// --- Done #5: the footer switcher still works -----------------------------
{
  const { from, expect } = PAGES[0];
  const re = new RegExp(expect);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + from, { waitUntil: 'domcontentloaded' });

  const footerIt = 'footer [role="group"][aria-label="Language"] a[hreflang="it"]';
  const count = await page.locator(footerIt).count();
  if (count !== 1) {
    note(`footer switcher: ${count} IT links, expected 1`);
  } else {
    await page.click(footerIt);
    await page.waitForURL(re, { timeout: 8000 }).catch(() => {});
    const landed = new URL(page.url()).pathname;
    if (!re.test(landed)) note(`footer click landed on ${landed}, expected to match ${expect}`);
  }
  await page.close();
}

// --- Done #4: the control inverts with the header state -------------------
// Structural rather than per-URL: read the active cell in both scroll states
// and assert they swap. Asserting fixed colours per page would break the day
// a hero changes, and would not catch the inversion being wired backwards.
{
  const darkHeroPage = process.env.DARK_HERO_PAGE ?? PAGES[0].from;
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + darkHeroPage, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const read = () =>
    page.evaluate((sel) => {
      const cell = document.querySelector(`${sel} [aria-current]`);
      if (!cell) return null;
      const s = getComputedStyle(cell);
      return {
        fill: s.backgroundColor,
        text: s.color,
        bar: getComputedStyle(document.querySelector('header')).backgroundColor,
      };
    }, SWITCH);

  const before = await read();
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(800);
  const after = await read();

  if (!before || !after) {
    note('contrast: active cell not found in the header switcher');
  } else {
    console.log('  unscrolled:', JSON.stringify(before));
    console.log('  scrolled:  ', JSON.stringify(after));
    if (before.fill === after.fill) {
      note(`contrast: the active cell did not invert on scroll (${before.fill} in both states)`);
    }
    for (const [label, s] of [
      ['unscrolled', before],
      ['scrolled', after],
    ]) {
      if (s.fill === s.text)
        note(`contrast ${label}: fill and text are the same colour (${s.fill})`);
    }
  }
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log('OK — href, click, footer and contrast inversion all check out');
