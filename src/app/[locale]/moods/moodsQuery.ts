import { graphql } from '@/lib/datocms/graphql';
import { MoodCardFragment } from '@/components/MoodCard';

export const moodsQuery = graphql(
  `
    query MoodsQuery($locale: SiteLocale!) {
      pageMoods(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        description(locale: $locale, markdown: true)
      }
      allMoods(locale: $locale, orderBy: [position_ASC]) {
        id
        ...MoodCardFragment
      }
    }
  `,
  [MoodCardFragment],
);
