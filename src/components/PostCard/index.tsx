import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import Link from 'next/link';

/**
 * Blog post card — portrait 3:4 image, serif title shifting to primary on hover,
 * optional abstract. Posts are single-language (no localized fields), so the
 * fragment takes no `$locale`. Used for FAQ "related posts".
 */
export const PostCardFragment = graphql(
  `
    fragment PostCardFragment on PostRecord {
      id
      title
      slug
      abstract
      featuredImage {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

type Props = {
  data: FragmentOf<typeof PostCardFragment>;
  locale: Locale;
};

export default function PostCard({ data, locale }: Props) {
  const post = readFragment(PostCardFragment, data);

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
          <h3 className="font-heading text-h4 font-normal leading-snug text-dark transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h3>
          {post.abstract && (
            <p className="mt-2 line-clamp-2 font-body text-caption text-muted">{post.abstract}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
