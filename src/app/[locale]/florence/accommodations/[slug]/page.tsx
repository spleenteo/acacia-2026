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
import ScrollToBooking from '@/components/ScrollToBooking';
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
    amenitiesLabel: 'Amenities',
    amenitiesTitle: 'The House Includes',
    comforts: 'Comforts',
    info: 'Details',
    book: 'Check availability',
    allPhotos: 'View gallery',
    whatWeLoveLabel: 'Acacia® crew',
    whatWeLoveTitle: 'What We Love',
    homeTruthsLabel: 'Good to Know',
    homeTruthsTitle: 'For a Great Experience',
    ctaContactLabel: 'Talk to us',
    ctaContactTitle: 'Have a question?',
    ctaContactText: 'Chat with the Acacia® crew on WhatsApp for personalized advice on your stay.',
    ctaContactButton: 'Chat on WhatsApp',
    ctaBookLabel: 'Do you like the idea?',
    ctaBookTitle: 'Check availability',
    ctaBookText: 'See real-time availability and pricing for this apartment.',
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
    amenitiesLabel: 'Amenities',
    amenitiesTitle: 'La casa include',
    comforts: 'Comforts',
    info: 'Dettagli',
    book: 'Verifica disponibilità',
    allPhotos: 'View gallery',
    whatWeLoveLabel: 'Acacia® crew',
    whatWeLoveTitle: 'Cosa ci piace',
    homeTruthsLabel: 'Da sapere',
    homeTruthsTitle: 'Per una grande esperienza',
    ctaContactLabel: 'Parla con noi',
    ctaContactTitle: 'Hai una domanda?',
    ctaContactText:
      'Chatta con il crew di Acacia® su WhatsApp per un consiglio personalizzato sul tuo soggiorno.',
    ctaContactButton: 'Chatta su WhatsApp',
    ctaBookLabel: "Ti piace l'idea?",
    ctaBookTitle: 'Verifica disponibilità',
    ctaBookText: 'Scopri disponibilità e prezzi in tempo reale per questo appartamento.',
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
        className="relative min-h-[50vh] flex items-end bg-dark"
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
              <p className="inline-block bg-rust text-white font-body font-medium text-label uppercase tracking-[0.15em] px-3 py-1 rounded-sm mb-4">
                {apartment.category.name}
              </p>
            )}
            <h1 className="font-heading font-normal text-h1 md:text-hero leading-none text-white">
              {apartment.name}
            </h1>
            {apartment.claim && (
              <p className="font-heading italic text-h2 text-white/80 max-w-2xl leading-snug mt-1">
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
                  lightboxItems={apartment.featuredSlideshow
                    .map((f) => readFragment(FeaturedSlideshowFragment, f))
                    .filter((img) => img.responsiveImage && img.full)
                    .map((img) => ({
                      id: img.id,
                      thumb: img.responsiveImage!,
                      full: img.full!,
                      caption: img.title || img.alt,
                    }))}
                />
              </section>
            )}

            {/* Amenities */}
            {apartment.amenities.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <AmenitiesList
                  data={apartment.amenities}
                  label={l.amenitiesLabel}
                  title={l.amenitiesTitle}
                />
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
          <div className="mt-12 lg:mt-0 lg:relative lg:top-[-180px]">
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

      {/* CTA Band — Contact + Booking */}
      <section className="bg-dark py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* WhatsApp Contact */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
                {l.ctaContactLabel}
              </p>
              <h3 className="font-heading italic text-h3 text-white mb-4">{l.ctaContactTitle}</h3>
              <p className="font-body text-body text-white/60 mb-6 max-w-md">{l.ctaContactText}</p>
              <a
                href={`https://wa.me/393939070181?text=${encodeURIComponent(apartment.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-body font-medium text-body px-6 py-3 rounded-pill transition-colors duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {l.ctaContactButton}
              </a>
            </div>

            {/* Booking CTA */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
                {l.ctaBookLabel}
              </p>
              <h3 className="font-heading italic text-h3 text-white mb-4">{l.ctaBookTitle}</h3>
              <p className="font-body text-body text-white/60 mb-6 max-w-md">{l.ctaBookText}</p>
              <ScrollToBooking className="w-full sm:w-auto bg-rust hover:bg-rust-hover text-white font-body font-medium text-body tracking-wide px-8 py-3.5 rounded-pill transition-colors duration-300 cursor-pointer text-center">
                {l.book}
              </ScrollToBooking>
            </div>
          </div>
        </div>
      </section>

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

      {/* Beddy Booking Widget */}
      {apartment.beddyId && (
        <section id="beddy-widget" className="py-16 bg-dark">
          <div className="mx-auto max-w-3xl px-8 text-center">
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
