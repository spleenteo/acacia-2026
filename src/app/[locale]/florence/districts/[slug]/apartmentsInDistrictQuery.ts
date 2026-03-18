import { graphql } from '@/lib/datocms/graphql';
import { ApartmentCardFragment } from '@/components/ApartmentCard';

export const apartmentsInDistrictQuery = graphql(
  `
    query DistrictApartmentsQuery($locale: SiteLocale!, $districtId: ItemId!) {
      allApartments(
        locale: $locale
        first: 100
        filter: { district: { eq: $districtId } }
        orderBy: [name_ASC]
      ) {
        id
        ...ApartmentCardFragment
      }
    }
  `,
  [ApartmentCardFragment],
);
