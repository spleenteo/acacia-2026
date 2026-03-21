'use client';

import type { FragmentOf } from '@/lib/datocms/graphql';
import type { Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import InViewSection from '@/components/InViewSection';
import ApartmentCard, { type ApartmentCardFragment } from '@/components/ApartmentCard';
import MoodCard, { type MoodCardFragment } from '@/components/MoodCard';

type Props = {
  apartments: FragmentOf<typeof ApartmentCardFragment>[];
  moods: FragmentOf<typeof MoodCardFragment>[];
  locale: Locale;
};

export default function RelatedContent({ apartments, moods, locale }: Props) {
  const t = useTranslations('apartment');

  if (apartments.length === 0 && moods.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-8">
        {/* Similar apartments */}
        {apartments.length > 0 && (
          <div className={moods.length > 0 ? 'mb-20' : ''}>
            <InViewSection className="mb-10">
              <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
                {t('similarLabel')}
              </p>
              <h2 className="font-heading text-h2 text-dark">
                <em>{t('similarTitle')}</em>
              </h2>
            </InViewSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {apartments.map((apt, i) => (
                <ApartmentCard key={i} data={apt} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {/* Related moods */}
        {moods.length > 0 && (
          <div>
            <InViewSection className="mb-10">
              <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
                {t('moodsLabel')}
              </p>
              <h2 className="font-heading text-h2 text-dark">
                <em>{t('moodsTitle')}</em>
              </h2>
            </InViewSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {moods.map((mood, i) => (
                <MoodCard key={i} data={mood} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
