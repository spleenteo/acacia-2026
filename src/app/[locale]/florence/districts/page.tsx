import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import DistrictsContent, { type DistrictsProps } from './DistrictsContent';

const metaQuery = graphql(
  `
    query DistrictsMetaQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
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
    variables: {
      locale: locale as Locale,
      slug: indexPageSlug('/florence/districts', locale as Locale),
    },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.page?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, '/florence/districts'),
  };
}

export const query = graphql(
  `
    query DistrictsQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
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
      allDistricts(locale: $locale, orderBy: [position_ASC], first: 100) {
        id
        ...DistrictCardFragment
      }
    }
  `,
  [DistrictCardFragment, ResponsiveImageFragment],
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
