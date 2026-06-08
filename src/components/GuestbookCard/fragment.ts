import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Data needed to render a single guestbook review card in the grid, plus the
 * apartment hover tooltip (featured image, typology, room facts, district, CTA).
 *
 * Kept in a standalone `.ts` file (not the component) so it can be imported by
 * the server page query without dragging a `'use client'` module into the
 * gql.tada build (which throws "j.definitions is not iterable").
 *
 * `apartment` is filtered to records that actually have one (see the page
 * query), so the card can always render the link to the apartment detail page.
 */
export const GuestbookCardFragment = graphql(
  `
    fragment GuestbookCardFragment on GuestbookRecord {
      id
      name
      title
      quote
      date
      channel
      apartment {
        name
        slug
        bedrooms
        bathrooms
        sleeps
        category {
          name(locale: $locale)
        }
        district {
          name
        }
        featuredImage {
          responsiveImage(imgixParams: { w: 480, h: 300, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);
