import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import MoodCard, { MoodCardFragment } from '@/components/MoodCard';
import HtmlContent from '@/components/HtmlContent';

const query = graphql(
  `
    query MoodsQuery($locale: SiteLocale!) {
      pageMoods(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        description(locale: $locale, markdown: true)
      }
      allMoods(
        locale: $locale
        filter: { published: { eq: true } }
        orderBy: [position_ASC]
      ) {
        id
        ...MoodCardFragment
      }
    }
  `,
  [MoodCardFragment],
);

export default async function MoodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });

  const { pageMoods, allMoods } = data;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-heading">
        <div className="relative z-10 text-center text-white px-5 py-20 max-w-3xl mx-auto">
          <h1 className="font-heading font-extralight text-huge mb-4">{pageMoods?.title}</h1>
          {pageMoods?.subtitle && (
            <p className="font-serif italic text-beta text-white/80">{pageMoods.subtitle}</p>
          )}
        </div>
      </section>

      {/* Description */}
      {pageMoods?.description && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <HtmlContent
              html={pageMoods.description}
              className="font-serif text-delta text-heading"
            />
          </div>
        </section>
      )}

      {/* Moods Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMoods.map((mood) => (
              <MoodCard key={mood.id} data={mood} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
