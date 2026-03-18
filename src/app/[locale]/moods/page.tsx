import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { MoodCardFragment } from '@/components/MoodCard';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import MoodsContent, { type MoodsProps } from './MoodsContent';

const metaQuery = graphql(
  `
    query MoodsMetaQuery($locale: SiteLocale!) {
      pageMoods(locale: $locale) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { locale: locale as Locale },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.pageMoods?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/moods`,
      languages: { en: '/en/moods', it: '/it/moods' },
    },
  };
}

export const query = graphql(
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

export default async function MoodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale };
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
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={query}
        variables={variables}
        initialData={data}
        includeDrafts={isDraftModeEnabled}
        excludeInvalid={true}
        contentLink="v1"
        baseEditingUrl={`${process.env.DATOCMS_BASE_EDITING_URL}${process.env.DATOCMS_ENVIRONMENT ? `/environments/${process.env.DATOCMS_ENVIRONMENT}` : ''}`}
        environment={process.env.DATOCMS_ENVIRONMENT || undefined}
      />
    );
  }

  return <MoodsContent {...resolvedProps} data={data} />;
}
