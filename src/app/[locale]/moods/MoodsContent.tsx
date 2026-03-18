import { type Locale } from '@/i18n/config';
import MoodCard from '@/components/MoodCard';
import HtmlContent from '@/components/HtmlContent';
import type { ResultOf } from 'gql.tada';
import type { moodsQuery } from './moodsQuery';

export type MoodsProps = { locale: Locale };
type MoodsData = ResultOf<typeof moodsQuery>;

export default function MoodsContent({ locale, data }: MoodsProps & { data: MoodsData }) {
  const { pageMoods, allMoods } = data;

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[55vh] flex items-end bg-dark"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-dark/60" />
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-normal text-hero text-white leading-[1.05] mb-3">
              {pageMoods?.title}
            </h1>
            {pageMoods?.subtitle && (
              <p className="font-body font-normal text-[1.125rem] md:text-[1.375rem] text-white/90 leading-relaxed">
                {pageMoods.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {pageMoods?.description && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent
              html={pageMoods.description}
              className="font-body text-body-lg text-dark"
            />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Moods Grid */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-8">
          <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
            {locale === 'en' ? 'Travel by feeling' : 'Viaggia per ispirazione'}
          </p>
          <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
            {locale === 'en' ? 'Discover our moods' : 'Scopri i nostri mood'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {allMoods.map((mood) => (
              <MoodCard key={mood.id} data={mood} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
