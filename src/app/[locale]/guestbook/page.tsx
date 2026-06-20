import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { GuestbookCardFragment } from '@/components/GuestbookCard/fragment';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import GuestbookContent, { type GuestbookProps } from './GuestbookContent';

/**
 * How far back the guestbook reaches: only reviews from the last N months are
 * shown (DatoCMS caps a single page at 100 records — this window keeps the set
 * well under that, so no pagination is needed).
 */
const WINDOW_MONTHS = 24;

const metaQuery = graphql(
  `
    query GuestbookMetaQuery($locale: SiteLocale!, $slug: String!) {
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
    variables: { locale: locale as Locale, slug: indexPageSlug('/guestbook', locale as Locale) },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.page?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, '/guestbook'),
  };
}

export const query = graphql(
  `
    query GuestbookQuery($locale: SiteLocale!, $cutoff: Date!, $slug: String!) {
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
      allGuestbooks(
        locale: $locale
        filter: { apartment: { exists: true }, date: { gte: $cutoff } }
        orderBy: date_DESC
        first: 100
      ) {
        id
        ...GuestbookCardFragment
      }
    }
  `,
  [GuestbookCardFragment, ResponsiveImageFragment],
);

/** First day of the N-month window, as a `YYYY-MM-DD` string (day-stable). */
function windowCutoff(months: number): string {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  return cutoff.toISOString().slice(0, 10);
}

export default async function GuestbookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = {
    locale: locale as Locale,
    cutoff: windowCutoff(WINDOW_MONTHS),
    slug: indexPageSlug('/guestbook', locale as Locale),
  };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: GuestbookProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={GuestbookContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <GuestbookContent {...resolvedProps} data={data} />;
}
