import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql, readFragment } from '@/lib/datocms/graphql';
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
      <section className="relative min-h-[50vh] flex items-center justify-center bg-heading">
        {pageApartments?.featuredImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={pageApartments.featuredImage.responsiveImage}
              className="w-full h-full object-cover opacity-50"
              priority
            />
          </div>
        )}
        <div className="relative z-10 text-center text-white px-5 py-20 max-w-3xl mx-auto">
          <h1 className="font-heading font-extralight text-huge mb-4">{pageApartments?.title}</h1>
          {pageApartments?.subtitle && (
            <p className="font-serif italic text-beta text-white/80">{pageApartments.subtitle}</p>
          )}
        </div>
      </section>

      {/* Intro */}
      {pageApartments?.intro && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <HtmlContent
              html={pageApartments.intro}
              className="font-serif text-delta text-heading"
            />
          </div>
        </section>
      )}

      {/* Apartments Grid with Filter */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
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
        <section className="py-12 bg-cream">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="font-serif italic text-delta text-heading mb-6">
              {locale === 'en' ? 'Search availability' : 'Cerca disponibilità'}
            </p>
            <BeddyBar locale={locale as Locale} widgetCode={homePage.beddyId} />
          </div>
        </section>
      )}
    </>
  );
}
