'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import ApartmentCard from '@/components/ApartmentCard';
import MoodCard from '@/components/MoodCard';
import SectionHeader from '@/components/SectionHeader';
import HtmlContent from '@/components/HtmlContent';
import Hero from '@/components/Hero';
import SearchBox from '@/components/SearchBox';
import ReviewSpotlight from '@/components/ReviewSpotlight';
import SectionDock, { type DockItem } from '@/components/SectionDock';
import { readFragment } from '@/lib/datocms/graphql';
import { ReviewSpotlightFragment } from '@/components/ReviewSpotlight/fragment';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type HomeProps = { locale: Locale; spotlightSeed: number };
type HomeData = ResultOf<typeof query>;

export default function HomeContent({
  locale,
  spotlightSeed,
  data,
}: HomeProps & { data: HomeData }) {
  const { homePage } = data;

  // Dedupe the review pool to the most recent review per apartment, then pick
  // one via the server-provided seed (so SSR and client agree, and each request
  // rotates the spotlight).
  const spotlightPool = (() => {
    const seen = new Set<string>();
    const out: typeof data.spotlightReviews = [];
    for (const item of data.spotlightReviews ?? []) {
      const slug = readFragment(ReviewSpotlightFragment, item).apartment?.slug;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      out.push(item);
      if (out.length >= 10) break;
    }
    return out;
  })();
  const spotlightReview = spotlightPool.length
    ? spotlightPool[Math.floor(spotlightSeed * spotlightPool.length) % spotlightPool.length]
    : null;

  const t = useTranslations('home');
  const hasStay = !!homePage?.stayText;
  const hasApartments = !!homePage?.highlightedApartments?.length;
  const hasMoods = !!homePage?.moods?.length;
  const hasDo = !!homePage?.doText;

  // Dock entries mirror the sections actually rendered below, in order.
  const dockItems: DockItem[] = [
    { id: 'home-top', label: t('navHome') },
    spotlightReview && { id: 'home-review', label: t('navReview') },
    hasStay && { id: 'home-stay', label: t('navStay') },
    hasApartments && { id: 'home-apartments', label: t('navApartments') },
    hasMoods && { id: 'home-moods', label: t('navMoods') },
    hasDo && { id: 'home-experiences', label: t('navExperiences') },
  ].filter((x): x is DockItem => Boolean(x));

  return (
    <>
      <SectionDock items={dockItems} />

      <div id="home-top">
        {/* The hero CTAs are replaced by the search entry point (above the
            fold). `homePage.buttons` stays in the CMS, just not rendered here. */}
        <Hero title={homePage?.title ?? ''} subtitle={homePage?.subtitle} locale={locale} priority>
          <SearchBox locale={locale} />
        </Hero>
      </div>

      {spotlightReview && (
        <div id="home-review" className="scroll-mt-24">
          <ReviewSpotlight data={spotlightReview} locale={locale} />
        </div>
      )}

      {/* Stay Section */}
      {hasStay && (
        <section id="home-stay" className="scroll-mt-24 py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage!.stayText!} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-primary rounded-sm" />
          </div>
        </section>
      )}

      {/* Featured Apartments */}
      {hasApartments && (
        <section id="home-apartments" className="scroll-mt-24 py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-6xl px-8">
            {homePage!.highlightsHeader && <SectionHeader data={homePage!.highlightsHeader} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {homePage!.highlightedApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Moods Section */}
      {hasMoods && (
        <section id="home-moods" className="scroll-mt-24 py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-8">
            {homePage!.moodsHeader && <SectionHeader data={homePage!.moodsHeader} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {homePage!.moods.map((mood) => (
                <MoodCard key={mood.id} data={mood} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Do Section */}
      {hasDo && (
        <section id="home-experiences" className="scroll-mt-24 py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage!.doText!} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-primary rounded-sm" />
          </div>
        </section>
      )}
    </>
  );
}
