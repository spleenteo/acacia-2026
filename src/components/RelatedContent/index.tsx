import type { FragmentOf } from '@/lib/datocms/graphql';
import type { Locale } from '@/i18n/config';
import ApartmentCard, { type ApartmentCardFragment } from '@/components/ApartmentCard';
import MoodCard, { type MoodCardFragment } from '@/components/MoodCard';

type Props = {
  apartments: FragmentOf<typeof ApartmentCardFragment>[];
  moods: FragmentOf<typeof MoodCardFragment>[];
  locale: Locale;
  labels: {
    similarLabel: string;
    similarTitle: string;
    moodsLabel: string;
    moodsTitle: string;
  };
};

export default function RelatedContent({ apartments, moods, locale, labels }: Props) {
  if (apartments.length === 0 && moods.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-8">
        {/* Similar apartments */}
        {apartments.length > 0 && (
          <div className={moods.length > 0 ? 'mb-20' : ''}>
            <div className="mb-10">
              <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
                {labels.similarLabel}
              </p>
              <h2 className="font-heading text-h2 text-dark">
                <em>{labels.similarTitle}</em>
              </h2>
            </div>
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
            <div className="mb-10">
              <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
                {labels.moodsLabel}
              </p>
              <h2 className="font-heading text-h2 text-dark">
                <em>{labels.moodsTitle}</em>
              </h2>
            </div>
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
