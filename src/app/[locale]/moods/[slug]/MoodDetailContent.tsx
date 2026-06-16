'use client';

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
  const { mood } = data;
  if (!mood) return null;

  // `relatedContent` is a union of apartment | post | faq | district links.
  // Each record type renders with its own card, in the order set in the CMS.
  const related = mood.relatedContent;

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
            <div className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
              {related.map((item) => {
                switch (item.__typename) {
                  case 'ApartmentRecord':
                    return <ApartmentCard key={item.id} data={item} locale={locale} />;
                  case 'PostRecord':
                    return <PostCard key={item.id} data={item} locale={locale} />;
                  case 'DistrictRecord':
                    return <DistrictCard key={item.id} data={item} locale={locale} />;
                  case 'FaqRecord':
                    return (
                      <RelatedFaqCard
                        key={item.id}
                        data={item}
                        href={faqHrefById[item.id] ?? '#'}
                      />
                    );
                  default:
                    return null;
                }
              })}
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
