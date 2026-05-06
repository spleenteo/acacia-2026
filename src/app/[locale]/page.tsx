import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { MoodCardFragment } from '@/components/MoodCard';
import { SectionHeaderFragment } from '@/components/SectionHeader';
import { ButtonBlockFragment } from '@/components/Button';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import HomeContent, { type HomeProps } from './HomeContent';

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

export const query = graphql(
  `
    query HomeQuery($locale: SiteLocale!) {
      homePage(locale: $locale) {
        title(locale: $locale, markdown: true)
        subtitle(locale: $locale, markdown: true)
        claim(locale: $locale)
        beddyId
        buttons {
          ...ButtonBlockFragment
        }
        moodsHeader(locale: $locale) {
          ...SectionHeaderFragment
        }
        moodsTitle(locale: $locale)
        moods {
          id
          ...MoodCardFragment
        }
        highlightsHeader(locale: $locale) {
          ...SectionHeaderFragment
        }
        highlightedApartments {
          id
          ...ApartmentCardFragment
        }
        stayText(locale: $locale, markdown: true)
        doText(locale: $locale, markdown: true)
      }
    }
  `,
  [ApartmentCardFragment, MoodCardFragment, SectionHeaderFragment, ButtonBlockFragment],
);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: HomeProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={HomeContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <HomeContent {...resolvedProps} data={data} />;
}
