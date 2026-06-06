'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import DistrictCard from '@/components/DistrictCard';
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

      {/* Content scrolls BEHIND the hero — on mobile it tucks up under the
          hero's diagonal (negative margin) so there's no white band. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {/* Editorial rail (description) + districts grid */}
        <EditorialListingLayout kicker={t('label')} intro={pageDistricts?.description}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
            {allDistricts.map((district) => (
              <DistrictCard key={district.id} data={district} locale={locale} />
            ))}
          </div>
        </EditorialListingLayout>
      </div>
    </>
  );
}
