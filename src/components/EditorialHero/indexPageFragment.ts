import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

/**
 * Hero + editorial description of an `index_page` record — the selection every
 * index page (moods, districts, accommodations, blog, guestbook, faq) makes to
 * feed its <EditorialHero> and description rail. Lives in a plain .ts file so
 * both server pages and client Content components can import it.
 */
export const IndexPageHeroFragment = graphql(
  `
    fragment IndexPageHeroFragment on IndexPageRecord {
      hero(locale: $locale) {
        color
        title
        subtitle
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 500, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
      description(locale: $locale, fallbackLocales: [en]) {
        value
      }
    }
  `,
  [ResponsiveImageFragment],
);
