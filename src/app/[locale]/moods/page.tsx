import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { indexPageMetadata } from '@/lib/datocms/indexPageMetadata';
import { MoodCardFragment } from '@/components/MoodCard';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import MoodsContent, { type MoodsProps } from './MoodsContent';

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return indexPageMetadata('/moods', params);
}

export const query = graphql(
  `
    query MoodsQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        ...IndexPageHeroFragment
      }
      allMoods(
        locale: $locale
        filter: { _status: { eq: published } }
        orderBy: [position_ASC]
        first: 100
      ) {
        id
        ...MoodCardFragment
      }
    }
  `,
  [MoodCardFragment, IndexPageHeroFragment],
);

export default async function MoodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug: indexPageSlug('/moods', locale as Locale) };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: MoodsProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={MoodsContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <MoodsContent {...resolvedProps} data={data} />;
}
