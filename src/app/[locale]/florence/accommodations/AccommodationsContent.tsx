'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import { stripStega } from 'react-datocms/use-content-link';
import EditorialHero, { type HeroTone } from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import StructuredTextContent from '@/components/StructuredTextContent';
import ReadMore from '@/components/ReadMore';
import BeddyBar from '@/components/BeddyBar';
import CategoryFilter from '@/components/CategoryFilter';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type AccommodationsProps = { locale: Locale };
type AccommodationsData = ResultOf<typeof query>;

/** Tone codes the hero `color` field can return (must match EditorialHero). */
const HERO_TONES: HeroTone[] = ['rust', 'gold', 'sage', 'slate', 'navy', 'primary'];

/** Map the CMS `color` code to a valid hero tone, defaulting to primary.
 *  `color` is a string field, so strip stega before the membership check. */
function toHeroTone(color: string | null | undefined): HeroTone {
  const code = stripStega(color ?? '');
  return (HERO_TONES as string[]).includes(code) ? (code as HeroTone) : 'primary';
}

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

  // Sidebar copy is now the `description` structured-text field (was `intro`).
  const description = indexApartment?.description?.value ? (
    <StructuredTextContent
      data={indexApartment.description}
      className="font-body text-body-sm text-muted"
    />
  ) : null;

  return (
    <>
      {/* Hero — driven by the single-instance `hero` block (title, subtitle,
          optional image); background tone comes from the `color` field. */}
      <EditorialHero
        tone={toHeroTone(indexApartment?.hero.color)}
        title={indexApartment?.hero.title ?? ''}
        subtitle={indexApartment?.hero.subtitle}
        image={indexApartment?.hero.featuredImage?.responsiveImage}
        priority
      />

      {/* Content scrolls BEHIND the hero — lower z-index. On mobile it also
          tucks up under the hero's diagonal (negative margin) so there's no
          white band; on desktop the section's own -mt handles the overlap. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {/* Editorial rail (description) + filtered apartments grid */}
        <EditorialListingLayout
          kicker={t('whereToStay')}
          body={description && <ReadMore desktopExpanded>{description}</ReadMore>}
        >
          <CategoryFilter
            categories={categories}
            apartments={apartments}
            locale={locale}
            allLabel={t('allFilter')}
          />
        </EditorialListingLayout>

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
