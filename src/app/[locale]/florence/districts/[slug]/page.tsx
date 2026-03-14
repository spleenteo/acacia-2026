import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query DistrictMetaQuery($locale: SiteLocale!, $slug: String!) {
      districts(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        slug
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { locale: locale as Locale, slug },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.districts?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/florence/districts/${slug}`,
      languages: {
        en: `/en/florence/districts/${slug}`,
        it: `/it/florence/districts/${slug}`,
      },
    },
  };
}

import HtmlContent from '@/components/HtmlContent';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import ImageGallery from '@/components/ImageGallery';
import ApartmentCard, { ApartmentCardFragment } from '@/components/ApartmentCard';

const query = graphql(
  `
    query DistrictDetailQuery($locale: SiteLocale!, $slug: String!) {
      districts(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        abstract(locale: $locale, markdown: true)
        description(locale: $locale, markdown: true)
        gallery {
          ...GalleryImageFragment
        }
      }
    }
  `,
  [GalleryImageFragment],
);

const apartmentsQuery = graphql(
  `
    query DistrictApartmentsQuery($locale: SiteLocale!, $districtId: ItemId!) {
      allApartments(
        locale: $locale
        first: 100
        filter: { district: { eq: $districtId }, published: { eq: true } }
        orderBy: [position_ASC]
      ) {
        id
        ...ApartmentCardFragment
      }
    }
  `,
  [ApartmentCardFragment],
);

const allSlugsQuery = graphql(`
  query AllDistrictSlugs {
    allDistricts {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allDistricts.map((d) => d.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const labels = {
  en: { apartments: 'Apartments in' },
  it: { apartments: 'Alloggi a' },
} as const;

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const [districtData, apartmentsData] = await Promise.all([
    executeQuery(query, {
      variables: { locale: locale as Locale, slug },
      includeDrafts: isDraftModeEnabled,
    }),
    // We need the district id first — fetch it separately
    null,
  ]);

  const { districts: district } = districtData;
  if (!district) notFound();

  const aptData = await executeQuery(apartmentsQuery, {
    variables: { locale: locale as Locale, districtId: district.id },
    includeDrafts: isDraftModeEnabled,
  });

  const { allApartments } = aptData;
  const l = labels[locale as Locale];

  return (
    <>
      {/* Hero */}
      <section className="min-h-[55vh] flex items-end bg-dark">
        <div className="w-full px-8 pb-14 pt-32">
          <div className="mx-auto max-w-6xl">
            <p className="font-body font-medium text-label text-white/50 uppercase tracking-[0.15em] mb-3">
              {locale === 'en' ? 'Florence' : 'Firenze'}
            </p>
            <h1 className="font-heading font-bold text-hero leading-tight text-white">
              {district.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Abstract */}
      {district.abstract && (
        <section className="py-16 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={district.abstract} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Gallery */}
      {district.gallery.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="mx-auto max-w-6xl px-8">
            <ImageGallery data={district.gallery} />
          </div>
        </section>
      )}

      {/* Description */}
      {district.description && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8">
            <HtmlContent
              html={district.description}
              className="font-body text-body-lg text-dark leading-relaxed"
            />
          </div>
        </section>
      )}

      {/* Apartments in this district */}
      {allApartments.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-6xl px-8">
            <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
              {locale === 'en' ? 'Where to stay' : 'Dove alloggiare'}
            </p>
            <h2 className="font-heading font-bold text-h1 text-dark text-center tracking-[-0.02em] mb-12">
              {l.apartments} {district.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {allApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale as Locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
