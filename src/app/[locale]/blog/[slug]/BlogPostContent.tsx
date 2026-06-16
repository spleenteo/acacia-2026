'use client';

import { type ComponentProps } from 'react';
import { StructuredText } from 'react-datocms/structured-text';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import EditorialHero from '@/components/EditorialHero';
import { makeStructuredTextBlockRenderer } from '@/components/StructuredText/StructuredTextBlocks';
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type BlogPostProps = {
  locale: Locale;
  /** Resolved full FAQ URLs keyed by record id (for embedded `cta_faq` blocks). */
  faqHrefById: Record<string, string>;
};
type BlogPostData = ResultOf<typeof query>;

/** A record referenced inline from the post body (itemLink / inlineItem). */
type LinkedRecord =
  | { __typename: 'ApartmentRecord'; id: string; slug: string; name: string }
  | { __typename: 'DistrictRecord'; id: string; slug: string; name: string }
  | { __typename: 'MoodRecord'; id: string; slug: string; name: string }
  | { __typename: 'PageRecord'; id: string; slug: string; title: string };

function hrefFor(record: LinkedRecord, locale: Locale): string {
  switch (record.__typename) {
    case 'ApartmentRecord':
      return modelPath('apartment', record.slug, locale) ?? '#';
    case 'DistrictRecord':
      return modelPath('district', record.slug, locale) ?? '#';
    case 'MoodRecord':
      return modelPath('mood', record.slug, locale) ?? '#';
    case 'PageRecord':
      return modelPath('page', record.slug, locale) ?? '#';
    default:
      return '#';
  }
}

function labelFor(record: LinkedRecord): string {
  return 'name' in record ? record.name : record.title;
}

export default function BlogPostContent({
  locale,
  faqHrefById,
  data,
}: BlogPostProps & { data: BlogPostData }) {
  const post = data.post;
  if (!post) return null;

  return (
    <>
      <EditorialHero
        tone="sage"
        label={post.category?.name}
        title={post.title ?? ''}
        subtitle={post.abstract}
        image={post.featuredImage?.responsiveImage}
        priority
      />

      {/* Tucks under the hero diagonal on mobile; desktop overlap via the layout. */}
      <article className="relative z-0 -mt-8 lg:mt-0">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-12 md:pt-16 lg:pb-28">
          {post.content?.value ? (
            <div className="prose prose-acacia font-body text-body-lg">
              <StructuredText
                // gql.tada masks the union blocks (ids live inside each block
                // fragment), so cast to the renderer's data type — runtime data
                // carries the ids.
                data={post.content as unknown as ComponentProps<typeof StructuredText>['data']}
                renderBlock={makeStructuredTextBlockRenderer(locale, faqHrefById)}
                renderLinkToRecord={({ record, children, transformedMeta }) => {
                  const href = hrefFor(record as unknown as LinkedRecord, locale);
                  if (href === '#') return <>{children}</>;
                  return (
                    <a {...transformedMeta} href={href}>
                      {children}
                    </a>
                  );
                }}
                renderInlineRecord={({ record }) => {
                  const r = record as unknown as LinkedRecord;
                  const label = labelFor(r);
                  if (!label) return null;
                  const href = hrefFor(r, locale);
                  return href === '#' ? <span>{label}</span> : <a href={href}>{label}</a>;
                }}
              />
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
