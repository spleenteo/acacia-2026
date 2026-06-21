import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexAlternates, localeSlugParams } from '@/i18n/paths';
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

// The blog is legacy EN-only content: post fields are localized but only `en`
// is populated, and the slug only exists in `en`. So every query runs against
// the primary locale (no `locale` arg) — both /en and /it render the EN post.

const metaQuery = graphql(
  `
    query BlogPostMetaQuery($slug: String!) {
      post(filter: { slug: { eq: $slug } }) {
        _seoMetaTags {
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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { slug },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.post?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, `/blog/${slug}`),
  };
}

export const query = graphql(
  `
    query BlogPostQuery($slug: String!) {
      post(filter: { slug: { eq: $slug } }) {
        id
        title
        slug
        abstract
        _firstPublishedAt
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
            ... on CtaFaqRecord {
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
            ... on LandingPageRecord {
              id
              slug
              title
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

  const variables = { slug };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  if (!data.post) notFound();

  // Resolve hierarchical URLs for any FAQ embedded via a `cta_faq` block.
  const faqHrefById = await faqHrefMap(
    locale as Locale,
    isDraftModeEnabled,
    (data.post.content?.blocks ?? []).flatMap((b) =>
      b.__typename === 'CtaFaqRecord' && b.faq ? [b.faq.id] : [],
    ),
  );

  const resolvedProps: BlogPostProps = { locale: locale as Locale, faqHrefById };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={BlogPostContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <BlogPostContent {...resolvedProps} data={data} />;
}
