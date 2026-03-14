import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import DistrictCard, { DistrictCardFragment } from '@/components/DistrictCard';
import HtmlContent from '@/components/HtmlContent';

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
      <section className="relative min-h-[50vh] flex items-center justify-center bg-heading">
        <div className="relative z-10 text-center text-white px-5 py-20 max-w-3xl mx-auto">
          <h1 className="font-heading font-extralight text-huge mb-4">{pageDistricts?.title}</h1>
          {pageDistricts?.subtitle && (
            <p className="font-serif italic text-beta text-white/80">{pageDistricts.subtitle}</p>
          )}
        </div>
      </section>

      {/* Description */}
      {pageDistricts?.description && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <HtmlContent
              html={pageDistricts.description}
              className="font-serif text-delta text-heading"
            />
          </div>
        </section>
      )}

      {/* Districts Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allDistricts.map((district) => (
              <DistrictCard key={district.id} data={district} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
