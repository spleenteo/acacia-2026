import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Data for a single review highlighted in the `ReviewSpotlight` section: the
 * quote and its author/date on the left, plus the linked apartment (square
 * photo, typology, name, detail link) on the right.
 *
 * Kept in a standalone `.ts` file (not the `'use client'` component) so the
 * server page query can import it without dragging a client module into the
 * gql.tada build (which throws "j.definitions is not iterable").
 *
 * Callers must filter to records that actually have an `apartment` (see the
 * home query) so the right-hand card and its CTA always render.
 */
export const ReviewSpotlightFragment = graphql(
  `
    fragment ReviewSpotlightFragment on GuestbookRecord {
      id
      name
      title
      quote
      date
      apartment {
        name
        slug
        claim(locale: $locale)
        category {
          name(locale: $locale)
        }
        featuredImage {
          responsiveImage(imgixParams: { w: 800, h: 800, fit: crop }) {
            ...ResponsiveImageFragment
          }
          # Image palette → the panel background tone (same logic as the
          # apartment hero, via pickHeroColor).
          colors {
            hex
            red
            green
            blue
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
