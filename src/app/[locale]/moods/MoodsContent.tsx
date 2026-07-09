'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import StructuredTextContent from '@/components/StructuredTextContent';
import ReadMore from '@/components/ReadMore';
import MoodCard from '@/components/MoodCard';
import { toHeroTone } from '@/lib/heroTone';
import { readFragment } from '@/lib/datocms/graphql';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type MoodsProps = { locale: Locale };
type MoodsData = ResultOf<typeof query>;

export default function MoodsContent({ locale, data }: MoodsProps & { data: MoodsData }) {
  const t = useTranslations('moods');
  const page = data.page ? readFragment(IndexPageHeroFragment, data.page) : null;
  const { allMoods } = data;

  const description = page?.description?.value ? (
    <StructuredTextContent data={page.description} className="font-body text-body-sm text-muted" />
  ) : null;

  return (
    <>
      {/* Hero — driven by the single-instance `hero` block. */}
      <EditorialHero
        tone={toHeroTone(page?.hero.color)}
        label={t('label')}
        title={page?.hero.title ?? ''}
        subtitle={page?.hero.subtitle}
        image={page?.hero.featuredImage?.responsiveImage}
        priority
      />

      {/* Content scrolls BEHIND the hero — on mobile it tucks up under the
          hero's diagonal (negative margin) so there's no white band. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {/* Editorial rail (description) + moods grid */}
        <EditorialListingLayout
          kicker={t('label')}
          body={description && <ReadMore desktopExpanded>{description}</ReadMore>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
            {allMoods.map((mood) => (
              <MoodCard key={mood.id} data={mood} locale={locale} />
            ))}
          </div>
        </EditorialListingLayout>
      </div>
    </>
  );
}
