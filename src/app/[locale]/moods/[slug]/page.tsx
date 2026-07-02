import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { localeSlugParams, xDefault, localizedSlugPaths } from '@/i18n/paths';
import { detailBreadcrumbJsonLd } from '@/lib/seo/jsonLd';
import JsonLd from '@/components/JsonLd';
import { stripStega } from 'react-datocms/stega';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { PostCardFragment } from '@/components/PostCard/fragment';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import { RelatedFaqCardFragment } from '@/components/RelatedFaqCard';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { MoodCardFragment } from '@/components/MoodCard';
import { faqHrefMap } from '@/lib/faq/faqTree';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import { SetAlternateLocalePaths } from '@/components/LocaleSwitcher/AlternateLocaleContext';
import MoodDetailContent, { type MoodDetailProps } from './MoodDetailContent';

const metaQuery = graphql(
  `
    query MoodMetaQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        _allSlugLocales {
          locale
          value
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { locale: locale as Locale, slug },
    includeDrafts: isEnabled,
  });
  // Mood slugs are localized, so the same record has a different slug per locale.
  // hreflang advertises only locales that actually have a translation.
  const moodPaths = localizedSlugPaths(data.mood?._allSlugLocales ?? [], 'moods', 'hreflang');
  return {
    ...toNextMetadata(data.mood?._seoMetaTags ?? []),
    alternates: {
      canonical: moodPaths[locale],
      languages: { ...moodPaths, ...xDefault(moodPaths) },
    },
  };
}

export const query = graphql(
  `
    query MoodDetailQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name(locale: $locale)
        slug(locale: $locale)
        _allSlugLocales {
          locale
          value
        }
        claim(locale: $locale)
        description(locale: $locale) {
          value
        }
        image {
          responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        relatedContent {
          __typename
          ... on ApartmentRecord {
            id
            ...ApartmentCardFragment
          }
          ... on PostRecord {
            id
            ...PostCardFragment
          }
          ... on FaqRecord {
            id
            ...RelatedFaqCardFragment
          }
          ... on DistrictRecord {
            id
            ...DistrictCardFragment
          }
          ... on GalleryImageRecord {
            id
            ...GalleryImageFragment
          }
        }
      }
      allMoods(
        locale: $locale
        filter: { _status: { eq: published } }
        orderBy: [position_ASC]
        first: 100
      ) {
        ...MoodCardFragment
      }
    }
  `,
  [
    ResponsiveImageFragment,
    ApartmentCardFragment,
    PostCardFragment,
    DistrictCardFragment,
    RelatedFaqCardFragment,
    GalleryImageFragment,
    MoodCardFragment,
  ],
);

const allSlugsQuery = graphql(`
  query AllMoodSlugs {
    allMoods(first: 100) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allMoods.map((m) => m.slug);
  return localeSlugParams(slugs);
}

export default async function MoodDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  if (!data.mood) notFound();

  // A related FAQ record only knows its own slug; its public URL is the full
  // root→node chain. Resolve every related FAQ's href from the tree (fetched
  // once, and only when the mood actually links to a FAQ).
  const faqHrefById = await faqHrefMap(
    locale as Locale,
    isDraftModeEnabled,
    data.mood.relatedContent
      .filter((item) => item.__typename === 'FaqRecord')
      .map((item) => item.id),
  );

  const resolvedProps: MoodDetailProps = { locale: locale as Locale, faqHrefById };
  // Publish the correct "same mood, other language" URLs to the locale switcher
  // (mood slugs are localized, so the generic path swap would guess wrong).
  const altPaths = localizedSlugPaths(data.mood._allSlugLocales ?? [], 'moods', 'switcher');

  const breadcrumbJsonLd = detailBreadcrumbJsonLd({
    locale: locale as Locale,
    sectionPath: '/moods',
    path: `/moods/${data.mood.slug}`,
    name: stripStega(data.mood.name ?? ''),
  });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <SetAlternateLocalePaths paths={altPaths} />
      {isDraftModeEnabled ? (
        <RealtimeWrapper
          contentComponent={MoodDetailContent}
          resolvedProps={resolvedProps}
          query={query}
          variables={variables}
          initialData={data}
          {...getDraftRealtimeOptions()}
        />
      ) : (
        <MoodDetailContent {...resolvedProps} data={data} />
      )}
    </>
  );
}
