import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { indexPageMetadata } from '@/lib/datocms/indexPageMetadata';
import { ApartmentCardFragment } from '@/components/ApartmentCard/fragment';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import AccommodationsContent, { type AccommodationsProps } from './AccommodationsContent';

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return indexPageMetadata('/florence/accommodations', params);
}

export const query = graphql(
  `
    query AccommodationsQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        ...IndexPageHeroFragment
      }
      allApartmentCategories(locale: $locale, orderBy: [position_ASC], first: 100) {
        id
        name(locale: $locale)
        slug
      }
      allApartments(locale: $locale, orderBy: [name_ASC], first: 100) {
        id
        category {
          slug
        }
        ...ApartmentCardFragment
      }
      homePage(locale: $locale) {
        beddyId
      }
    }
  `,
  [IndexPageHeroFragment, ApartmentCardFragment],
);

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = {
    locale: locale as Locale,
    slug: indexPageSlug('/florence/accommodations', locale as Locale),
  };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: AccommodationsProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={AccommodationsContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <AccommodationsContent {...resolvedProps} data={data} />;
}
