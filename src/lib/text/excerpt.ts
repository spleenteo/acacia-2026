/**
 * Trim a plain-text string to a word boundary near `max` chars, adding an
 * ellipsis when truncated. Shared by the cards that show a teaser.
 */
export function excerpt(text: string, max = 150): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}
