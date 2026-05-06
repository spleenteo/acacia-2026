import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
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
    alternates: {
      canonical: `/${locale}${localizedPath(locale as Locale, `/florence/districts/${slug}`)}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}${localizedPath(l, `/florence/districts/${slug}`)}`]),
      ),
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
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <DistrictDetailContent {...resolvedProps} data={data} />;
}
