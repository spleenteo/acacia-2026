import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import ApartmentCard, { ApartmentCardFragment } from '@/components/ApartmentCard';
import MoodCard, { MoodCardFragment } from '@/components/MoodCard';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query HomeMetaQuery($locale: SiteLocale!) {
      homePage(locale: $locale) {
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
    ...toNextMetadata(data.homePage?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', it: '/it' },
    },
  };
}

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
      <section className="relative min-h-[90vh] flex items-end bg-dark">
        {homePage?.ctaImage?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={homePage.ctaImage.responsiveImage}
              className="w-full h-full object-cover opacity-45"
              priority
            />
          </div>
        )}
        {/* gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
        <div className="relative z-10 w-full px-8 pb-20 pt-40">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading font-bold text-hero text-white leading-[1.05] mb-6 max-w-3xl">
              {homePage?.title}
            </h1>
            {homePage?.claim && (
              <p className="font-body text-body-lg text-white/70 max-w-xl mb-10">
                {homePage.claim}
              </p>
            )}
            {homePage?.beddyId && (
              <BeddyBar locale={locale as Locale} widgetCode={homePage.beddyId} />
            )}
          </div>
        </div>
      </section>

      {/* Stay Section */}
      {homePage?.stayText && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage.stayText} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}

      {/* Featured Apartments */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-8">
          {homePage?.promoTitle && (
            <>
              <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
                {locale === 'en' ? 'Our spaces' : 'I nostri spazi'}
              </p>
              <h2 className="font-heading font-bold text-h1 text-dark text-center tracking-[-0.02em] mb-12">
                {homePage.promoTitle}
              </h2>
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {allApartments.map((apartment) => (
              <ApartmentCard key={apartment.id} data={apartment} locale={locale as Locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Moods Section */}
      {homePage?.moods && homePage.moods.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface-alt">
          <div className="mx-auto max-w-6xl px-8">
            {homePage.moodsTitle && (
              <>
                <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium text-center mb-3">
                  {locale === 'en' ? 'Travel inspirations' : 'Ispirazioni di viaggio'}
                </p>
                <h2 className="font-heading font-bold text-h1 text-dark text-center tracking-[-0.02em] mb-12">
                  {homePage.moodsTitle}
                </h2>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {homePage.moods.map((mood) => (
                <MoodCard key={mood.id} data={mood} locale={locale as Locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Do Section */}
      {homePage?.doText && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="mx-auto max-w-3xl px-8 text-center">
            <HtmlContent html={homePage.doText} className="font-body text-body-lg text-dark" />
            <div className="mx-auto mt-8 w-12 h-[3px] bg-rust rounded-sm" />
          </div>
        </section>
      )}
    </>
  );
}
