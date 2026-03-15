import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';

export const FeaturedSlideshowFragment = graphql(
  `
    fragment FeaturedSlideshowFragment on FileField {
      id
      alt(locale: $locale, fallbackLocales: [en, it])
      title(locale: $locale, fallbackLocales: [en, it])
      responsiveImage(imgixParams: { w: 400, h: 300, fit: crop }) {
        ...ResponsiveImageFragment
      }
      full: responsiveImage(imgixParams: { w: 1200, fit: max }) {
        ...ResponsiveImageFragment
      }
    }
  `,
  [ResponsiveImageFragment],
);
