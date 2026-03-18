import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { generatePageComponent } from '@/lib/datocms/realtime/generatePageComponent';
import type { ResultOf } from 'gql.tada';
import MoodsContent, { type MoodsProps } from './MoodsContent';
import { MoodsRealtime } from './MoodsRealtime';
import { moodsQuery } from './moodsQuery';

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

export default generatePageComponent<MoodsProps, ResultOf<typeof moodsQuery>, { locale: Locale }>({
  query: moodsQuery,
  resolveProps: async (rawProps) => {
    const { locale } = await (rawProps as { params: Promise<{ locale: string }> }).params;
    return { locale: locale as Locale };
  },
  buildQueryVariables: ({ locale }) => ({ locale }),
  contentComponent: MoodsContent,
  realtimeComponent: MoodsRealtime,
});
