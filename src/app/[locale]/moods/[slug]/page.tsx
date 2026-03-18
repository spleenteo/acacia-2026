import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import MoodDetailContent, { type MoodDetailProps } from './MoodDetailContent';
import { MoodDetailRealtime } from './MoodDetailRealtime';
import { moodDetailQuery } from './moodDetailQuery';

const metaQuery = graphql(
  `
    query MoodMetaQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        slug(locale: $locale)
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
  return {
    ...toNextMetadata(data.mood?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/moods/${slug}`,
      languages: { en: `/en/moods/${slug}`, it: `/it/moods/${slug}` },
    },
  };
}

const allSlugsQuery = graphql(`
  query AllMoodSlugs {
    allMoods {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allMoods.map((m) => m.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function MoodDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug };
  const data = await executeQuery(moodDetailQuery, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  if (!data.mood) notFound();

  const resolvedProps: MoodDetailProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <MoodDetailRealtime
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={moodDetailQuery}
        variables={variables}
        initialData={data}
        resolvedProps={resolvedProps}
        includeDrafts={isDraftModeEnabled}
        excludeInvalid={true}
        contentLink="v1"
        baseEditingUrl={`${process.env.DATOCMS_BASE_EDITING_URL}${process.env.DATOCMS_ENVIRONMENT ? `/environments/${process.env.DATOCMS_ENVIRONMENT}` : ''}`}
        environment={process.env.DATOCMS_ENVIRONMENT || undefined}
      />
    );
  }

  return <MoodDetailContent {...resolvedProps} data={data} />;
}
