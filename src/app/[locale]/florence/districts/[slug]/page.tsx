import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import DistrictDetailContent, { type DistrictDetailProps } from './DistrictDetailContent';

const metaQuery = graphql(
  `
    query DistrictMetaQuery($locale: SiteLocale!, $slug: String!) {
      district(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        slug
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
    ...toNextMetadata(data.district?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/districts/${slug}`,
      languages: {
        en: `/en/florence/districts/${slug}`,
        it: `/it/florence/districts/${slug}`,
      },
    },
  };
}

export const query = graphql(
  `
    query DistrictDetailQuery($locale: SiteLocale!, $slug: String!) {
      district(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        abstract(locale: $locale, markdown: true)
        description(locale: $locale, markdown: true)
        gallery {
          ...GalleryImageFragment
        }
      }
    }
  `,
  [GalleryImageFragment],
);

export const apartmentsInDistrictQuery = graphql(
  `
    query DistrictApartmentsQuery($locale: SiteLocale!, $districtId: ItemId!) {
      allApartments(
        locale: $locale
        first: 100
        filter: { district: { eq: $districtId } }
        orderBy: [name_ASC]
      ) {
        id
        ...ApartmentCardFragment
      }
    }
  `,
  [ApartmentCardFragment],
);

const allSlugsQuery = graphql(`
  query AllDistrictSlugs {
    allDistricts {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allDistricts.map((d) => d.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function DistrictDetailPage({
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

  if (!data.district) notFound();

  const apartmentsData = await executeQuery(apartmentsInDistrictQuery, {
    variables: { locale: locale as Locale, districtId: data.district.id },
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: DistrictDetailProps = {
    locale: locale as Locale,
    apartmentsData,
  };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={DistrictDetailContent}
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

  return <DistrictDetailContent {...resolvedProps} data={data} />;
}
