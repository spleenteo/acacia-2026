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
import { MoodCardFragment } from '@/components/MoodCard';
import RelatedList from '@/components/RelatedList';
import { readFragment } from '@/lib/datocms/graphql';
import type { ResultOf } from 'gql.tada';
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

  // `relatedContent` is a union of apartment | post | faq | district links.
  // Each record type renders with its own card, in the order set in the CMS.
  const related = mood.relatedContent;

  // Pre-render each item to its model-specific card (dropping unknown types).
  const renderCard = (item: (typeof related)[number]): ReactNode => {
    switch (item.__typename) {
      case 'ApartmentRecord':
        return <ApartmentCard data={item} locale={locale} />;
      case 'PostRecord':
        return <PostCard data={item} locale={locale} />;
      case 'DistrictRecord':
        return <DistrictCard data={item} locale={locale} />;
      case 'FaqRecord':
        return <RelatedFaqCard data={item} href={faqHrefById[item.id] ?? '#'} />;
      default:
        return null;
    }
  };
  const cards = related
    .map((item) => ({ id: item.id, node: renderCard(item) }))
    .filter((c): c is { id: string; node: ReactNode } => c.node !== null);

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
