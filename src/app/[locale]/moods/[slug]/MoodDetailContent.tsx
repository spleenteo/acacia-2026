'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import HtmlContent from '@/components/HtmlContent';
import ResponsiveImage from '@/components/ResponsiveImage';
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

  // Extract apartments from the polymorphic boxes -> object union
  const apartments = mood.boxes.flatMap((box) =>
    box.object.filter((item) => item.__typename === 'ApartmentRecord'),
  );

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[55vh] flex items-end bg-dark overflow-hidden"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        {mood.image?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={mood.image.responsiveImage}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        )}
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-heading font-normal text-hero leading-tight text-white">
              {mood.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Claim */}
      {mood.claim && (
        <section className="py-16 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <p className="font-body text-body-lg text-dark">{mood.claim}</p>
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Description */}
      {mood.description && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-3xl px-8">
            <HtmlContent
              html={mood.description}
              className="font-body text-body-lg text-dark leading-relaxed"
            />
          </div>
        </section>
      )}

      {/* Apartments for this mood */}
      {apartments.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-8">
            <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
              {tListing('whereToStay')}
            </p>
            <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
              {tMoods('apartments')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {apartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
