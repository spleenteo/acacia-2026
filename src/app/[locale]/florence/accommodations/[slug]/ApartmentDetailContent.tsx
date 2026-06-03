'use client';

import { useEffect, useRef, useState } from 'react';
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
import { pickHeroColor, isLightColor, pickPillColors } from '@/lib/heroColor';
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

  // On navigation to another apartment, reset scroll to top so the new hero
  // opens at its full size instead of appearing already in its sticky/collapsed
  // state (the shared layout otherwise keeps the previous scroll position).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [apartment?.id]);

  // Fade the hero photo out the moment the hero pins (desktop sticky). It's not
  // visible once collapsed, so rather than clip it we cross-fade to the solid
  // colour. The pin point mirrors the sticky `top` value used on the section.
  const heroRef = useRef<HTMLElement>(null);
  const [heroPinned, setHeroPinned] = useState(false);
  useEffect(() => {
    let raf = 0;
    const evaluate = () => {
      if (window.innerWidth < 1024) {
        setHeroPinned(false);
        return;
      }
      const el = heroRef.current;
      if (!el) return;
      // sticky top: calc(330px - 68svh) — compensates the 68svh inner height so
      // the pinned copy lands at a fixed px position regardless of viewport height.
      const stickyTop = 330 - 0.68 * window.innerHeight;
      const top = el.getBoundingClientRect().top;
      // Hysteresis: pinning shrinks the section's bottom padding by 50px, which
      // (the section being partly above the fold) makes the browser's scroll
      // anchoring nudge scrollY back ~50px — flipping the boolean and oscillating
      // in a tight pixel band. Pin with a small slack (covers svh/innerHeight
      // sub-pixel rounding so it latches at all) and only un-pin 64px later, so
      // the 56px dead-zone is wider than that ~50px anchoring nudge.
      setHeroPinned((prev) => (prev ? top <= stickyTop + 64 : top <= stickyTop + 8));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        evaluate();
      });
    };
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!apartment) return null;

  // Solid hero background drawn from the photo's palette, snapped toward the
  // Japan Fish hues. With an image the title sits over a dark gradient → white;
  // without one it sits on the solid colour, so adapt to its luminance.
  const heroColor = pickHeroColor(apartment.featuredImage?.colors);
  const heroOnImage = !!apartment.featuredImage?.responsiveImage;
  // Once the photo has faded out (no image, or pinned on desktop) the copy sits
  // directly on the solid colour, so flip to dark text when that colour is light.
  const heroTextDark = (!heroOnImage || heroPinned) && isLightColor(heroColor);
  // Two more palette colours (distinct from the hero) for the coloured fact pills.
  const [pillA, pillB] = pickPillColors(apartment.featuredImage?.colors, heroColor);

  return (
    <>
      {/* ── Hero — photo from the top with overlaid copy, sitting on the solid
          photo-derived colour. The coloured panel has a diagonal bottom edge. ── */}
      <section
        ref={heroRef}
        className={`relative mb-4 lg:mb-14 pb-10 lg:sticky lg:top-[calc(330px-68svh)] lg:z-30 transition-[padding] duration-500 ${
          heroPinned ? 'md:pb-3.5' : 'md:pb-16'
        }`}
        style={{
          backgroundColor: heroColor,
          marginTop: 'calc(var(--header-height) * -1)',
          // Leftward-rising diagonal cut on the bottom edge of the coloured panel.
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 34px))',
        }}
      >
        {/* Full-bleed on mobile; contained + rounded from md up. */}
        <div className="md:mx-auto md:max-w-7xl md:px-8">
          <div
            className={`relative min-h-[calc(58svh-50px)] md:min-h-[calc(68svh-50px)] overflow-hidden md:rounded-card transition-shadow duration-500 ${
              heroPinned ? 'md:shadow-none' : 'md:shadow-card-hover'
            }`}
          >
            {apartment.featuredImage?.responsiveImage && (
              <ResponsiveImage
                data={apartment.featuredImage.responsiveImage}
                pictureClassName={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                  heroPinned ? 'opacity-0' : 'opacity-100'
                }`}
                imgClassName="w-full h-full object-cover object-center"
                imgStyle={{ maxWidth: 'none', height: '100%', aspectRatio: 'unset' }}
                priority
              />
            )}

            {/* Legibility gradient (only meaningful when there's an image), fades
                out together with the photo when the hero pins. */}
            {heroOnImage && (
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
                  heroPinned ? 'opacity-0' : 'opacity-100'
                }`}
              />
            )}

            {/* Overlaid copy — bottom-left. */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
              <h1
                className={[
                  'font-heading font-semibold text-h1 md:text-hero leading-none max-w-3xl transition-colors duration-500',
                  heroTextDark ? 'text-dark' : 'text-white',
                ].join(' ')}
              >
                {apartment.name}
              </h1>

              {/* Key facts — two coloured pills (palette colours) + a stat line.
                  NOTE: copy is inline/provisional. Move to DatoCMS `Translation`
                  records once finalised. */}
              {(() => {
                const isIt = locale === 'it';
                const beds = apartment.bedrooms ?? 0;
                const baths = apartment.bathrooms ?? 0;
                // Use the real `bedrooms` figure (the category label already
                // embeds it, which caused "1 bedroom 1 bedroom apartment").
                const bedLabel = isIt
                  ? `appartamento ${beds} ${beds === 1 ? 'camera' : 'camere'}`
                  : `${beds} ${beds === 1 ? 'bedroom' : 'bedrooms'} apartment`;
                const pillClass =
                  'inline-block font-body font-medium text-label uppercase tracking-[0.15em] text-white px-3 py-1.5 rounded-sm';
                const gold = (v: React.ReactNode) => (
                  <span
                    className={[
                      'font-medium transition-colors duration-500',
                      heroPinned ? (heroTextDark ? 'text-dark' : 'text-white') : 'text-gold',
                    ].join(' ')}
                  >
                    {v}
                  </span>
                );
                return (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={pillClass} style={{ backgroundColor: pillA }}>
                        {bedLabel}
                      </span>
                      {apartment.district && (
                        <a
                          href="#district"
                          onClick={(e) => {
                            // Scroll in JS so we never touch the URL — a bare
                            // "#district" href was resolving against the path
                            // directory and dropping the apartment slug.
                            e.preventDefault();
                            document
                              .getElementById('district')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`${pillClass} cursor-pointer transition-opacity hover:opacity-85`}
                          style={{ backgroundColor: pillB }}
                        >
                          {isIt ? 'in ' : 'in '}
                          {apartment.district.name}
                        </a>
                      )}
                    </div>
                    <p
                      className={[
                        'mt-4 font-body text-body-lg leading-snug transition-colors duration-500',
                        heroTextDark ? 'text-dark/75' : 'text-white/85',
                      ].join(' ')}
                    >
                      {apartment.houseBadge?.label && <>{apartment.houseBadge.label}, </>}
                      {gold(apartment.sleeps)} {isIt ? 'posti letto' : 'sleeps'}
                      {', '}
                      {gold(baths)}{' '}
                      {isIt
                        ? baths === 1
                          ? 'bagno'
                          : 'bagni'
                        : baths === 1
                          ? 'bathroom'
                          : 'bathrooms'}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Check availability — at the photo's bottom-right, sticky with the hero (desktop). */}
            <div className="absolute bottom-4 right-4 z-20 hidden lg:block">
              <ScrollToBooking className="cursor-pointer rounded-pill bg-primary px-8 py-3.5 font-body text-body font-medium tracking-wide text-white transition-colors duration-300 hover:bg-primary-hover">
                {t('book')}
              </ScrollToBooking>
            </div>

            {/* View gallery — small pill top-right on mobile; plain text link at
                mid-height right edge from md up. */}
            {apartment.featuredSlideshow.length > 0 && (
              <div className="absolute right-4 top-[calc(var(--header-height)+12px)] z-20 md:right-5 md:top-1/2 md:-translate-y-1/2">
                <PhotoLightbox
                  slides={apartment.featuredSlideshow
                    .map((f) => readFragment(FeaturedSlideshowFragment, f))
                    .filter((img) => img.full)
                    .map((img) => toSlide(img.full!, img.title || img.alt))}
                  label={t('allPhotos')}
                  variant="plain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content scrolls BEHIND the sticky hero (desktop) — lower z-index. */}
      <div className="relative lg:z-0">
        {/* ── Two-column layout ── */}
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-6 pb-16 lg:pt-10 lg:pb-20">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 xl:gap-20">
            {/* ── Main content ── */}
            <div className="min-w-0">
              {/* What We Love + Description */}
              {(apartment.wwlGallery.length >= 2 || apartment.description) && (
                <section className="mb-16 lg:mb-20">
                  <WhatWeLove
                    data={apartment.wwlGallery}
                    label={t('wwlLabel')}
                    title={apartment.claim ?? ''}
                    description={apartment.description}
                    acaciaReward={apartment.acaciaReward}
                    lightboxSlides={apartment.featuredSlideshow
                      .map((f) => readFragment(FeaturedSlideshowFragment, f))
                      .filter((img) => img.full)
                      .map((img) => toSlide(img.full!, img.title || img.alt))}
                  />
                </section>
              )}
            </div>

            {/* ── Sidebar ── */}
            {/* top-[-40px] cancels the first widget's WidgetTitle top margin
                (mt-10) so the sidebar's first label lines up with the content
                column's "What We Love" label. On tablet (md, no lg sidebar yet)
                the widgets flow into two balanced columns (CSS multi-column, so
                the tall map widget doesn't leave a gap beside a short list);
                each widget stays intact and CIN/APE spans the full width below. */}
            <div className="mt-12 md:columns-2 md:gap-8 lg:mt-0 lg:columns-1 lg:relative lg:top-[-40px]">
              <BookingSidebar
                bedrooms={apartment.bedrooms}
                bathrooms={apartment.bathrooms}
                sleeps={apartment.sleeps}
                price={apartment.price}
                highlight={apartment.houseBadge?.label}
                acaciaReward={apartment.acaciaReward}
              />
              {apartment.infoDetail.length > 0 && (
                <div className="break-inside-avoid">
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
              {apartment.amenities.length > 0 && (
                <div className="break-inside-avoid">
                  <AmenitiesList
                    data={apartment.amenities}
                    label={t('amenitiesLabel')}
                    title={t('amenitiesTitle')}
                  />
                </div>
              )}
              {apartment.homeTruth.length > 0 && (
                <div className="break-inside-avoid">
                  <HomeTruths
                    data={apartment.homeTruth}
                    label={t('truthsLabel')}
                    title={t('truthsTitle')}
                  />
                </div>
              )}
              {essentials.length > 0 && (
                <div className="break-inside-avoid">
                  <EssentialsList data={essentials} title={t('essentials')} />
                </div>
              )}
              {apartment.comforts.length > 0 && (
                <div className="break-inside-avoid">
                  <ComfortsList data={apartment.comforts} title={t('comforts')} />
                </div>
              )}
              {(apartment.cin || apartment.ape) && (
                <div className="mt-10 pt-6 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-1 md:[column-span:all]">
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
                <p className="font-body text-label uppercase tracking-[0.18em] text-primary font-medium mb-2">
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
                <p className="font-body text-label uppercase tracking-[0.18em] text-primary font-medium mb-2">
                  {t('ctaBookLabel')}
                </p>
                <h3 className="font-heading italic text-h3 text-white mb-4">{t('ctaBookTitle')}</h3>
                <p className="font-body text-body text-white/60 mb-6 max-w-md">
                  {t('ctaBookText')}
                </p>
                <ScrollToBooking className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-body font-medium text-body tracking-wide px-8 py-3.5 rounded-pill transition-colors duration-300 cursor-pointer text-center">
                  {t('book')}
                </ScrollToBooking>
              </div>
            </div>
          </div>
        </section>

        {/* District — anchor target for the hero pill. On desktop the hero is
            pinned (~294px tall, diagonal cut topping out at 260px), so the scroll
            target is offset to tuck this section under that diagonal, not behind it. */}
        {apartment.district && (
          <div id="district" className="scroll-mt-[var(--header-height)] lg:scroll-mt-[260px]">
            <DistrictLink
              name={apartment.district.name}
              slug={apartment.district.slug}
              locale={locale}
              abstract={apartment.district.abstract}
              description={apartment.district.description}
              image={apartment.district.gallery[0]?.image?.responsiveImage}
            />
          </div>
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
      </div>
    </>
  );
}
