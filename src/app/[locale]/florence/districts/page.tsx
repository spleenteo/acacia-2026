import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { DistrictCardFragment } from '@/components/DistrictCard';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import DistrictsContent, { type DistrictsProps } from './DistrictsContent';

const metaQuery = graphql(
  `
    query DistrictsMetaQuery($locale: SiteLocale!) {
      pageDistricts(locale: $locale) {
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
    ...toNextMetadata(data.pageDistricts?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}${localizedPath(locale as Locale, '/florence/districts')}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}${localizedPath(l, '/florence/districts')}`]),
      ),
    },
  };
}

export const query = graphql(
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

export default async function DistrictsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale };
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

  return <DistrictsContent {...resolvedProps} data={data} />;
}
