import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import DistrictCard, { DistrictCardFragment } from '@/components/DistrictCard';
import HtmlContent from '@/components/HtmlContent';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query DistrictsMetaQuery($locale: SiteLocale!) {
      pageDistricts(locale: $locale) {
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
    ...toNextMetadata(data.pageDistricts?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/districts`,
      languages: { en: '/en/florence/districts', it: '/it/florence/districts' },
    },
  };
}

const query = graphql(
  `
    query DistrictsQuery($locale: SiteLocale!) {
      pageDistricts(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        description(locale: $locale, markdown: true)
      }
      allDistricts(locale: $locale, orderBy: [position_ASC]) {
        id
        ...DistrictCardFragment
      }
    }
  `,
  [DistrictCardFragment],
);

export default async function DistrictsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });

  const { pageDistricts, allDistricts } = data;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end bg-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-dark/60" />
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-normal text-hero text-white leading-[1.05] mb-3">
              {pageDistricts?.title}
            </h1>
            {pageDistricts?.subtitle && (
              <p className="font-body text-body-lg text-white/70">{pageDistricts.subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {pageDistricts?.description && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent
              html={pageDistricts.description}
              className="font-body text-body-lg text-dark"
            />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Districts Grid */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-8">
          <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
            {locale === 'en' ? 'Florence neighborhoods' : 'Quartieri di Firenze'}
          </p>
          <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
            {locale === 'en' ? 'Explore the city' : 'Esplora la città'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {allDistricts.map((district) => (
              <DistrictCard key={district.id} data={district} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
