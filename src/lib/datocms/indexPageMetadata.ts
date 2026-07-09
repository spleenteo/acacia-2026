import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { toNextMetadata } from 'react-datocms/seo';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { TagFragment } from '@/lib/datocms/commonFragments';
import type { Locale } from '@/i18n/config';
import { indexAlternates, indexPageSlug } from '@/i18n/paths';

const metaQuery = graphql(
  `
    query IndexPageMetaQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

/**
 * Shared `generateMetadata` body for the index pages backed by an `index_page`
 * record (moods, districts, accommodations, blog, guestbook): SEO meta tags
 * from the record plus canonical/hreflang alternates for the canonical route.
 * Pages whose alternates are per-record (mood, post, FAQ nodes) build their own.
 */
export async function indexPageMetadata(
  canonicalRoute: string,
  params: Promise<{ locale: string }>,
): Promise<Metadata> {
  const { locale } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: {
      locale: locale as Locale,
      slug: indexPageSlug(canonicalRoute, locale as Locale),
    },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.page?._seoMetaTags ?? []),
    alternates: indexAlternates(locale as Locale, canonicalRoute),
  };
}
