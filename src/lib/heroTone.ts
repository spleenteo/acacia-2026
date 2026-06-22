import { stripStega } from 'react-datocms/stega';
import type { HeroTone } from '@/components/EditorialHero';

/** Tone codes the hero block `color` field can return (must match EditorialHero). */
const HERO_TONES: HeroTone[] = ['rust', 'gold', 'sage', 'slate', 'navy', 'primary'];

/**
 * Map a CMS hero `color` code to a valid EditorialHero tone, defaulting to
 * `primary`. `color` is a string field, so strip stega before the membership
 * check (in draft mode it carries invisible editing metadata).
 */
export function toHeroTone(color: string | null | undefined): HeroTone {
  const code = stripStega(color ?? '');
  return (HERO_TONES as string[]).includes(code) ? (code as HeroTone) : 'primary';
}
