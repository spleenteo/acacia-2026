import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { generatePageComponent } from '@/lib/datocms/realtime/generatePageComponent';
import type { ResultOf } from 'gql.tada';
import AccommodationsContent, { type AccommodationsProps } from './AccommodationsContent';
import { AccommodationsRealtime } from './AccommodationsRealtime';
import { accommodationsQuery } from './accommodationsQuery';

const metaQuery = graphql(
  `
    query AccommodationsMetaQuery($locale: SiteLocale!) {
      pageApartments(locale: $locale) {
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
    ...toNextMetadata(data.pageApartments?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/accommodations`,
      languages: { en: '/en/florence/accommodations', it: '/it/florence/accommodations' },
    },
  };
}

export default generatePageComponent<
  AccommodationsProps,
  ResultOf<typeof accommodationsQuery>,
  { locale: Locale }
>({
  query: accommodationsQuery,
  resolveProps: async (rawProps) => {
    const { locale } = await (rawProps as { params: Promise<{ locale: string }> }).params;
    return { locale: locale as Locale };
  },
  buildQueryVariables: ({ locale }) => ({ locale }),
  contentComponent: AccommodationsContent,
  realtimeComponent: AccommodationsRealtime,
});
