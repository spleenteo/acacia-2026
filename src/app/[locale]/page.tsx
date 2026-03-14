import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import ApartmentCard, { ApartmentCardFragment } from '@/components/ApartmentCard';
import MoodCard, { MoodCardFragment } from '@/components/MoodCard';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';

const query = graphql(
  `
    query HomeQuery($locale: SiteLocale!) {
      homePage(locale: $locale) {
        title(locale: $locale)
        claim(locale: $locale)
        beddyId
        ctaText(locale: $locale, markdown: true)
        ctaLabel(locale: $locale)
        ctaImage {
          responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        moodsTitle(locale: $locale)
        moods {
          id
          ...MoodCardFragment
        }
        promoTitle(locale: $locale)
        stayText(locale: $locale, markdown: true)
        doText(locale: $locale, markdown: true)
      }
      allApartments(locale: $locale, first: 100, filter: { published: { eq: true } }) {
        id
        ...ApartmentCardFragment
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment, MoodCardFragment],
);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const data = await executeQuery(query, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });

  const { homePage, allApartments } = data;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-heading">
        {homePage?.ctaImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={homePage.ctaImage.responsiveImage}
              className="w-full h-full object-cover opacity-60"
              priority
            />
          </div>
        )}
        <div className="relative z-10 text-center text-white px-5 py-20 max-w-3xl mx-auto">
          <h1 className="font-heading font-extralight text-huge mb-6">{homePage?.title}</h1>
          {homePage?.claim && <p className="font-serif italic text-beta mb-8">{homePage.claim}</p>}
          {homePage?.beddyId && (
            <div className="mt-8">
              <BeddyBar locale={locale as Locale} widgetCode={homePage.beddyId} />
            </div>
          )}
        </div>
      </section>

      {/* Stay Section */}
      {homePage?.stayText && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <HtmlContent html={homePage.stayText} className="font-serif text-delta text-heading" />
          </div>
        </section>
      )}

      {/* Featured Apartments */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          {homePage?.promoTitle && (
            <h2 className="font-heading font-extralight text-alpha text-center mb-12">
              {homePage.promoTitle}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allApartments.map((apartment) => (
              <ApartmentCard key={apartment.id} data={apartment} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Moods Section */}
      {homePage?.moods && homePage.moods.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-7xl px-5">
            {homePage.moodsTitle && (
              <h2 className="font-heading font-extralight text-alpha text-center mb-12">
                {homePage.moodsTitle}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homePage.moods.map((mood) => (
                <MoodCard key={mood.id} data={mood} locale={locale as Locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Do Section */}
      {homePage?.doText && (
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <HtmlContent html={homePage.doText} className="font-serif text-delta text-heading" />
          </div>
        </section>
      )}
    </>
  );
}
