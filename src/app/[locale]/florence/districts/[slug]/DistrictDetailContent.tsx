'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import HtmlContent from '@/components/HtmlContent';
import ReadMore from '@/components/ReadMore';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import ImageGallery from '@/components/ImageGallery';
import { toSlide } from '@/components/Lightbox/toSlide';
import ApartmentCard from '@/components/ApartmentCard';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import RelatedList from '@/components/RelatedList';
import { readFragment } from '@/lib/datocms/graphql';
import type { ResultOf } from 'gql.tada';
import type { query as districtDetailQuery, apartmentsInDistrictQuery } from './page';

export type DistrictDetailProps = {
  locale: Locale;
  apartmentsData: ResultOf<typeof apartmentsInDistrictQuery>;
};
type DistrictDetailData = ResultOf<typeof districtDetailQuery>;

export default function DistrictDetailContent({
  locale,
  apartmentsData,
  data,
}: DistrictDetailProps & { data: DistrictDetailData }) {
  const tListing = useTranslations('listing');
  const tDistrict = useTranslations('district');
  const { district } = data;
  if (!district) return null;

  const { allApartments } = apartmentsData;

  const description = district.description ? (
    <HtmlContent html={district.description} className="font-body text-body text-dark" />
  ) : null;

  const galleryItems = district.gallery
    .map((g) => readFragment(GalleryImageFragment, g))
    .filter((img) => img.image?.responsiveImage && img.image?.full);

  // Other published districts for the "you might also be interested in" block.
  const otherDistricts = data.allDistricts
    .map((d) => readFragment(DistrictCardFragment, d))
    .filter((d) => d.id !== district.id)
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      image: d.gallery[0]?.image?.responsiveImage,
    }));

  return (
    <>
      <EditorialHero
        tone="slate"
        label={tListing('florence')}
        title={district.name ?? ''}
        subtitle={district.abstract}
        priority
      />

      {/* Tucks under the hero diagonal on mobile; desktop overlap via the layout. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {allApartments.length > 0 ? (
          <EditorialListingLayout body={description && <ReadMore>{description}</ReadMore>}>
            <p className="mb-3 font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
              {tListing('whereToStay')}
            </p>
            <h2 className="mb-8 font-heading font-normal text-h2 text-dark tracking-[-0.02em]">
              {tDistrict('apartments')} {district.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
              {allApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale} />
              ))}
            </div>
          </EditorialListingLayout>
        ) : (
          description && (
            <section className="pt-[68px] pb-20 lg:py-24">
              <div className="mx-auto max-w-3xl px-8">{description}</div>
            </section>
          )
        )}

        {/* Gallery — full-width below the two-column block */}
        {galleryItems.length > 0 && (
          <section className="py-16 lg:py-20 bg-surface-alt">
            <div className="mx-auto max-w-6xl px-8">
              <ImageGallery
                items={galleryItems.map((img) => ({
                  id: img.id,
                  thumb: img.image!.responsiveImage!,
                  full: img.image!.full!,
                  caption: img.description,
                }))}
                slides={district.gallery
                  .map((g) => readFragment(GalleryImageFragment, g))
                  .filter((img) => img.image?.full)
                  .map((img) => toSlide(img.image!.full!, img.description))}
              />
            </div>
          </section>
        )}
      </div>

      <RelatedList
        title={tListing('alsoInterested')}
        model="district"
        items={otherDistricts}
        locale={locale}
      />
    </>
  );
}
