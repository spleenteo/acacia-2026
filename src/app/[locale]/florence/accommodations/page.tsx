import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import AccommodationsContent, { type AccommodationsProps } from './AccommodationsContent';

const metaQuery = graphql(
  `
    query AccommodationsMetaQuery($locale: SiteLocale!) {
      indexApartment(locale: $locale) {
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
    ...toNextMetadata(data.indexApartment?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/accommodations`,
      languages: { en: '/en/florence/accommodations', it: '/it/florence/accommodations' },
    },
  };
}

export const query = graphql(
  `
    query AccommodationsQuery($locale: SiteLocale!) {
      indexApartment(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        intro(locale: $locale, markdown: true)
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 500, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
      allApartmentCategories(locale: $locale, orderBy: [position_ASC]) {
        id
        name(locale: $locale)
        slug
      }
      allApartments(locale: $locale, first: 100, orderBy: [name_ASC]) {
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

  const variables = { locale: locale as Locale };
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
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={query}
        variables={variables}
        initialData={data}
        includeDrafts={isDraftModeEnabled}
        excludeInvalid={true}
        contentLink="v1"
        baseEditingUrl={`${process.env.DATOCMS_BASE_EDITING_URL}${process.env.DATOCMS_ENVIRONMENT ? `/environments/${process.env.DATOCMS_ENVIRONMENT}` : ''}`}
        environment={process.env.DATOCMS_ENVIRONMENT || undefined}
      />
    );
  }

  return <AccommodationsContent {...resolvedProps} data={data} />;
}
