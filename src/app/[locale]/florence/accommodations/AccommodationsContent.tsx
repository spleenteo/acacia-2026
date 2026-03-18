import { type Locale } from '@/i18n/config';
import ResponsiveImage from '@/components/ResponsiveImage';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import CategoryFilter from '@/components/CategoryFilter';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type AccommodationsProps = { locale: Locale };
type AccommodationsData = ResultOf<typeof query>;

export default function AccommodationsContent({
  locale,
  data,
}: AccommodationsProps & { data: AccommodationsData }) {
  const { pageApartments, allApartmentCategories, allApartments, homePage } = data;

  const categories = allApartmentCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  const apartments = allApartments.map((apt) => ({
    id: apt.id,
    categorySlug: apt.category.slug,
    data: apt,
  }));

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-[55vh] flex items-end bg-dark"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        {pageApartments?.featuredImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={pageApartments.featuredImage.responsiveImage}
              className="w-full h-full object-cover opacity-45"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-normal text-hero text-white leading-[1.05] mb-3">
              {pageApartments?.title}
            </h1>
            {pageApartments?.subtitle && (
              <p className="font-body font-normal text-[1.125rem] md:text-[1.375rem] text-white/90 leading-relaxed">
                {pageApartments.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Intro */}
      {pageApartments?.intro && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={pageApartments.intro} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Apartments Grid with Filter */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-8">
          <CategoryFilter
            categories={categories}
            apartments={apartments}
            locale={locale}
            allLabel={locale === 'en' ? 'All' : 'Tutti'}
          />
        </div>
      </section>

      {/* Beddy Booking Bar */}
      {homePage?.beddyId && (
        <section className="py-16 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <p className="font-body text-body-lg text-dark mb-8">
              {locale === 'en' ? 'Search availability' : 'Cerca disponibilità'}
            </p>
            <BeddyBar locale={locale} widgetCode={homePage.beddyId} />
          </div>
        </section>
      )}
    </>
  );
}
