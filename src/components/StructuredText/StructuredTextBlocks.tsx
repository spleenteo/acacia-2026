import Link from 'next/link';
import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import RelatedFaqCard from '@/components/RelatedFaqCard';
import {
  CtaBlogPostFragment,
  CtaFaqFragment,
  ImageBlockFragment,
  ImageGalleryBlockFragment,
  VideoBlockFragment,
} from './blocksFragment';

/**
 * Shared `renderBlock` factory for structured-text fields that embed blocks.
 * Server-safe (no hooks / 'use client'), so it works in both server and client
 * `<StructuredText>` renderers. Takes the current locale (needed to resolve the
 * blog-post CTA link + its label) and handles the shared block models:
 * `image_block`, `image_gallery_block`, `video_block` (external `embedded_video`),
 * `cta_blog_post`, and `cta_faq` (coloured FAQ card).
 *
 * `faqHrefById` maps an embedded FAQ record id to its hierarchical URL (the
 * caller resolves it from the FAQ tree, since a record doesn't know its
 * ancestor chain); pass `{}` when the field can't contain a `cta_faq` block.
 */
export function makeStructuredTextBlockRenderer(
  locale: Locale,
  faqHrefById: Record<string, string> = {},
) {
  return function renderStructuredTextBlock({ record }: { record: { __typename: string } }) {
    switch (record.__typename) {
      case 'ImageBlockRecord': {
        const block = readFragment(
          ImageBlockFragment,
          record as unknown as FragmentOf<typeof ImageBlockFragment>,
        );
        const image = block.asset.responsiveImage;
        if (!image) return null;
        return (
          <figure className="my-8 overflow-hidden rounded-card sm:mx-auto sm:my-10 sm:max-w-md">
            <ResponsiveImage data={image} />
          </figure>
        );
      }

      case 'ImageGalleryBlockRecord': {
        const block = readFragment(
          ImageGalleryBlockFragment,
          record as unknown as FragmentOf<typeof ImageGalleryBlockFragment>,
        );
        const images = block.assets.map((a) => a.responsiveImage).filter(Boolean);
        if (images.length === 0) return null;
        return (
          <div className="my-8 grid gap-3 sm:mx-auto sm:my-10 sm:max-w-2xl sm:grid-cols-2">
            {images.map((image, i) => (
              <div key={i} className="overflow-hidden rounded-card">
                <ResponsiveImage data={image!} />
              </div>
            ))}
          </div>
        );
      }

      case 'VideoBlockRecord': {
        const block = readFragment(
          VideoBlockFragment,
          record as unknown as FragmentOf<typeof VideoBlockFragment>,
        );
        return <VideoEmbed video={block.embeddedVideo} />;
      }

      case 'CtaBlogPostRecord': {
        const block = readFragment(
          CtaBlogPostFragment,
          record as unknown as FragmentOf<typeof CtaBlogPostFragment>,
        );
        return <CtaBlogPost post={block.post} locale={locale} />;
      }

      case 'CtaFaqRecord': {
        const block = readFragment(
          CtaFaqFragment,
          record as unknown as FragmentOf<typeof CtaFaqFragment>,
        );
        if (!block.faq) return null;
        return <RelatedFaqCard data={block.faq} href={faqHrefById[block.faq.id] ?? '#'} />;
      }

      // ButtonBlockRecord: link resolution not wired yet → renders nothing.
      default:
        return null;
    }
  };
}

/** Responsive embed for an external (YouTube / Vimeo) DatoCMS video field. */
function VideoEmbed({
  video,
}: {
  video: {
    url: string;
    provider: string;
    providerUid: string;
    title: string;
    width: number;
    height: number;
  };
}) {
  // Build the provider embed URL from provider + uid (the field `url` is the
  // watch page, not an embeddable URL). Fall back to the raw url otherwise.
  const src =
    video.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${video.providerUid}`
      : video.provider === 'vimeo'
        ? `https://player.vimeo.com/video/${video.providerUid}`
        : video.url;

  const ratio = video.width && video.height ? video.width / video.height : 16 / 9;

  return (
    <figure className="my-8 overflow-hidden rounded-card bg-dark sm:mx-auto sm:my-10 sm:max-w-lg">
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <iframe
          src={src}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </figure>
  );
}

/** Compact "read this on the blog" card: lateral featured image + title +
 *  abstract + a small primary pill linking to the post. */
function CtaBlogPost({
  post,
  locale,
}: {
  post: {
    title: string;
    slug: string;
    abstract: string | null;
    featuredImage: { responsiveImage: FragmentOf<typeof ResponsiveImageFragment> | null };
  };
  locale: Locale;
}) {
  const href = modelPath('post', post.slug, locale) ?? '#';
  const label = locale === 'it' ? 'Leggi tutto' : 'Read more';
  const kicker = locale === 'it' ? 'Dal blog' : 'From the blog';
  const image = post.featuredImage?.responsiveImage;

  return (
    <aside className="my-8 flex flex-col overflow-hidden rounded-card border border-border bg-surface-alt sm:flex-row sm:items-center sm:gap-5">
      {image && (
        <Link href={href} className="block shrink-0 overflow-hidden sm:w-44">
          <ResponsiveImage data={image} />
        </Link>
      )}
      <div className="flex min-w-0 flex-col items-start gap-2 p-5">
        <p className="font-body text-label font-medium uppercase tracking-[0.18em] text-primary">
          {kicker}
        </p>
        <h4 className="font-heading text-h4 font-normal leading-snug text-dark">{post.title}</h4>
        {post.abstract && (
          <p className="line-clamp-2 font-body text-body-sm text-muted">{post.abstract}</p>
        )}
        <Link
          href={href}
          className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 font-body text-caption font-medium tracking-[0.06em] text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          {label}
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </aside>
  );
}
