import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql, readFragment, type FragmentOf, type ResultOf } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, localeSlugParams, localizedPath } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { stripStega } from 'react-datocms/stega';
import JsonLd from '@/components/JsonLd';
import { detailBreadcrumbJsonLd } from '@/lib/seo/jsonLd';
import { SITE_URL } from '@/lib/siteUrl';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { AmenityFragment } from '@/components/AmenitiesList';
import { ComfortFragment } from '@/components/ComfortsList';
import { InfoTextFragment, InfoAddressFragment } from '@/components/InfoDetail';
import { FeaturedSlideshowFragment } from '@/components/WhatWeLove/fragment';
import { TruthFragment } from '@/components/HomeTruths';
import { ApartmentCardFragment } from '@/components/ApartmentCard/fragment';
import { MoodCardFragment } from '@/components/MoodCard';
import { EssentialFragment } from '@/components/EssentialsList';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import ApartmentDetailContent, { type ApartmentDetailProps } from './ApartmentDetailContent';

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
  return {
    ...toNextMetadata(data.apartment?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, `/florence/accommodations/${slug}`),
  };
}

export const query = graphql(
  `
    query ApartmentDetailQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        houseBadge {
          label(locale: $locale)
        }
        bedrooms
        bathrooms
        sleeps
        beddyId
        price
        cin
        ape
        acaciaReward
        homeTruth(locale: $locale) {
          ...TruthFragment
        }
        featuredSlideshow {
          ...FeaturedSlideshowFragment
        }
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
          colors {
            hex
            red
            green
            blue
          }
        }
        category {
          id
          name(locale: $locale)
        }
        district {
          name
          slug
          abstract(locale: $locale, markdown: true)
          description(locale: $locale, markdown: true)
          gallery {
            __typename
            ... on GalleryImageRecord {
              image {
                responsiveImage(imgixParams: { w: 600, h: 400, fit: crop }) {
                  ...ResponsiveImageFragment
                }
              }
            }
          }
        }
        wwlGallery {
          ...GalleryImageFragment
        }
        amenities {
          ...AmenityFragment
        }
        comforts {
          ...ComfortFragment
        }
        infoDetail(locale: $locale) {
          __typename
          ... on InfoTextBlockRecord {
            ...InfoTextFragment
          }
          ... on InfoAddressBlockRecord {
            ...InfoAddressFragment
          }
        }
      }
    }
  `,
  [
    ResponsiveImageFragment,
    GalleryImageFragment,
    AmenityFragment,
    ComfortFragment,
    InfoTextFragment,
    InfoAddressFragment,
    FeaturedSlideshowFragment,
    TruthFragment,
  ],
);

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
      allMoods(locale: $locale, first: 100) {
        ...MoodCardFragment
        relatedContent {
          __typename
          ... on ApartmentRecord {
            id
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
      allEssentials(locale: $locale, orderBy: [position_ASC], first: 100) {
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
  return localeSlugParams(slugs);
}

type ApartmentData = NonNullable<ResultOf<typeof query>['apartment']>;

/** Strip stega + collapse any inline HTML (markdown fields) to a clean sentence. */
function plainText(value: string | null | undefined): string {
  return stripStega(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * schema.org `Apartment` structured data for an accommodation detail page. Every
 * CMS-sourced string is run through `stripStega()` because the object is fed to
 * `JSON.stringify` (a non-render path). Optional fields are omitted when absent
 * so the emitted JSON never carries empty/invalid properties.
 */
function buildApartmentJsonLd(
  apartment: ApartmentData,
  locale: Locale,
  slug: string,
): Record<string, unknown> {
  const url = `${SITE_URL}/${locale}${localizedPath(locale, `/florence/accommodations/${slug}`)}`;

  const image = apartment.featuredImage?.responsiveImage
    ? readFragment(ResponsiveImageFragment, apartment.featuredImage.responsiveImage).src
    : undefined;

  const features = [
    ...readFragment(AmenityFragment, apartment.amenities),
    ...readFragment(ComfortFragment, apartment.comforts),
  ]
    .map((f) => stripStega(f.name ?? ''))
    .filter(Boolean);

  const addressItem = apartment.infoDetail.find((i) => i.__typename === 'InfoAddressBlockRecord');
  const address = addressItem
    ? readFragment(InfoAddressFragment, addressItem as FragmentOf<typeof InfoAddressFragment>)
    : null;

  const description = plainText(apartment.claim) || plainText(apartment.description);

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    '@id': `${url}#apartment`,
    name: stripStega(apartment.name ?? ''),
    url,
  };
  if (description) ld.description = description;
  if (image) ld.image = image;
  if (apartment.bedrooms != null) ld.numberOfBedrooms = apartment.bedrooms;
  if (apartment.bathrooms != null) ld.numberOfBathroomsTotal = apartment.bathrooms;
  if (apartment.sleeps != null) {
    ld.occupancy = { '@type': 'QuantitativeValue', value: apartment.sleeps, unitText: 'person' };
  }
  if (features.length) {
    ld.amenityFeature = features.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    }));
  }

  const postalAddress: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressLocality: 'Firenze',
    addressRegion: 'Toscana',
    addressCountry: 'IT',
  };
  if (address?.addressText) postalAddress.streetAddress = stripStega(address.addressText);
  ld.address = postalAddress;

  if (address?.addressMap) {
    ld.geo = {
      '@type': 'GeoCoordinates',
      latitude: address.addressMap.latitude,
      longitude: address.addressMap.longitude,
    };
  }
  ld.containedInPlace = { '@type': 'City', name: 'Firenze' };

  return ld;
}

export default async function ApartmentDetailPage({
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

  const { apartment } = data;
  if (!apartment) notFound();

  // Similar apartments (same category)
  const categoryId = apartment.category ? (apartment.category as { id?: string }).id : null;

  // These four reads are independent of each other — run them in parallel
  // instead of as a waterfall.
  const [essentialsData, reviewsData, similarData, moodsData] = await Promise.all([
    executeQuery(essentialsQuery, {
      variables: { locale: locale as Locale },
      includeDrafts: isDraftModeEnabled,
    }),
    executeQuery(reviewsQuery, {
      variables: { apartmentId: apartment.id },
      includeDrafts: isDraftModeEnabled,
    }),
    categoryId
      ? executeQuery(similarQuery, {
          variables: { locale: locale as Locale, categoryId, excludeId: apartment.id },
          includeDrafts: isDraftModeEnabled,
        })
      : Promise.resolve(null),
    executeQuery(moodsQuery, {
      variables: { locale: locale as Locale },
      includeDrafts: isDraftModeEnabled,
    }),
  ]);

  const essentials = essentialsData.allEssentials;
  const reviews = reviewsData.allGuestbooks;
  const similarApartments = similarData?.allApartments ?? [];

  // Related moods (those that link to this apartment)
  const relatedMoods = moodsData.allMoods.filter((mood) =>
    mood.relatedContent.some(
      (item) => item.__typename === 'ApartmentRecord' && item.id === apartment.id,
    ),
  );

  const resolvedProps: ApartmentDetailProps = {
    locale: locale as Locale,
    essentials,
    reviews,
    similarApartments,
    relatedMoods,
  };

  const apartmentJsonLd = buildApartmentJsonLd(apartment, locale as Locale, slug);
  const breadcrumbJsonLd = detailBreadcrumbJsonLd({
    locale: locale as Locale,
    sectionPath: '/florence/accommodations',
    path: `/florence/accommodations/${slug}`,
    name: stripStega(apartment.name ?? ''),
  });

  if (isDraftModeEnabled) {
    return (
      <>
        <JsonLd data={apartmentJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <RealtimeWrapper
          contentComponent={ApartmentDetailContent}
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
      <JsonLd data={apartmentJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ApartmentDetailContent {...resolvedProps} data={data} />
    </>
  );
}
