'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import type { FragmentOf } from '@/lib/datocms/graphql';
import ResponsiveImage from '@/components/ResponsiveImage';
import HtmlContent from '@/components/HtmlContent';
import BeddyBar from '@/components/BeddyBar';
import PhotoLightbox from '@/components/PhotoLightbox';
import { toSlide } from '@/components/Lightbox/toSlide';
import EssentialsList, { type EssentialFragment } from '@/components/EssentialsList';
import AmenitiesList from '@/components/AmenitiesList';
import ComfortsList from '@/components/ComfortsList';
import InfoDetail from '@/components/InfoDetail';
import DistrictLink from '@/components/DistrictLink';
import BookingSidebar from '@/components/BookingSidebar';
import WhatWeLove from '@/components/WhatWeLove';
import { FeaturedSlideshowFragment } from '@/components/WhatWeLove/fragment';
import HomeTruths from '@/components/HomeTruths';
import ReviewsList from '@/components/ReviewsList';
import RelatedContent from '@/components/RelatedContent';
import ScrollToBooking from '@/components/ScrollToBooking';
import { type ApartmentCardFragment } from '@/components/ApartmentCard';
import { type MoodCardFragment } from '@/components/MoodCard';
import { readFragment } from '@/lib/datocms/graphql';
import type { ResultOf } from 'gql.tada';
import type { query as apartmentDetailQuery } from './page';

export type ApartmentDetailProps = {
  locale: Locale;
  essentials: FragmentOf<typeof EssentialFragment>[];
  reviews: {
    id: string;
    name: string;
    title: string | null;
    quote: string;
    date: string;
    channel: string | null;
  }[];
  similarApartments: FragmentOf<typeof ApartmentCardFragment>[];
  relatedMoods: FragmentOf<typeof MoodCardFragment>[];
};
type ApartmentDetailData = ResultOf<typeof apartmentDetailQuery>;

export default function ApartmentDetailContent({
  locale,
  essentials,
  reviews,
  similarApartments,
  relatedMoods,
  data,
}: ApartmentDetailProps & { data: ApartmentDetailData }) {
  const t = useTranslations('apartment');
  const tGallery = useTranslations('gallery');
  const { apartment } = data;
  if (!apartment) return null;

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
                slides={apartment.featuredSlideshow
                  .map((f) => readFragment(FeaturedSlideshowFragment, f))
                  .filter((img) => img.full)
                  .map((img) => toSlide(img.full!, img.title || img.alt))}
                label={t('allPhotos')}
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
            {(apartment.wwlGallery.length >= 2 || apartment.description) && (
              <section className="mb-16 lg:mb-20">
                <WhatWeLove
                  data={apartment.wwlGallery}
                  label={t('wwlLabel')}
                  title={t('wwlTitle')}
                  description={apartment.description}
                  acaciaReward={apartment.acaciaReward}
                  lightboxSlides={apartment.featuredSlideshow
                    .map((f) => readFragment(FeaturedSlideshowFragment, f))
                    .filter((img) => img.full)
                    .map((img) => toSlide(img.full!, img.title || img.alt))}
                />
              </section>
            )}

            {/* Amenities */}
            {apartment.amenities.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <AmenitiesList
                  data={apartment.amenities}
                  label={t('amenitiesLabel')}
                  title={t('amenitiesTitle')}
                />
              </section>
            )}

            {/* Home Truths */}
            {apartment.homeTruth.length > 0 && (
              <section className="mb-16 lg:mb-20">
                <HomeTruths
                  data={apartment.homeTruth}
                  label={t('truthsLabel')}
                  title={t('truthsTitle')}
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
              highlight={apartment.houseBadge?.label}
              acaciaReward={apartment.acaciaReward}
            />
            {apartment.infoDetail.length > 0 && (
              <div className="mt-8">
                <InfoDetail
                  data={apartment.infoDetail.map((item) => ({
                    __typename: item.__typename as 'InfoTextRecord' | 'InfoAddressRecord',
                    fragment: item as never,
                  }))}
                  title={t('info')}
                  locale={locale}
                  district={apartment.district}
                />
              </div>
            )}
            {essentials.length > 0 && (
              <div className="mt-8">
                <EssentialsList data={essentials} title={t('essentials')} />
              </div>
            )}
            {apartment.comforts.length > 0 && (
              <div className="mt-8">
                <ComfortsList data={apartment.comforts} title={t('comforts')} />
              </div>
            )}
            {(apartment.cin || apartment.ape) && (
              <div className="mt-10 pt-6 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-1">
                {apartment.cin && (
                  <p className="font-body text-fine text-muted">
                    <span className="font-medium">CIN:</span> {apartment.cin}
                  </p>
                )}
                {apartment.ape && (
                  <p className="font-body text-fine text-muted">
                    <span className="font-medium">APE:</span> {apartment.ape}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Full-width sections ── */}

      {/* Reviews */}
      {reviews.length > 0 && (
        <ReviewsList reviews={reviews} label={t('reviewsLabel')} title={t('reviewsTitle')} />
      )}

      {/* CTA Band — Contact + Booking */}
      <section className="bg-dark py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* WhatsApp Contact */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
                {t('ctaContactLabel')}
              </p>
              <h3 className="font-heading italic text-h3 text-white mb-4">
                {t('ctaContactTitle')}
              </h3>
              <p className="font-body text-body text-white/60 mb-6 max-w-md">
                {t('ctaContactText')}
              </p>
              <a
                href={`https://wa.me/393939070181?text=${encodeURIComponent(apartment.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-body font-medium text-body px-6 py-3 rounded-pill transition-colors duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('ctaContactButton')}
              </a>
            </div>

            {/* Booking CTA */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
                {t('ctaBookLabel')}
              </p>
              <h3 className="font-heading italic text-h3 text-white mb-4">{t('ctaBookTitle')}</h3>
              <p className="font-body text-body text-white/60 mb-6 max-w-md">{t('ctaBookText')}</p>
              <ScrollToBooking className="w-full sm:w-auto bg-rust hover:bg-rust-hover text-white font-body font-medium text-body tracking-wide px-8 py-3.5 rounded-pill transition-colors duration-300 cursor-pointer text-center">
                {t('book')}
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
          locale={locale}
          abstract={apartment.district.abstract}
          description={apartment.district.description}
          image={apartment.district.gallery[0]?.image?.responsiveImage}
        />
      )}

      {/* Related Content */}
      {(similarApartments.length > 0 || relatedMoods.length > 0) && (
        <RelatedContent apartments={similarApartments} moods={relatedMoods} locale={locale} />
      )}

      {/* Beddy Booking Widget */}
      {apartment.beddyId && (
        <section id="beddy-widget" className="py-16 bg-dark">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <BeddyBar locale={locale} widgetCode={apartment.beddyId} />
          </div>
        </section>
      )}

      {/* Bottom bar spacer on mobile */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
