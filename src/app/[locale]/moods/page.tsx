import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import MoodCard, { MoodCardFragment } from '@/components/MoodCard';
import HtmlContent from '@/components/HtmlContent';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query MoodsMetaQuery($locale: SiteLocale!) {
      pageMoods(locale: $locale) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { locale: locale as Locale },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.pageMoods?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/moods`,
      languages: { en: '/en/moods', it: '/it/moods' },
    },
  };
}

const query = graphql(
  `
    query MoodsQuery($locale: SiteLocale!) {
      pageMoods(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        description(locale: $locale, markdown: true)
      }
      allMoods(locale: $locale, filter: { published: { eq: true } }, orderBy: [position_ASC]) {
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
      <section className="relative min-h-[55vh] flex items-end bg-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-dark/60" />
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-bold text-hero text-white leading-[1.05] mb-3">
              {pageMoods?.title}
            </h1>
            {pageMoods?.subtitle && (
              <p className="font-body text-body-lg text-white/70">{pageMoods.subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {pageMoods?.description && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={pageMoods.description} className="font-body text-body-lg text-dark" />
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
          <h2 className="font-heading font-bold text-h1 text-dark text-center tracking-[-0.02em] mb-12">
            {locale === 'en' ? 'Discover our moods' : 'Scopri i nostri mood'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {allMoods.map((mood) => (
              <MoodCard key={mood.id} data={mood} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
