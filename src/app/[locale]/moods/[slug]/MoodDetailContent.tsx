'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import StructuredTextContent from '@/components/StructuredTextContent';
import ReadMore from '@/components/ReadMore';
import ApartmentCard from '@/components/ApartmentCard';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type MoodDetailProps = { locale: Locale };
type MoodDetailData = ResultOf<typeof query>;

export default function MoodDetailContent({
  locale,
  data,
}: MoodDetailProps & { data: MoodDetailData }) {
  const tMoods = useTranslations('moods');
  const tListing = useTranslations('listing');
  const { mood } = data;
  if (!mood) return null;

  // Apartments come from the simplified `relatedContent` links field (a union of
  // apartment | district | post); keep only the apartments for the card grid.
  const apartments = mood.relatedContent.filter((item) => item.__typename === 'ApartmentRecord');

  const description = mood.description?.value ? (
    <StructuredTextContent data={mood.description} className="font-body text-body text-dark" />
  ) : null;

  return (
    <>
      <EditorialHero
        tone="gold"
        title={mood.name ?? ''}
        subtitle={mood.claim}
        image={mood.image?.responsiveImage}
        priority
      />

      {/* Tucks under the hero diagonal on mobile; desktop overlap via the layout. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {apartments.length > 0 ? (
          <EditorialListingLayout body={description && <ReadMore>{description}</ReadMore>}>
            <p className="mb-3 font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
              {tListing('whereToStay')}
            </p>
            <h2 className="mb-8 font-heading font-normal text-h2 text-dark tracking-[-0.02em]">
              {tMoods('apartments')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
              {apartments.map((apartment) => (
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
      </div>
    </>
  );
}
