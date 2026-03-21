'use client';

import { type Locale } from '@/i18n/config';
import ApartmentCard from '@/components/ApartmentCard';
import MoodCard from '@/components/MoodCard';
import SectionHeader from '@/components/SectionHeader';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import Hero from '@/components/Hero';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type HomeProps = { locale: Locale };
type HomeData = ResultOf<typeof query>;

export default function HomeContent({ locale, data }: HomeProps & { data: HomeData }) {
  const { homePage } = data;

  return (
    <>
      <Hero
        title={homePage?.title ?? ''}
        subtitle={homePage?.claim}
        buttons={homePage?.buttons}
        priority
      >
        {homePage?.beddyId && <BeddyBar locale={locale} widgetCode={homePage.beddyId} />}
      </Hero>

      {/* Stay Section */}
      {homePage?.stayText && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage.stayText} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Featured Apartments */}
      {homePage?.highlightedApartments && homePage.highlightedApartments.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-6xl px-8">
            {homePage.highlightsHeader && <SectionHeader data={homePage.highlightsHeader} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {homePage.highlightedApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Moods Section */}
      {homePage?.moods && homePage.moods.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-8">
            {homePage.moodsHeader && <SectionHeader data={homePage.moodsHeader} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {homePage.moods.map((mood) => (
                <MoodCard key={mood.id} data={mood} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Do Section */}
      {homePage?.doText && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage.doText} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}
    </>
  );
}
