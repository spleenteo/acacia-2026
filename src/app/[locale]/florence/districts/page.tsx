import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { indexPageMetadata } from '@/lib/datocms/indexPageMetadata';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import DistrictsContent, { type DistrictsProps } from './DistrictsContent';

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return indexPageMetadata('/florence/districts', params);
}

export const query = graphql(
  `
    query DistrictsQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        ...IndexPageHeroFragment
      }
      allDistricts(locale: $locale, orderBy: [position_ASC], first: 100) {
        id
        ...DistrictCardFragment
      }
    }
  `,
  [DistrictCardFragment, IndexPageHeroFragment],
);

export default async function DistrictsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = {
    locale: locale as Locale,
    slug: indexPageSlug('/florence/districts', locale as Locale),
  };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: DistrictsProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={DistrictsContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <DistrictsContent {...resolvedProps} data={data} />;
}
