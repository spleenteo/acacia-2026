import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { MoodCardFragment } from '@/components/MoodCard';
import { EssentialFragment } from '@/components/EssentialsList';
import ApartmentDetailContent, { type ApartmentDetailProps } from './ApartmentDetailContent';
import { ApartmentDetailRealtime } from './ApartmentDetailRealtime';
import { apartmentDetailQuery } from './apartmentDetailQuery';

const metaQuery = graphql(
  `
    query ApartmentMetaQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
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
  const path = `/${locale}/florence/accommodations/${slug}`;
  return {
    ...toNextMetadata(data.apartment?._seoMetaTags ?? []),
    alternates: {
      canonical: path,
      languages: {
        en: `/en/florence/accommodations/${slug}`,
        it: `/it/florence/accommodations/${slug}`,
      },
    },
  };
}

const reviewsQuery = graphql(`
  query ApartmentReviews($apartmentId: ItemId!) {
    allGuestbooks(filter: { apartment: { eq: $apartmentId } }, orderBy: date_DESC, first: 6) {
      id
      name
      title
      quote
      date
      channel
    }
  }
`);

const similarQuery = graphql(
  `
    query SimilarApartments($locale: SiteLocale!, $categoryId: ItemId!, $excludeId: ItemId!) {
      allApartments(
        locale: $locale
        filter: { category: { eq: $categoryId }, id: { neq: $excludeId } }
        first: 3
      ) {
        ...ApartmentCardFragment
      }
    }
  `,
  [ApartmentCardFragment],
);

const moodsQuery = graphql(
  `
    query RelatedMoods($locale: SiteLocale!) {
      allMoods(locale: $locale, first: 20) {
        ...MoodCardFragment
        boxes {
          object {
            __typename
            ... on ApartmentRecord {
              id
            }
          }
        }
      }
    }
  `,
  [MoodCardFragment],
);

const essentialsQuery = graphql(
  `
    query AllEssentials($locale: SiteLocale!) {
      allEssentials(locale: $locale, orderBy: [position_ASC]) {
        ...EssentialFragment
      }
    }
  `,
  [EssentialFragment],
);

const allSlugsQuery = graphql(`
  query AllApartmentSlugs {
    allApartments(first: 100) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allApartments.map((a) => a.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug };
  const data = await executeQuery(apartmentDetailQuery, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const { apartment } = data;
  if (!apartment) notFound();

  const essentialsData = await executeQuery(essentialsQuery, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });
  const essentials = essentialsData.allEssentials;

  const reviewsData = await executeQuery(reviewsQuery, {
    variables: { apartmentId: apartment.id },
    includeDrafts: isDraftModeEnabled,
  });
  const reviews = reviewsData.allGuestbooks;

  // Similar apartments (same category)
  const categoryId = apartment.category ? (apartment.category as { id?: string }).id : null;

  const similarApartments = categoryId
    ? (
        await executeQuery(similarQuery, {
          variables: {
            locale: locale as Locale,
            categoryId,
            excludeId: apartment.id,
          },
          includeDrafts: isDraftModeEnabled,
        })
      ).allApartments
    : [];

  // Related moods (those that link to this apartment)
  const moodsData = await executeQuery(moodsQuery, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });
  const relatedMoods = moodsData.allMoods.filter((mood) =>
    mood.boxes.some((box) => {
      const objects = box.object as { __typename: string; id?: string }[];
      return objects.some((obj) => obj.__typename === 'ApartmentRecord' && obj.id === apartment.id);
    }),
  );

  const resolvedProps: ApartmentDetailProps = {
    locale: locale as Locale,
    essentials,
    reviews,
    similarApartments,
    relatedMoods,
  };

  if (isDraftModeEnabled) {
    return (
      <ApartmentDetailRealtime
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={apartmentDetailQuery}
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

  return <ApartmentDetailContent {...resolvedProps} data={data} />;
}
