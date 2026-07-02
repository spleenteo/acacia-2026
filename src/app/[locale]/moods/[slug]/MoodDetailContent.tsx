'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import StructuredTextContent from '@/components/StructuredTextContent';
import ReadMore from '@/components/ReadMore';
import ApartmentCard from '@/components/ApartmentCard';
import PostCard from '@/components/PostCard';
import DistrictCard from '@/components/DistrictCard';
import RelatedFaqCard from '@/components/RelatedFaqCard';
import PolaroidImageCard from '@/components/PolaroidImageCard';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import Lightbox, { useLightbox, type LightboxSlide } from '@/components/Lightbox';
import { toSlide } from '@/components/Lightbox/toSlide';
import { MoodCardFragment } from '@/components/MoodCard';
import RelatedList from '@/components/RelatedList';
import { readFragment } from '@/lib/datocms/graphql';
import type { FragmentOf, ResultOf } from 'gql.tada';
import type { query } from './page';

export type MoodDetailProps = {
  locale: Locale;
  /** Resolved full FAQ URLs keyed by record id (faq slugs need the tree). */
  faqHrefById: Record<string, string>;
};
type MoodDetailData = ResultOf<typeof query>;

export default function MoodDetailContent({
  locale,
  faqHrefById,
  data,
}: MoodDetailProps & { data: MoodDetailData }) {
  const tMoods = useTranslations('moods');
  const tListing = useTranslations('listing');
  const lightbox = useLightbox();

  // Masonry column count: 1 below sm, 2 from sm up (two columns on desktop too).
  // Default 2 for SSR (matches the desktop-first markup), then adjust on client.
  const [columnCount, setColumnCount] = useState(2);
  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const apply = () => setColumnCount(sm.matches ? 2 : 1);
    apply();
    sm.addEventListener('change', apply);
    return () => sm.removeEventListener('change', apply);
  }, []);

  const { mood } = data;
  if (!mood) return null;

  // `relatedContent` is a union of apartment | post | faq | district | gallery-image
  // links. Each renders with its own card, in the CMS order; gallery images get the
  // shared polaroid treatment and feed a lightbox (slides built alongside the cards).
  const related = mood.relatedContent;

  const slides: LightboxSlide[] = [];
  const cards: { id: string; node: ReactNode }[] = [];
  for (const item of related) {
    switch (item.__typename) {
      case 'ApartmentRecord':
        cards.push({ id: item.id, node: <ApartmentCard data={item} locale={locale} /> });
        break;
      case 'PostRecord':
        cards.push({ id: item.id, node: <PostCard data={item} locale={locale} /> });
        break;
      case 'DistrictRecord':
        cards.push({ id: item.id, node: <DistrictCard data={item} locale={locale} /> });
        break;
      case 'FaqRecord':
        cards.push({
          id: item.id,
          node: <RelatedFaqCard data={item} href={faqHrefById[item.id] ?? '#'} />,
        });
        break;
      case 'GalleryImageRecord': {
        // Coerce the narrowed union member back to a plain FragmentOf so
        // readFragment unmasks it (narrowed members otherwise infer `never`).
        const imageRecord: FragmentOf<typeof GalleryImageFragment> = item;
        const img = readFragment(GalleryImageFragment, imageRecord);
        const thumb = img.image?.responsiveImage;
        const full = img.image?.full;
        if (!thumb || !full) break;
        const slideIndex = slides.length;
        slides.push(toSlide(full, img.description));
        cards.push({
          id: item.id,
          node: (
            <PolaroidImageCard
              data={thumb}
              caption={img.description}
              index={slideIndex}
              onClick={() => lightbox.openAt(slideIndex)}
            />
          ),
        });
        break;
      }
    }
  }

  // Masonry that keeps the CMS reading order left→right: round-robin the cards
  // into N columns (item 0 → col 0, item 1 → col 1, …), natural heights fill
  // the space, and the per-column gap gives a clear separation between items.
  const columns = Array.from({ length: columnCount }, (_, c) =>
    cards.filter((_card, i) => i % columnCount === c),
  );

  const description = mood.description?.value ? (
    <StructuredTextContent data={mood.description} className="font-body text-body text-dark" />
  ) : null;

  // Other published moods for the "you might also be interested in" block.
  const otherMoods = data.allMoods
    .map((m) => readFragment(MoodCardFragment, m))
    .filter((m) => m.id !== mood.id)
    .map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      subtitle: m.claim,
      image: m.image?.responsiveImage,
    }));

  return (
    <>
      <EditorialHero
        tone="gold"
        label={tMoods('label')}
        title={mood.name ?? ''}
        subtitle={mood.claim}
        image={mood.image?.responsiveImage}
        priority
      />

      {/* Tucks under the hero diagonal on mobile; desktop overlap via the layout. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {related.length > 0 ? (
          <EditorialListingLayout
            body={description && <ReadMore desktopExpanded>{description}</ReadMore>}
          >
            <p className="mb-3 font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
              {tMoods('relatedLabel')}
            </p>
            <h2 className="mb-8 font-heading font-normal text-h2 text-dark tracking-[-0.02em]">
              {tMoods('relatedTitle')}
            </h2>
            {/* Masonry — natural-height cards in N ordered columns (see above),
                so the very different block heights fill the space with no gaps. */}
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
        model="mood"
        items={otherMoods}
        locale={locale}
        layout="grid"
      />
    </>
  );
}
