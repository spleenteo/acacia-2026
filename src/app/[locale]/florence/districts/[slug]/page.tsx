import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, localeSlugParams } from '@/i18n/paths';
import { detailBreadcrumbJsonLd } from '@/lib/seo/jsonLd';
import JsonLd from '@/components/JsonLd';
import { stripStega } from 'react-datocms/stega';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { PostCardFragment } from '@/components/PostCard/fragment';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
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
    alternates: indexAlternates(locale as Locale, `/florence/districts/${slug}`),
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
          __typename
          ... on GalleryImageRecord {
            ...GalleryImageFragment
          }
          ... on PostRecord {
            id
            ...PostCardFragment
          }
        }
      }
      allDistricts(locale: $locale, orderBy: [position_ASC], first: 100) {
        ...DistrictCardFragment
      }
    }
  `,
  [GalleryImageFragment, PostCardFragment, DistrictCardFragment],
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
    allDistricts(first: 100) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allDistricts.map((d) => d.slug);
  return localeSlugParams(slugs);
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

  const breadcrumbJsonLd = detailBreadcrumbJsonLd({
    locale: locale as Locale,
    sectionPath: '/florence/districts',
    path: `/florence/districts/${slug}`,
    name: stripStega(data.district.name ?? ''),
  });

  if (isDraftModeEnabled) {
    return (
      <>
        <JsonLd data={breadcrumbJsonLd} />
        <RealtimeWrapper
          contentComponent={DistrictDetailContent}
          resolvedProps={resolvedProps}
          query={query}
          variables={variables}
          initialData={data}
          {...getDraftRealtimeOptions()}
        />
      </>
    );
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <DistrictDetailContent {...resolvedProps} data={data} />
    </>
  );
}
