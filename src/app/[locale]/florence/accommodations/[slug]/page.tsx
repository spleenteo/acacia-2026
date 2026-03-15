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
import CuddlesList, { CuddleFragment } from '@/components/CuddlesList';
import UpsList, { UpFragment } from '@/components/UpsList';
import InfoDetail, { InfoTextFragment, InfoAddressFragment } from '@/components/InfoDetail';
import DistrictLink from '@/components/DistrictLink';
import BookingSidebar from '@/components/BookingSidebar';
import WhatWeLove from '@/components/WhatWeLove';
import { FeaturedSlideshowFragment } from '@/components/WhatWeLove/fragment';
import HomeTruths, { TruthFragment } from '@/components/HomeTruths';
import ReviewsList from '@/components/ReviewsList';
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
          name(locale: $locale)
        }
        district {
          name
          slug
        }
        gallery {
          ...GalleryImageFragment
        }
        cuddles {
          ...CuddleFragment
        }
        ups {
          ...UpFragment
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
    CuddleFragment,
    UpFragment,
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
    }
  }
`);

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
    cuddles: 'Amenities & Cuddles',
    ups: 'Lifestyle',
    info: 'Details',
    book: 'Book this apartment',
    allPhotos: 'All photos',
    whatWeLoveLabel: 'Our favorites',
    whatWeLoveTitle: 'What We Love',
    homeTruthsLabel: 'Good to know',
    homeTruthsTitle: 'Home Truths',
    reviewsLabel: 'Guest reviews',
    reviewsTitle: 'What Our Guests Say',
  },
  it: {
    bedrooms: 'Camere',
    bathrooms: 'Bagni',
    sleeps: 'Ospiti',
    cuddles: 'Comfort & Coccole',
    ups: 'Lifestyle',
    info: 'Dettagli',
    book: 'Prenota questo alloggio',
    allPhotos: 'Tutte le foto',
    whatWeLoveLabel: 'I nostri preferiti',
    whatWeLoveTitle: 'Cosa ci piace',
    homeTruthsLabel: 'Da sapere',
    homeTruthsTitle: 'La verità, tutta la verità',
    reviewsLabel: 'Recensioni',
    reviewsTitle: 'I nostri ospiti raccontano',
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

  const reviewsData = await executeQuery(reviewsQuery, {
    variables: { apartmentId: apartment.id },
    includeDrafts: isDraftModeEnabled,
  });
  const reviews = reviewsData.allGuestbooks;

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
              className="w-full h-full object-cover opacity-55"
              priority
            />
          </div>
        )}
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="mx-auto max-w-7xl">
            {apartment.category && (
              <p className="font-body font-medium text-label text-white/60 uppercase tracking-[0.15em] mb-3">
                {apartment.category.name}
              </p>
            )}
            <h1 className="font-heading font-normal text-hero leading-tight text-white mb-3">
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
      <div className="mx-auto max-w-7xl px-8 py-16 lg:py-20">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 xl:gap-20">
          {/* ── Main content ── */}
          <div className="min-w-0">
            {/* Description */}
            {apartment.description && (
              <section className="mb-16 lg:mb-20">
                <HtmlContent
                  html={apartment.description}
                  className="font-body text-body-lg text-dark leading-relaxed"
                />
              </section>
            )}

            {/* What We Love */}
            {apartment.gallery.length >= 2 && (
              <section className="mb-16 lg:mb-20">
                <WhatWeLove
                  data={apartment.gallery}
                  label={l.whatWeLoveLabel}
                  title={l.whatWeLoveTitle}
                />
              </section>
            )}

            {/* Amenities */}
            {apartment.cuddles.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <CuddlesList data={apartment.cuddles} title={l.cuddles} />
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

            {/* Info Detail */}
            {apartment.infoDetail.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <InfoDetail
                  data={apartment.infoDetail.map((item) => ({
                    __typename: item.__typename as 'InfoTextRecord' | 'InfoAddressRecord',
                    fragment: item as never,
                  }))}
                  title={l.info}
                  locale={locale}
                  district={apartment.district}
                />
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            <BookingSidebar
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              sleeps={apartment.sleeps}
              price={apartment.price}
              highlight={apartment.highlight}
              acaciaReward={apartment.acaciaReward}
              labels={l}
            />
            {apartment.ups.length > 0 && (
              <div className="mt-10 lg:mt-8">
                <UpsList data={apartment.ups} title={l.ups} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Full-width sections ── */}

      {/* District Link */}
      {apartment.district && (
        <section>
          <DistrictLink
            name={apartment.district.name}
            slug={apartment.district.slug}
            locale={locale as Locale}
          />
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <ReviewsList reviews={reviews} label={l.reviewsLabel} title={l.reviewsTitle} />
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
          <p className="mx-auto max-w-7xl px-8 py-3 font-body text-fine text-light">
            {apartment.cin}
          </p>
        </div>
      )}

      {/* Bottom bar spacer on mobile */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
