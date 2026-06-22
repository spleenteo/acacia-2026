'use client';

import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import StructuredTextContent from '@/components/StructuredTextContent';
import ReadMore from '@/components/ReadMore';
import PostCard from '@/components/PostCard';
import CategoryFilter from '@/components/CategoryFilter';
import { toHeroTone } from '@/lib/heroTone';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type BlogProps = { locale: Locale };
type BlogData = ResultOf<typeof query>;

export default function BlogContent({ locale, data }: BlogProps & { data: BlogData }) {
  const t = useTranslations('blog');
  const tListing = useTranslations('listing');
  const { page, allBlogCategories, allPosts } = data;

  // Magazine posts are localized per-locale: exclude any post with no
  // translation in the current locale (null `localeSlug`), so the IT index never
  // lists English-only posts — their detail page 404s in this locale anyway.
  const localizedPosts = allPosts.filter((post) => post.localeSlug);

  const posts = localizedPosts.map((post) => ({
    id: post.id,
    categorySlug: post.category.slug,
    node: <PostCard data={post} locale={locale} />,
  }));

  // Surface only categories that actually have a post in this locale's listing.
  const presentCategorySlugs = new Set(localizedPosts.map((post) => post.category.slug));
  const categories = allBlogCategories
    .filter((cat) => presentCategorySlugs.has(cat.slug))
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    }));

  const description = page?.description?.value ? (
    <StructuredTextContent data={page.description} className="font-body text-body-sm text-muted" />
  ) : null;

  return (
    <>
      {/* Hero — driven by the single-instance `hero` block. */}
      <EditorialHero
        tone={toHeroTone(page?.hero.color)}
        label={t('label')}
        title={page?.hero.title ?? ''}
        subtitle={page?.hero.subtitle}
        image={page?.hero.featuredImage?.responsiveImage}
        priority
      />

      {/* Content scrolls BEHIND the hero — on mobile it tucks up under the
          hero's diagonal (negative margin) so there's no white band. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {/* Editorial rail (description) + posts grid */}
        <EditorialListingLayout
          kicker={t('label')}
          body={description && <ReadMore desktopExpanded>{description}</ReadMore>}
        >
          <CategoryFilter
            categories={categories}
            items={posts}
            allLabel={tListing('allFilter')}
            emptyLabel={t('noPosts')}
          />
        </EditorialListingLayout>
      </div>
    </>
  );
}
