/**
 * Picks a solid hero background from a DatoCMS image colour palette.
 *
 * DatoCMS extracts a dominant-colour palette for every upload (`colors` on the
 * file field). We choose the palette entry closest to the site's "Japan Fish"
 * palette, so the hero background is drawn from the photo itself yet stays in
 * tune with the design system. The matching text colour adapts to the chosen
 * background's luminance so copy stays readable.
 *
 * `hex` from a ColorField is derived image metadata (never carries stega), so
 * it's safe to parse directly.
 */

export type ImageColor = { hex: string; red: number; green: number; blue: number };

/** Japan Fish palette (rust, gold, sage, slate, navy) in RGB. */
const FISH_PALETTE: [number, number, number][] = [
  [213, 51, 2], // rust  #d53302
  [255, 170, 77], // gold  #ffaa4d
  [160, 203, 173], // sage  #a0cbad
  [143, 177, 190], // slate #8fb1be
  [0, 1, 42], // navy  #00012a
];

const NAVY = '#00012a';

function dist2(a: [number, number, number], b: [number, number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/**
 * Returns the image-palette colour nearest to any Japan Fish hue (the photo
 * colour that best harmonises with the design system). Falls back to navy when
 * the image has no palette.
 */
export function pickHeroColor(colors: ImageColor[] | null | undefined): string {
  if (!colors || colors.length === 0) return NAVY;
  let best = colors[0];
  let bestDist = Infinity;
  for (const c of colors) {
    const rgb: [number, number, number] = [c.red, c.green, c.blue];
    const d = Math.min(...FISH_PALETTE.map((f) => dist2(rgb, f)));
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.hex;
}

/** Perceived-luminance test, to pick readable text over a coloured hero. */
export function isLightColor(hex: string): boolean {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/** Darkens a colour just enough that white text stays legible, keeping its hue. */
function darkenForWhiteText(r: number, g: number, b: number): string {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const target = 110;
  if (lum > target) {
    const s = target / lum;
    return toHex(r * s, g * s, b * s);
  }
  return toHex(r, g, b);
}

/**
 * Picks `count` accent colours from the image palette, distinct from the hero
 * background, each darkened enough to carry white text. Used for the coloured
 * fact pills. Falls back to navy / deep rust when the palette is too small.
 */
export function pickPillColors(
  colors: ImageColor[] | null | undefined,
  excludeHex: string,
  count = 2,
): string[] {
  const fallback = ['#00012a', '#9c2602', '#14163a'];
  const ex = excludeHex.toLowerCase();
  const picked: string[] = [];
  const seen = new Set<string>([ex]);
  for (const c of colors ?? []) {
    const key = c.hex.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(darkenForWhiteText(c.red, c.green, c.blue));
    if (picked.length >= count) break;
  }
  while (picked.length < count) picked.push(fallback[picked.length] ?? '#00012a');
  return picked;
}
