/**
 * Acacia's signature "wonky" shape — a clip-path `polygon()` that shears a box
 * into a gentle parallelogram (pure horizontal skew, no rotation). Both the
 * skew amount and its lean direction are derived deterministically from `seed`
 * (Math.sin, so it's stable across SSR/CSR — no Math.random hydration
 * mismatch), giving each instance a slightly different tilt.
 *
 * Reuse it anywhere a panel should pick up the house character: photo-caption
 * boxes, the nav hover highlight, etc. Pass a stable per-item seed (e.g. an
 * index) so a given element always renders the same shape.
 */
export function wonkyClip(seed: number): string {
  const frac = (x: number) => x - Math.floor(x);
  // Horizontal skew amount, ~6–12px.
  const s = (6 + frac(Math.sin(seed * 53.13) * 43758.5453) * 6).toFixed(1);
  // Lean left or right (well-mixed across small integer seeds).
  const leanRight = frac(Math.sin(seed * 12.9898) * 43758.5453) > 0.5;
  return leanRight
    ? `polygon(${s}px 0, 100% 0, calc(100% - ${s}px) 100%, 0 100%)`
    : `polygon(0 0, calc(100% - ${s}px) 0, 100% 100%, ${s}px 100%)`;
}
