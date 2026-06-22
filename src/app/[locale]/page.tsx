import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { MoodCardFragment } from '@/components/MoodCard';
import { SectionHeaderFragment } from '@/components/SectionHeader';
import { ButtonBlockFragment } from '@/components/Button';
import { ReviewSpotlightFragment } from '@/components/ReviewSpotlight/fragment';
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
    alternates: indexAlternates(locale as Locale, '/'),
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
      # Recent reviews that have a linked apartment — cached as a pool; the page
      # is dynamic, so each load rotates which one the spotlight shows (deduped
      # to one review per apartment in HomeContent). Fetch wide to ensure enough
      # distinct apartments after dedup.
      spotlightReviews: allGuestbooks(
        locale: $locale
        filter: { apartment: { exists: true } }
        orderBy: date_DESC
        first: 50
      ) {
        id
        ...ReviewSpotlightFragment
      }
    }
  `,
  [
    ApartmentCardFragment,
    MoodCardFragment,
    SectionHeaderFragment,
    ButtonBlockFragment,
    ReviewSpotlightFragment,
  ],
);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  // Per-request seed → the spotlight rotates which cached review it shows on
  // each load (the page is dynamic). Selection itself happens in HomeContent,
  // after the reviews are deduped to one per apartment. The randomness is the
  // intended per-request behaviour, hence the impure-call override.
  // eslint-disable-next-line react-hooks/purity
  const spotlightSeed = Math.random();
  const resolvedProps: HomeProps = { locale: locale as Locale, spotlightSeed };

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
