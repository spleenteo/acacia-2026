import { graphql } from '@/lib/datocms/graphql';
import { DistrictCardFragment } from '@/components/DistrictCard';

export const districtsQuery = graphql(
  `
    query DistrictsQuery($locale: SiteLocale!) {
      pageDistricts(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        description(locale: $locale, markdown: true)
      }
      allDistricts(locale: $locale, orderBy: [position_ASC]) {
        id
        ...DistrictCardFragment
      }
    }
  `,
  [DistrictCardFragment],
);
