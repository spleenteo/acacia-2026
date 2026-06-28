'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import HtmlContent from '@/components/HtmlContent';
import ReadMore from '@/components/ReadMore';
import ResponsiveImage from '@/components/ResponsiveImage';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import Lightbox, { useLightbox, type LightboxSlide } from '@/components/Lightbox';
import { toSlide } from '@/components/Lightbox/toSlide';
import ApartmentCard from '@/components/ApartmentCard';
import PostCard from '@/components/PostCard';
import { DistrictCardFragment } from '@/components/DistrictCard/fragment';
import RelatedList from '@/components/RelatedList';
import { readFragment } from '@/lib/datocms/graphql';
import type { FragmentOf, ResultOf } from 'gql.tada';
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
  const lightbox = useLightbox();

  // Masonry column count: 1 (<sm), 2 (sm–xl), 3 (xl+). Default 2 for SSR.
  const [columnCount, setColumnCount] = useState(2);
  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const xl = window.matchMedia('(min-width: 1280px)');
    const apply = () => setColumnCount(xl.matches ? 3 : sm.matches ? 2 : 1);
    apply();
    sm.addEventListener('change', apply);
    xl.addEventListener('change', apply);
    return () => {
      sm.removeEventListener('change', apply);
      xl.removeEventListener('change', apply);
    };
  }, []);

  const { district } = data;
  if (!district) return null;

  const { allApartments } = apartmentsData;

  const description = district.description ? (
    <HtmlContent html={district.description} className="font-body text-body text-dark" />
  ) : null;

  // Walk the `gallery` union once, in CMS order, turning each block into a card:
  // GalleryImage → image card that opens the shared lightbox at its slide index;
  // Post → PostCard. The narrowed branches already satisfy the components' props
  // (image blocks are coerced to a plain `FragmentOf` so readFragment can unmask).
  const slides: LightboxSlide[] = [];
  const galleryCards: { id: string; node: ReactNode }[] = [];
  for (const block of district.gallery) {
    if (block.__typename === 'GalleryImageRecord') {
      const imageBlock: FragmentOf<typeof GalleryImageFragment> = block;
      const img = readFragment(GalleryImageFragment, imageBlock);
      const thumb = img.image?.responsiveImage;
      const full = img.image?.full;
      if (!thumb || !full) continue;
      const slideIndex = slides.length;
      slides.push(toSlide(full, img.description));
      galleryCards.push({
        id: `img-${img.id}`,
        node: (
          <button
            type="button"
            onClick={() => lightbox.openAt(slideIndex)}
            className="group block w-full text-left cursor-pointer"
          >
            <div className="overflow-hidden rounded-sm">
              <div className="transition-transform duration-700 ease-card group-hover:scale-[1.03]">
                <ResponsiveImage data={thumb} />
              </div>
            </div>
            {img.description && (
              <p className="pt-3 font-heading italic text-body-sm text-muted">{img.description}</p>
            )}
          </button>
        ),
      });
    } else if (block.__typename === 'PostRecord') {
      galleryCards.push({
        id: `post-${block.id}`,
        node: <PostCard data={block} locale={locale} />,
      });
    }
  }

  // One masonry of apartments + gallery images + posts. Apartments lead (the
  // district's core "where to stay"), then the curated gallery in CMS order.
  const cards = [
    ...allApartments.map((apartment) => ({
      id: `apt-${apartment.id}`,
      node: <ApartmentCard data={apartment} locale={locale} />,
    })),
    ...galleryCards,
  ];

  // Round-robin into N columns so the reading order flows left→right; natural
  // card heights fill the space, the per-column gap separates items.
  const columns = Array.from({ length: columnCount }, (_, c) =>
    cards.filter((_card, i) => i % columnCount === c),
  );

  // Other published districts for the "you might also be interested in" block.
  const otherDistricts = data.allDistricts
    .map((d) => readFragment(DistrictCardFragment, d))
    .filter((d) => d.id !== district.id)
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      image: d.gallery.flatMap((g) =>
        g.__typename === 'GalleryImageRecord' ? [g.image?.responsiveImage] : [],
      )[0],
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
        {cards.length > 0 ? (
          <EditorialListingLayout body={description && <ReadMore>{description}</ReadMore>}>
            <p className="mb-3 font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
              {tListing('discoverArea')}
            </p>
            <h2 className="mb-8 font-heading font-normal text-h2 text-dark tracking-[-0.02em]">
              {district.name}
            </h2>
            {/* Masonry — natural-height cards in N ordered columns. */}
            <div className="flex gap-6">
              {columns.map((col, ci) => (
                <div key={ci} className="flex flex-1 flex-col gap-12">
                  {col.map((card) => (
                    <div key={card.id}>{card.node}</div>
                  ))}
                </div>
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
      </div>

      {slides.length > 0 && (
        <Lightbox
          slides={slides}
          open={lightbox.open}
          index={lightbox.index}
          onClose={lightbox.close}
        />
      )}

      <RelatedList
        title={tListing('alsoInterested')}
        model="district"
        items={otherDistricts}
        locale={locale}
      />
    </>
  );
}
