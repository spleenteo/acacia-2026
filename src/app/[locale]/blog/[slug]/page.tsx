import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql, readFragment } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { localeSlugParams, localizedSlugPaths, xDefault } from '@/i18n/paths';
import { absoluteUrl, detailBreadcrumbJsonLd } from '@/lib/seo/jsonLd';
import JsonLd from '@/components/JsonLd';
import { stripStega } from 'react-datocms/stega';
import { SetAlternateLocalePaths } from '@/components/LocaleSwitcher/AlternateLocaleContext';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import {
  ImageBlockFragment,
  ImageGalleryBlockFragment,
  VideoBlockFragment,
  CtaBlogPostFragment,
  CtaFaqFragment,
  ButtonBlockFragment,
} from '@/components/StructuredText/blocksFragment';
import { faqHrefMap } from '@/lib/faq/faqTree';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import BlogPostContent, { type BlogPostProps } from './BlogPostContent';

// Magazine posts are localized per-locale (content + slug). Every query is
// locale-scoped, so a post with no translation in the requested locale isn't
// found → the page 404s (no English fallback served under the other locale).

const metaQuery = graphql(
  `
    query BlogPostMetaQuery($locale: SiteLocale!, $slug: String!) {
      post(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        _allSlugLocales {
          locale
          value
        }
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
  // Post slugs are localized → build hreflang from the record's real per-locale
  // slugs, advertising only the locales that actually have a translation.
  const postPaths = localizedSlugPaths(data.post?._allSlugLocales ?? [], 'blog', 'hreflang');
  return {
    ...toNextMetadata(data.post?._seoMetaTags ?? []),
    alternates: {
      canonical: postPaths[locale],
      languages: { ...postPaths, ...xDefault(postPaths) },
    },
  };
}

export const query = graphql(
  `
    query BlogPostQuery($locale: SiteLocale!, $slug: String!) {
      post(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        title
        slug
        _allSlugLocales {
          locale
          value
        }
        abstract
        _firstPublishedAt
        _updatedAt
        category {
          name
        }
        featuredImage {
          responsiveImage(imgixParams: { w: 1600, h: 900, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        content {
          value
          blocks {
            __typename
            # Unmasked faq id (for the cta_faq block) so the page can resolve
            # the FAQ URLs from the tree before rendering.
            ... on CtaFaqBlockRecord {
              faq {
                id
              }
            }
            ...ImageBlockFields
            ...ImageGalleryBlockFields
            ...VideoBlockFields
            ...CtaBlogPostFields
            ...CtaFaqFields
            ...ButtonBlockFields
          }
          links {
            __typename
            # Every linked record exposes its id via RecordInterface, so the
            # Structured Text renderer always finds the itemLink target.
            ... on RecordInterface {
              id
            }
            ... on ApartmentRecord {
              id
              slug
              name
            }
            ... on DistrictRecord {
              id
              slug
              name
            }
            ... on MoodRecord {
              id
              slug
              name
            }
          }
        }
      }
    }
  `,
  [
    ResponsiveImageFragment,
    ImageBlockFragment,
    ImageGalleryBlockFragment,
    VideoBlockFragment,
    CtaBlogPostFragment,
    CtaFaqFragment,
    ButtonBlockFragment,
  ],
);

const allSlugsQuery = graphql(`
  query AllPostSlugs {
    allPosts(first: 100) {
      slug
    }
  }
`);

export async function generateStaticParams() {
  const data = await executeQuery(allSlugsQuery);
  const slugs = data.allPosts.map((p) => p.slug).filter((s): s is string => Boolean(s));
  return localeSlugParams(slugs);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  if (!data.post) notFound();

  // --- Structured data: BlogPosting + BreadcrumbList ---
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const postUrl = absoluteUrl(locale as Locale, `/blog/${data.post.slug}`);
  const postImage = data.post.featuredImage?.responsiveImage
    ? readFragment(ResponsiveImageFragment, data.post.featuredImage.responsiveImage).src
    : undefined;
  const blogPostingLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    headline: stripStega(data.post.title ?? ''),
    url: postUrl,
    mainEntityOfPage: postUrl,
    inLanguage: locale,
    datePublished: data.post._firstPublishedAt,
    dateModified: data.post._updatedAt,
    // The post model has no author field — the brand is the author/publisher.
    author: { '@type': 'Organization', name: 'Acacia Firenze', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'Acacia Firenze',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/acacia-isologo.svg` },
    },
  };
  if (data.post.abstract) blogPostingLd.description = stripStega(data.post.abstract);
  if (postImage) blogPostingLd.image = postImage;
  if (data.post.category?.name) {
    blogPostingLd.articleSection = stripStega(data.post.category.name);
  }

  const breadcrumbLd = detailBreadcrumbJsonLd({
    locale: locale as Locale,
    sectionPath: '/blog',
    path: `/blog/${data.post.slug}`,
    name: stripStega(data.post.title ?? ''),
  });

  // Resolve hierarchical URLs for any FAQ embedded via a `cta_faq` block.
  const faqHrefById = await faqHrefMap(
    locale as Locale,
    isDraftModeEnabled,
    (data.post.content?.blocks ?? []).flatMap((b) =>
      b.__typename === 'CtaFaqBlockRecord' && b.faq ? [b.faq.id] : [],
    ),
  );

  const resolvedProps: BlogPostProps = { locale: locale as Locale, faqHrefById };

  // Per-locale URLs for the language switcher: the translated post where it
  // exists, otherwise the Magazine index (no English post under the other URL).
  const altPaths = localizedSlugPaths(data.post._allSlugLocales ?? [], 'blog', 'switcher');

  if (isDraftModeEnabled) {
    return (
      <>
        <JsonLd data={blogPostingLd} />
        <JsonLd data={breadcrumbLd} />
        <SetAlternateLocalePaths paths={altPaths} />
        <RealtimeWrapper
          contentComponent={BlogPostContent}
          resolvedProps={resolvedProps}
          query={query}
          variables={variables}
          initialData={data}
          {...getDraftRealtimeOptions()}
        />
      </>
    );
  }

  return (
    <>
      <JsonLd data={blogPostingLd} />
      <JsonLd data={breadcrumbLd} />
      <SetAlternateLocalePaths paths={altPaths} />
      <BlogPostContent {...resolvedProps} data={data} />
    </>
  );
}
