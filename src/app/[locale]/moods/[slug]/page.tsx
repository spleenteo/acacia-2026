import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import HtmlContent from '@/components/HtmlContent';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ApartmentCard, { ApartmentCardFragment } from '@/components/ApartmentCard';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';

const metaQuery = graphql(
  `
    query MoodMetaQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug }, published: { eq: true } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        slug(locale: $locale)
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
    ...toNextMetadata(data.mood?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/moods/${slug}`,
      languages: { en: `/en/moods/${slug}`, it: `/it/moods/${slug}` },
    },
  };
}

const query = graphql(
  `
    query MoodDetailQuery($locale: SiteLocale!, $slug: String!) {
      mood(locale: $locale, filter: { slug: { eq: $slug }, published: { eq: true } }) {
        id
        name(locale: $locale)
        slug(locale: $locale)
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        image {
          responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        boxes {
          id
          object {
            ... on ApartmentRecord {
              __typename
              id
              ...ApartmentCardFragment
            }
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment, ApartmentCardFragment],
);

const allSlugsQuery = graphql(`
  query AllMoodSlugs {
    allMoods(filter: { published: { eq: true } }) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allMoods.map((m) => m.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const labels = {
  en: { apartments: 'Apartments for this mood' },
  it: { apartments: 'Alloggi per questo mood' },
} as const;

export default async function MoodDetailPage({
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

  const { mood } = data;
  if (!mood) notFound();

  // Extract apartments from the polymorphic boxes → object union
  const apartments = mood.boxes.flatMap((box) =>
    box.object.filter((item) => item.__typename === 'ApartmentRecord'),
  );

  const l = labels[locale as Locale];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end bg-heading overflow-hidden">
        {mood.image?.responsiveImage && (
          <div className="absolute inset-0">
            <ResponsiveImage
              data={mood.image.responsiveImage}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        )}
        <div className="relative z-10 w-full px-5 pb-12 pt-32">
          <div className="mx-auto max-w-7xl">
            <h1 className="font-heading font-extralight text-huge text-white">{mood.name}</h1>
          </div>
        </div>
      </section>

      {/* Claim */}
      {mood.claim && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="font-serif italic text-delta text-heading">{mood.claim}</p>
          </div>
        </section>
      )}

      {/* Description */}
      {mood.description && (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-5">
            <HtmlContent
              html={mood.description}
              className="font-serif text-delta text-heading leading-relaxed"
            />
          </div>
        </section>
      )}

      {/* Apartments for this mood */}
      {apartments.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="font-heading font-extralight text-alpha text-center mb-12">
              {l.apartments}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <ApartmentCard key={apartment.id} data={apartment} locale={locale as Locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
