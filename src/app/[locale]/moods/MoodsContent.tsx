'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import MoodCard from '@/components/MoodCard';
import HtmlContent from '@/components/HtmlContent';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type MoodsProps = { locale: Locale };
type MoodsData = ResultOf<typeof query>;

export default function MoodsContent({ locale, data }: MoodsProps & { data: MoodsData }) {
  const t = useTranslations('moods');
  const { pageMoods, allMoods } = data;

  return (
    <>
      {/* Hero */}
      <EditorialHero
        tone="gold"
        label={t('label')}
        title={pageMoods?.title ?? ''}
        subtitle={pageMoods?.subtitle}
        priority
      />

      {/* Content scrolls BEHIND the sticky hero (desktop) — lower z-index. */}
      <div className="relative lg:z-0">
        {/* Description */}
        {pageMoods?.description && (
          <section className="py-20 lg:py-28 bg-surface-alt">
            <div className="mx-auto max-w-3xl px-8 text-center">
              <HtmlContent
                html={pageMoods.description}
                className="font-body text-body-lg text-dark"
              />
              <div className="mx-auto mt-8 w-12 h-[3px] bg-primary rounded-sm" />
            </div>
          </section>
        )}

        {/* Moods Grid */}
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-6xl px-8">
            <p className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium text-center mb-3">
              {t('label')}
            </p>
            <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
              {t('title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {allMoods.map((mood) => (
                <MoodCard key={mood.id} data={mood} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
