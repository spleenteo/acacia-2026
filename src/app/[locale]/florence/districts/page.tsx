import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { generatePageComponent } from '@/lib/datocms/realtime/generatePageComponent';
import type { ResultOf } from 'gql.tada';
import DistrictsContent, { type DistrictsProps } from './DistrictsContent';
import { DistrictsRealtime } from './DistrictsRealtime';
import { districtsQuery } from './districtsQuery';

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
      canonical: `/${locale}/florence/districts`,
      languages: { en: '/en/florence/districts', it: '/it/florence/districts' },
    },
  };
}

export default generatePageComponent<
  DistrictsProps,
  ResultOf<typeof districtsQuery>,
  { locale: Locale }
>({
  query: districtsQuery,
  resolveProps: async (rawProps) => {
    const { locale } = await (rawProps as { params: Promise<{ locale: string }> }).params;
    return { locale: locale as Locale };
  },
  buildQueryVariables: ({ locale }) => ({ locale }),
  contentComponent: DistrictsContent,
  realtimeComponent: DistrictsRealtime,
});
