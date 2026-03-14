import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
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
      <section className="relative min-h-[60vh] flex items-end bg-heading">
        {apartment.featuredImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={apartment.featuredImage.responsiveImage}
              className="w-full h-full object-cover opacity-60"
              priority
            />
          </div>
        )}
        <div className="relative z-10 w-full px-5 pb-12 pt-32">
          <div className="mx-auto max-w-7xl">
            {apartment.category && (
              <p className="font-bold text-small text-white/70 uppercase tracking-wider mb-2">
                {apartment.category.name}
              </p>
            )}
            <h1 className="font-heading font-extralight text-huge text-white mb-3">
              {apartment.name}
            </h1>
            {apartment.claim && (
              <p className="font-serif italic text-beta text-white/80 max-w-2xl">
                {apartment.claim}
              </p>
            )}
            {apartment.highlight && (
              <span className="inline-block bg-secondary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm mt-4">
                {apartment.highlight}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      {(apartment.bedrooms || apartment.bathrooms || apartment.sleeps) && (
        <section className="bg-cream border-b border-beige">
          <div className="mx-auto max-w-7xl px-5 py-6 flex flex-wrap justify-center gap-8 sm:gap-16">
            {apartment.bedrooms && (
              <div className="text-center">
                <p className="font-heading font-extralight text-alpha text-heading">
                  {apartment.bedrooms}
                </p>
                <p className="text-milli uppercase tracking-wider font-bold text-body-light">
                  {l.bedrooms}
                </p>
              </div>
            )}
            {apartment.bathrooms && (
              <div className="text-center">
                <p className="font-heading font-extralight text-alpha text-heading">
                  {apartment.bathrooms}
                </p>
                <p className="text-milli uppercase tracking-wider font-bold text-body-light">
                  {l.bathrooms}
                </p>
              </div>
            )}
            {apartment.sleeps && (
              <div className="text-center">
                <p className="font-heading font-extralight text-alpha text-heading">
                  {apartment.sleeps}
                </p>
                <p className="text-milli uppercase tracking-wider font-bold text-body-light">
                  {l.sleeps}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Description */}
      {apartment.description && (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-5">
            <HtmlContent html={apartment.description} className="font-serif text-delta text-heading leading-relaxed" />
          </div>
        </section>
      )}

      {/* Gallery */}
      {apartment.gallery.length > 0 && (
        <section className="py-12 bg-cream">
          <div className="mx-auto max-w-7xl px-5">
            <ImageGallery data={apartment.gallery} />
          </div>
        </section>
      )}

      {/* Cuddles & Ups */}
      {(apartment.cuddles.length > 0 || apartment.ups.length > 0) && (
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-5 grid grid-cols-1 md:grid-cols-2 gap-12">
            <CuddlesList data={apartment.cuddles} title={l.cuddles} />
            <UpsList data={apartment.ups} title={l.ups} />
          </div>
        </section>
      )}

      {/* Info Detail */}
      {apartment.infoDetail.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-3xl px-5">
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
        <section className="py-8">
          <DistrictLink
            name={apartment.district.name}
            slug={apartment.district.slug}
            locale={locale as Locale}
          />
        </section>
      )}

      {/* Beddy Booking */}
      {apartment.beddyId && (
        <section className="py-12 bg-heading">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="font-serif italic text-delta text-white/80 mb-6">{l.book}</p>
            <BeddyBar locale={locale as Locale} widgetCode={apartment.beddyId} />
          </div>
        </section>
      )}
    </>
  );
}
