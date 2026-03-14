import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import ApartmentCard, { ApartmentCardFragment } from '@/components/ApartmentCard';
import MoodCard, { MoodCardFragment } from '@/components/MoodCard';
import BeddyBar from '@/components/BeddyBar';
import HtmlContent from '@/components/HtmlContent';
import Hero from '@/components/Hero';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
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
      <Hero
        title={homePage?.title ?? ''}
        subtitle={homePage?.claim}
        image={homePage?.ctaImage?.responsiveImage}
        priority
      >
        {homePage?.beddyId && <BeddyBar locale={locale as Locale} widgetCode={homePage.beddyId} />}
      </Hero>

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
              <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
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
                <h2 className="font-heading font-normal text-h1 text-dark text-center tracking-[-0.02em] mb-12">
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
