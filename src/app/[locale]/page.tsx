import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { generatePageComponent } from '@/lib/datocms/realtime/generatePageComponent';
import type { ResultOf } from 'gql.tada';
import HomeContent, { type HomeProps } from './HomeContent';
import { HomeRealtime } from './HomeRealtime';
import { homeQuery } from './homeQuery';

const metaQuery = graphql(
  `
    query HomeMetaQuery($locale: SiteLocale!) {
      homePage(locale: $locale) {
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
    ...toNextMetadata(data.homePage?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', it: '/it' },
    },
  };
}

export default generatePageComponent<HomeProps, ResultOf<typeof homeQuery>, { locale: Locale }>({
  query: homeQuery,
  resolveProps: async (rawProps) => {
    const { locale } = await (rawProps as { params: Promise<{ locale: string }> }).params;
    return { locale: locale as Locale };
  },
  buildQueryVariables: ({ locale }) => ({ locale }),
  contentComponent: HomeContent,
  realtimeComponent: HomeRealtime,
});
