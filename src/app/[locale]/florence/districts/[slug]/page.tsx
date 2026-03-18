import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import DistrictDetailContent, { type DistrictDetailProps } from './DistrictDetailContent';
import { DistrictDetailRealtime } from './DistrictDetailRealtime';
import { districtDetailQuery } from './districtDetailQuery';
import { apartmentsInDistrictQuery } from './apartmentsInDistrictQuery';

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
  const data = await executeQuery(districtDetailQuery, {
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
      <DistrictDetailRealtime
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={districtDetailQuery}
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

  return <DistrictDetailContent {...resolvedProps} data={data} />;
}
