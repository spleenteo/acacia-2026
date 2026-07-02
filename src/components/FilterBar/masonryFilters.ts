/**
 * Shared vocabulary for filtering a mixed masonry (mood / district) by content
 * type. Each masonry card is tagged with a CardKind; the FilterBar options are
 * built from the kinds actually present, in this canonical order, with labels
 * from the `filters` translation namespace.
 */
export type CardKind = 'apartment' | 'poi' | 'district' | 'post' | 'image' | 'faq';

/** Order the type filters appear in (only the present ones are shown). */
export const FILTER_KIND_ORDER: CardKind[] = [
  'apartment',
  'poi',
  'district',
  'post',
  'image',
  'faq',
];

/** CardKind → key in the `filters` translation namespace. */
export const FILTER_KIND_TKEY: Record<CardKind, string> = {
  apartment: 'apartments',
  poi: 'pois',
  district: 'districts',
  post: 'posts',
  image: 'images',
  faq: 'faq',
};
