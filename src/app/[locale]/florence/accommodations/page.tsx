import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import CategoryFilter from '@/components/CategoryFilter';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query AccommodationsMetaQuery($locale: SiteLocale!) {
      pageApartments(locale: $locale) {
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
    ...toNextMetadata(data.pageApartments?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/accommodations`,
      languages: { en: '/en/florence/accommodations', it: '/it/florence/accommodations' },
    },
  };
}

const query = graphql(
  `
    query AccommodationsQuery($locale: SiteLocale!) {
      pageApartments(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        intro(locale: $locale, markdown: true)
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 500, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
      allApartmentCategories(locale: $locale, orderBy: [position_ASC]) {
        id
        name(locale: $locale)
        slug
      }
      allApartments(
        locale: $locale
        first: 100
        filter: { published: { eq: true } }
        orderBy: [position_ASC]
      ) {
        id
        category {
          slug
        }
        ...ApartmentCardFragment
      }
      homePage(locale: $locale) {
        beddyId
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment],
);

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });

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
      <section className="relative min-h-[55vh] flex items-end bg-dark">
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
            <h1 className="font-heading font-bold text-hero text-white leading-[1.05] mb-3">
              {pageApartments?.title}
            </h1>
            {pageApartments?.subtitle && (
              <p className="font-body text-body-lg text-white/70">{pageApartments.subtitle}</p>
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
            locale={locale as Locale}
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
            <BeddyBar locale={locale as Locale} widgetCode={homePage.beddyId} />
          </div>
        </section>
      )}
    </>
  );
}
