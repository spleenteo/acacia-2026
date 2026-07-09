import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { indexPageSlug } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { indexPageMetadata } from '@/lib/datocms/indexPageMetadata';
import { PostCardFragment } from '@/components/PostCard/fragment';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import BlogContent, { type BlogProps } from './BlogContent';

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return indexPageMetadata('/blog', params);
}

export const query = graphql(
  `
    query BlogQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        ...IndexPageHeroFragment
      }
      allBlogCategories(locale: $locale, orderBy: [name_ASC], first: 100) {
        id
        name
        slug
      }
      allPosts(
        locale: $locale
        filter: { _status: { eq: published } }
        orderBy: [_firstPublishedAt_DESC]
        first: 100
      ) {
        id
        # Raw per-locale slugs (no fallback) so we can tell whether the post is
        # actually translated in $locale and drop it from the listing if not
        # (its detail page 404s in this locale anyway). The bare slug field is
        # non-nullable, so querying it without a fallback errors the whole query
        # on a null IT slug; _allSlugLocales is the null-safe signal.
        _allSlugLocales {
          locale
          value
        }
        category {
          slug
        }
        ...PostCardFragment
      }
    }
  `,
  [PostCardFragment, IndexPageHeroFragment],
);

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale, slug: indexPageSlug('/blog', locale as Locale) };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: BlogProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={BlogContent}
        resolvedProps={resolvedProps}
        query={query}
        variables={variables}
        initialData={data}
        {...getDraftRealtimeOptions()}
      />
    );
  }

  return <BlogContent {...resolvedProps} data={data} />;
}
