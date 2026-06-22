import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import AccommodationsContent, { type AccommodationsProps } from './AccommodationsContent';

const metaQuery = graphql(
  `
    query AccommodationsMetaQuery($locale: SiteLocale!, $slug: String!) {
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
      slug: indexPageSlug('/florence/accommodations', locale as Locale),
    },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.page?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, '/florence/accommodations'),
  };
}

export const query = graphql(
  `
    query AccommodationsQuery($locale: SiteLocale!, $slug: String!) {
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
      allApartmentCategories(locale: $locale, orderBy: [position_ASC], first: 100) {
        id
        name(locale: $locale)
        slug
      }
      allApartments(locale: $locale, orderBy: [name_ASC], first: 100) {
        id
        category {
          slug
        }
        ...ApartmentCardFragment
      }
      homePage(locale: $locale) {
        beddyId
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment],
);

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = {
    locale: locale as Locale,
    slug: indexPageSlug('/florence/accommodations', locale as Locale),
  };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: AccommodationsProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={AccommodationsContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <AccommodationsContent {...resolvedProps} data={data} />;
}
