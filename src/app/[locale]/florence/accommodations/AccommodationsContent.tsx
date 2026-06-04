'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
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
  const t = useTranslations('listing');
  const { indexApartment, allApartmentCategories, allApartments, homePage } = data;

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
      <EditorialHero
        tone="primary"
        title={indexApartment?.title ?? ''}
        subtitle={indexApartment?.subtitle}
        image={indexApartment?.featuredImage?.responsiveImage}
        priority
      />

      {/* Content scrolls BEHIND the sticky hero (desktop) — lower z-index. */}
      <div className="relative lg:z-0">
        {/* Intro */}
        {indexApartment?.intro && (
          <section className="py-20 lg:py-28 bg-surface-alt">
            <div className="mx-auto max-w-3xl px-8 text-center">
              <HtmlContent
                html={indexApartment.intro}
                className="font-body text-body-lg text-dark"
              />
              <div className="mx-auto mt-8 w-12 h-[3px] bg-primary rounded-sm" />
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
              allLabel={t('allFilter')}
            />
          </div>
        </section>

        {/* Beddy Booking Bar */}
        {homePage?.beddyId && (
          <section className="py-16 bg-surface-alt">
            <div className="mx-auto max-w-3xl px-8 text-center">
              <p className="font-body text-body-lg text-dark mb-8">{t('searchAvailability')}</p>
              <BeddyBar locale={locale} widgetCode={homePage.beddyId} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
