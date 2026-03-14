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
    query ApartmentMetaQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
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
  const path = `/${locale}/florence/accommodations/${slug}`;
  return {
    ...toNextMetadata(data.apartment?._seoMetaTags ?? []),
    alternates: {
      canonical: path,
      languages: {
        en: `/en/florence/accommodations/${slug}`,
        it: `/it/florence/accommodations/${slug}`,
      },
    },
  };
}

import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import HtmlContent from '@/components/HtmlContent';
import BeddyBar from '@/components/BeddyBar';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import ImageGallery from '@/components/ImageGallery';
import CuddlesList, { CuddleFragment } from '@/components/CuddlesList';
import UpsList, { UpFragment } from '@/components/UpsList';
import InfoDetail, { InfoTextFragment, InfoAddressFragment } from '@/components/InfoDetail';
import DistrictLink from '@/components/DistrictLink';

const query = graphql(
  `
    query ApartmentDetailQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        highlight(locale: $locale)
        bedrooms
        bathrooms
        sleeps
        beddyId
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        category {
          name(locale: $locale)
        }
        district {
          name
          slug
        }
        gallery {
          ...GalleryImageFragment
        }
        cuddles {
          ...CuddleFragment
        }
        ups {
          ...UpFragment
        }
        infoDetail(locale: $locale) {
          __typename
          ... on InfoTextRecord {
            ...InfoTextFragment
          }
          ... on InfoAddressRecord {
            ...InfoAddressFragment
          }
        }
      }
    }
  `,
  [
    ResponsiveImageFragment,
    GalleryImageFragment,
    CuddleFragment,
    UpFragment,
    InfoTextFragment,
    InfoAddressFragment,
  ],
);

const allSlugsQuery = graphql(`
  query AllApartmentSlugs {
    allApartments(first: 100, filter: { published: { eq: true } }) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allApartments.map((a) => a.slug);

  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const labels = {
  en: {
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    sleeps: 'Sleeps',
    cuddles: 'Amenities & Cuddles',
    ups: 'Lifestyle',
    info: 'Details',
    book: 'Book this apartment',
  },
  it: {
    bedrooms: 'Camere',
    bathrooms: 'Bagni',
    sleeps: 'Ospiti',
    cuddles: 'Comfort & Coccole',
    ups: 'Lifestyle',
    info: 'Dettagli',
    book: 'Prenota questo alloggio',
  },
} as const;

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale, slug },
    includeDrafts: isDraftModeEnabled,
  });

  const { apartment } = data;
  if (!apartment) notFound();

  const l = labels[locale as Locale];

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[70vh] flex items-end bg-dark"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        {apartment.featuredImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={apartment.featuredImage.responsiveImage}
              className="w-full h-full object-cover opacity-55"
              priority
            />
          </div>
        )}
        <div className="relative z-10 w-full px-8 pb-14 pt-32">
          <div className="mx-auto max-w-6xl">
            {apartment.category && (
              <p className="font-body font-medium text-label text-white/60 uppercase tracking-[0.15em] mb-3">
                {apartment.category.name}
              </p>
            )}
            <h1 className="font-heading font-normal text-hero leading-tight text-white mb-3">
              {apartment.name}
            </h1>
            {apartment.claim && (
              <p className="font-body text-[1.125rem] md:text-[1.25rem] text-white/80 max-w-2xl leading-relaxed">
                {apartment.claim}
              </p>
            )}
            {apartment.highlight && (
              <span className="inline-block bg-rust/80 text-white text-tag uppercase font-medium tracking-wider px-3 py-1 mt-4 rounded-pill">
                {apartment.highlight}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      {(apartment.bedrooms || apartment.bathrooms || apartment.sleeps) && (
        <section className="bg-surface-alt border-b border-border">
          <div className="mx-auto max-w-6xl px-8 py-8 flex flex-wrap justify-center gap-10 sm:gap-20">
            {apartment.bedrooms && (
              <div className="text-center">
                <p className="font-heading font-normal text-h1 text-rust leading-none">
                  {apartment.bedrooms}
                </p>
                <p className="font-body text-label uppercase tracking-[0.12em] text-muted mt-1">
                  {l.bedrooms}
                </p>
              </div>
            )}
            {apartment.bathrooms && (
              <div className="text-center">
                <p className="font-heading font-normal text-h1 text-rust leading-none">
                  {apartment.bathrooms}
                </p>
                <p className="font-body text-label uppercase tracking-[0.12em] text-muted mt-1">
                  {l.bathrooms}
                </p>
              </div>
            )}
            {apartment.sleeps && (
              <div className="text-center">
                <p className="font-heading font-normal text-h1 text-rust leading-none">
                  {apartment.sleeps}
                </p>
                <p className="font-body text-label uppercase tracking-[0.12em] text-muted mt-1">
                  {l.sleeps}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Description */}
      {apartment.description && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-3xl px-8">
            <HtmlContent
              html={apartment.description}
              className="font-body text-body-lg text-dark leading-relaxed"
            />
          </div>
        </section>
      )}

      {/* Gallery */}
      {apartment.gallery.length > 0 && (
        <section className="py-16 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-8">
            <ImageGallery data={apartment.gallery} />
          </div>
        </section>
      )}

      {/* Cuddles & Ups */}
      {(apartment.cuddles.length > 0 || apartment.ups.length > 0) && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-5xl px-8 grid grid-cols-1 md:grid-cols-2 gap-14">
            <CuddlesList data={apartment.cuddles} title={l.cuddles} />
            <UpsList data={apartment.ups} title={l.ups} />
          </div>
        </section>
      )}

      {/* Info Detail */}
      {apartment.infoDetail.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8">
            <InfoDetail
              data={apartment.infoDetail.map((item) => ({
                __typename: item.__typename as 'InfoTextRecord' | 'InfoAddressRecord',
                fragment: item as never,
              }))}
              title={l.info}
            />
          </div>
        </section>
      )}

      {/* District Link */}
      {apartment.district && (
        <section>
          <DistrictLink
            name={apartment.district.name}
            slug={apartment.district.slug}
            locale={locale as Locale}
          />
        </section>
      )}

      {/* Beddy Booking */}
      {apartment.beddyId && (
        <section className="py-16 bg-dark">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <p className="font-body text-body-lg text-white/70 mb-8">{l.book}</p>
            <BeddyBar locale={locale as Locale} widgetCode={apartment.beddyId} />
          </div>
        </section>
      )}
    </>
  );
}
