import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { dastToText } from '@/lib/faq/dastText';
import Link from 'next/link';

/**
 * Blog post card — portrait 3:4 image, category kicker, serif title shifting to
 * primary on hover, and a short excerpt. Post fields are localized but the blog
 * is legacy EN-only content, so localized fields fall back to `en` (otherwise a
 * null IT slug would break the non-nullable query). The teaser is the `abstract`
 * field, falling back to an excerpt of the `content` Structured Text when empty.
 */
export const PostCardFragment = graphql(
  `
    fragment PostCardFragment on PostRecord {
      id
      title(fallbackLocales: [en])
      slug(fallbackLocales: [en])
      abstract(fallbackLocales: [en])
      category {
        name
      }
      featuredImage {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
      content(fallbackLocales: [en]) {
        value
      }
    }
  `,
  [ResponsiveImageFragment],
);

type Props = {
  data: FragmentOf<typeof PostCardFragment>;
  locale: Locale;
};

/** Trim a plain-text excerpt to a word boundary near `max` chars. */
function excerpt(text: string, max = 150): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export default function PostCard({ data, locale }: Props) {
  const post = readFragment(PostCardFragment, data);
  // Prefer the editorial `abstract`; fall back to a content excerpt when empty.
  const teaser = post.abstract?.trim() ? post.abstract : excerpt(dastToText(post.content?.value));

  return (
    <Link href={modelPath('post', post.slug, locale)!} className="group block">
      <article>
        {/* Image — portrait 3:4 */}
        <div
          className="overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
          style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
        >
          {post.featuredImage?.responsiveImage && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={post.featuredImage.responsiveImage} />
            </div>
          )}
        </div>

        <div className="pt-4">
          {post.category?.name && (
            <p className="font-body text-label uppercase tracking-[0.18em] text-muted font-medium mb-2">
              {post.category.name}
            </p>
          )}
          <h3 className="font-heading text-h3 font-normal leading-snug text-dark transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h3>
          {teaser && (
            <p className="mt-2 line-clamp-3 font-body text-body-sm text-muted leading-relaxed">
              {teaser}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
