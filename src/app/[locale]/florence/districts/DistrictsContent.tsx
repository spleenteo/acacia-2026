'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import DistrictCard from '@/components/DistrictCard';
import HtmlContent from '@/components/HtmlContent';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type DistrictsProps = { locale: Locale };
type DistrictsData = ResultOf<typeof query>;

export default function DistrictsContent({
  locale,
  data,
}: DistrictsProps & { data: DistrictsData }) {
  const t = useTranslations('districts');
  const { pageDistricts, allDistricts } = data;

  return (
    <>
      {/* Hero */}
      <EditorialHero
        tone="slate"
        label={t('label')}
        title={pageDistricts?.title ?? ''}
        subtitle={pageDistricts?.subtitle}
        priority
      />

      {/* Description */}
      {pageDistricts?.description && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent
              html={pageDistricts.description}
              className="font-body text-body-lg text-dark"
            />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-primary rounded-sm" />
          </div>
        </section>
      )}

      {/* Districts Grid */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-8">
          <p className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium text-center mb-3">
            {t('label')}
          </p>
          <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
            {t('title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {allDistricts.map((district) => (
              <DistrictCard key={district.id} data={district} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
