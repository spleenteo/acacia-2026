'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { useTranslations } from 'next-intl';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { dastToText } from '@/lib/faq/dastText';
import { PostCardFragment } from './fragment';
import Link from 'next/link';

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

/**
 * Blog post card — stacked in reading order: category kicker, serif title,
 * optional horizontal featured image (cropped on its focal point), abstract
 * subtitle, and a "read more" affordance. The whole card links to the post.
 */
export default function PostCard({ data, locale }: Props) {
  const t = useTranslations('listing');
  const post = readFragment(PostCardFragment, data);
  // Prefer the editorial `abstract`; fall back to a content excerpt when empty.
  const subtitle = post.abstract?.trim() ? post.abstract : excerpt(dastToText(post.content?.value));
  const image = post.featuredImage?.responsiveImage;

  return (
    <Link href={modelPath('post', post.slug, locale)!} className="group block">
      <article>
        {post.category?.name && (
          <p className="font-body text-label uppercase tracking-[0.18em] text-muted font-medium mb-2">
            {post.category.name}
          </p>
        )}

        <h3 className="font-heading text-h3 font-normal leading-snug text-dark transition-colors duration-300 group-hover:text-primary">
          {post.title}
        </h3>

        {/* Featured image — optional, horizontal 16:9 crop on the focal point. */}
        {image && (
          <div
            className="mt-4 overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
            style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
          >
            <div
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={image} />
            </div>
          </div>
        )}

        {subtitle && (
          <p className="mt-4 line-clamp-3 font-body text-body-sm text-muted leading-relaxed">
            {subtitle}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1 font-body text-label uppercase tracking-[0.18em] text-primary font-medium">
          {t('readMore')}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </article>
    </Link>
  );
}
