import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

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

import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import HtmlContent from '@/components/HtmlContent';
import BeddyBar from '@/components/BeddyBar';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import PhotoLightbox from '@/components/PhotoLightbox';
import EssentialsList, { EssentialFragment } from '@/components/EssentialsList';
import AmenitiesList, { AmenityFragment } from '@/components/AmenitiesList';
import ComfortsList, { ComfortFragment } from '@/components/ComfortsList';
import InfoDetail, { InfoTextFragment, InfoAddressFragment } from '@/components/InfoDetail';
import DistrictLink from '@/components/DistrictLink';
import BookingSidebar from '@/components/BookingSidebar';
import WhatWeLove from '@/components/WhatWeLove';
import { FeaturedSlideshowFragment } from '@/components/WhatWeLove/fragment';
import HomeTruths, { TruthFragment } from '@/components/HomeTruths';
import ReviewsList from '@/components/ReviewsList';
import RelatedContent from '@/components/RelatedContent';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { MoodCardFragment } from '@/components/MoodCard';
import { readFragment } from '@/lib/datocms/graphql';

const query = graphql(
  `
    query ApartmentDetailQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        highlight(locale: $locale)
        bedrooms
        bathrooms
        sleeps
        beddyId
        price
        cin
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
            image {
              responsiveImage(imgixParams: { w: 600, h: 400, fit: crop }) {
                ...ResponsiveImageFragment
              }
            }
          }
        }
        gallery {
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
          ... on InfoTextRecord {
            ...InfoTextFragment
          }
          ... on InfoAddressRecord {
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
    allGuestbooks(
      filter: { apartment: { eq: $apartmentId }, published: { eq: true } }
      orderBy: date_DESC
      first: 6
    ) {
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
        filter: { category: { eq: $categoryId }, id: { neq: $excludeId }, published: { eq: true } }
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
    allApartments(first: 100, filter: { published: { eq: true } }) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allApartments.map((a) => a.slug);

  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const labels = {
  en: {
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    sleeps: 'Sleeps',
    essentials: 'Acacia® Essentials',
    amenities: 'Amenities',
    comforts: 'Comforts',
    info: 'Details',
    book: 'Book this apartment',
    allPhotos: 'All photos',
    whatWeLoveLabel: 'Our favorites',
    whatWeLoveTitle: 'What We Love',
    homeTruthsLabel: 'Good to know',
    homeTruthsTitle: 'Home Truths',
    reviewsLabel: 'Guest reviews',
    reviewsTitle: 'What Our Guests Say',
    similarLabel: 'You may also like',
    similarTitle: 'Similar Apartments',
    moodsLabel: 'Explore',
    moodsTitle: 'Related Moods',
  },
  it: {
    bedrooms: 'Camere',
    bathrooms: 'Bagni',
    sleeps: 'Ospiti',
    essentials: 'Acacia® Essentials',
    amenities: 'Amenities',
    comforts: 'Comforts',
    info: 'Dettagli',
    book: 'Prenota questo alloggio',
    allPhotos: 'Tutte le foto',
    whatWeLoveLabel: 'I nostri preferiti',
    whatWeLoveTitle: 'Cosa ci piace',
    homeTruthsLabel: 'Da sapere',
    homeTruthsTitle: 'La verità, tutta la verità',
    reviewsLabel: 'Recensioni',
    reviewsTitle: 'I nostri ospiti raccontano',
    similarLabel: 'Potrebbe piacerti anche',
    similarTitle: 'Appartamenti simili',
    moodsLabel: 'Esplora',
    moodsTitle: 'Mood correlati',
  },
} as const;

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale, slug },
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

  const l = labels[locale as Locale];

  return (
    <>
      {/* ── Hero (full width) ── */}
      <section
        className="relative min-h-[70vh] flex items-end bg-dark"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        {apartment.featuredImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={apartment.featuredImage.responsiveImage}
              pictureClassName="absolute inset-0 w-full h-full"
              imgClassName="w-full h-full object-cover opacity-55"
              imgStyle={{ maxWidth: 'none', height: '100%', aspectRatio: 'unset' }}
              priority
            />
          </div>
        )}
        <div className="relative z-10 w-full px-5 md:px-8 pb-14 pt-32">
          <div className="mx-auto max-w-7xl">
            {apartment.category && (
              <p className="font-body font-medium text-label text-white/60 uppercase tracking-[0.15em] mb-3">
                {apartment.category.name}
              </p>
            )}
            <h1 className="font-heading font-normal text-h1 md:text-hero leading-tight text-white mb-3">
              {apartment.name}
            </h1>
            {apartment.claim && (
              <p className="font-body text-[1.125rem] md:text-[1.25rem] text-white/80 max-w-2xl leading-relaxed">
                {apartment.claim}
              </p>
            )}
            {apartment.featuredSlideshow.length > 0 && (
              <PhotoLightbox
                items={apartment.featuredSlideshow
                  .map((f) => readFragment(FeaturedSlideshowFragment, f))
                  .filter((img) => img.responsiveImage && img.full)
                  .map((img) => ({
                    id: img.id,
                    thumb: img.responsiveImage!,
                    full: img.full!,
                    caption: img.title || img.alt,
                  }))}
                label={l.allPhotos}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Two-column layout ── */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 xl:gap-20">
          {/* ── Main content ── */}
          <div className="min-w-0">
            {/* What We Love + Description */}
            {(apartment.gallery.length >= 2 || apartment.description) && (
              <section className="mb-16 lg:mb-20">
                <WhatWeLove
                  data={apartment.gallery}
                  label={l.whatWeLoveLabel}
                  title={l.whatWeLoveTitle}
                  description={apartment.description}
                  acaciaReward={apartment.acaciaReward}
                />
              </section>
            )}

            {/* Amenities */}
            {apartment.amenities.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <AmenitiesList data={apartment.amenities} title={l.amenities} />
              </section>
            )}

            {/* Home Truths */}
            {apartment.homeTruth.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <HomeTruths
                  data={apartment.homeTruth}
                  label={l.homeTruthsLabel}
                  title={l.homeTruthsTitle}
                />
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="mt-12 lg:mt-0">
            <BookingSidebar
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              sleeps={apartment.sleeps}
              price={apartment.price}
              highlight={apartment.highlight}
              acaciaReward={apartment.acaciaReward}
              labels={l}
            />
            {apartment.infoDetail.length > 0 && (
              <div className="mt-8">
                <InfoDetail
                  data={apartment.infoDetail.map((item) => ({
                    __typename: item.__typename as 'InfoTextRecord' | 'InfoAddressRecord',
                    fragment: item as never,
                  }))}
                  title={l.info}
                  locale={locale}
                  district={apartment.district}
                />
              </div>
            )}
            {essentials.length > 0 && (
              <div className="mt-8">
                <EssentialsList data={essentials} title={l.essentials} />
              </div>
            )}
            {apartment.comforts.length > 0 && (
              <div className="mt-8">
                <ComfortsList data={apartment.comforts} title={l.comforts} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Full-width sections ── */}

      {/* Reviews */}
      {reviews.length > 0 && (
        <ReviewsList reviews={reviews} label={l.reviewsLabel} title={l.reviewsTitle} />
      )}

      {/* District */}
      {apartment.district && (
        <DistrictLink
          name={apartment.district.name}
          slug={apartment.district.slug}
          locale={locale as Locale}
          abstract={apartment.district.abstract}
          description={apartment.district.description}
          image={apartment.district.gallery[0]?.image?.responsiveImage}
        />
      )}

      {/* Related Content */}
      {(similarApartments.length > 0 || relatedMoods.length > 0) && (
        <RelatedContent
          apartments={similarApartments}
          moods={relatedMoods}
          locale={locale as Locale}
          labels={l}
        />
      )}

      {/* Beddy Booking */}
      {apartment.beddyId && (
        <section id="beddy-widget" className="py-16 bg-dark">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <p className="font-body text-body-lg text-white/70 mb-8">{l.book}</p>
            <BeddyBar locale={locale as Locale} widgetCode={apartment.beddyId} />
          </div>
        </section>
      )}

      {/* CIN/CIR legal */}
      {apartment.cin && (
        <div className="bg-surface-alt border-t border-border-light">
          <p className="mx-auto max-w-7xl px-5 md:px-8 py-3 font-body text-fine text-light">
            {apartment.cin}
          </p>
        </div>
      )}

      {/* Bottom bar spacer on mobile */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
