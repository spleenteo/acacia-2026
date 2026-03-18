import { type Locale } from '@/i18n/config';
import HtmlContent from '@/components/HtmlContent';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import ImageGallery from '@/components/ImageGallery';
import ApartmentCard from '@/components/ApartmentCard';
import { readFragment } from '@/lib/datocms/graphql';
import type { ResultOf } from 'gql.tada';
import type { query as districtDetailQuery, apartmentsInDistrictQuery } from './page';

export type DistrictDetailProps = {
  locale: Locale;
  apartmentsData: ResultOf<typeof apartmentsInDistrictQuery>;
};
type DistrictDetailData = ResultOf<typeof districtDetailQuery>;

const labels = {
  en: { apartments: 'Apartments in' },
  it: { apartments: 'Alloggi a' },
} as const;

export default function DistrictDetailContent({
  locale,
  apartmentsData,
  data,
}: DistrictDetailProps & { data: DistrictDetailData }) {
  const { district } = data;
  if (!district) return null;

  const { allApartments } = apartmentsData;
  const l = labels[locale];

  return (
    <>
      {/* Hero */}
      <section
        className="min-h-[55vh] flex items-end bg-dark"
        style={{ marginTop: 'calc(var(--header-height) * -1)' }}
      >
        <div className="w-full px-8 pb-14 pt-32">
          <div className="mx-auto max-w-6xl">
            <p className="font-body font-medium text-label text-white/50 uppercase tracking-[0.15em] mb-3">
              {locale === 'en' ? 'Florence' : 'Firenze'}
            </p>
            <h1 className="font-heading font-normal text-hero leading-tight text-white">
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
            <ImageGallery
              items={district.gallery
                .map((g) => readFragment(GalleryImageFragment, g))
                .filter((img) => img.image?.responsiveImage && img.image?.full)
                .map((img) => ({
                  id: img.id,
                  thumb: img.image!.responsiveImage!,
                  full: img.image!.full!,
                  caption: img.description,
                }))}
            />
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
            <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
              {l.apartments} {district.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {allApartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
