import { readFragment } from '@/lib/datocms/graphql';
import type { FragmentOf } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import type { LightboxSlide } from './index';

/**
 * Convert a DatoCMS ResponsiveImage fragment to a LightboxSlide.
 * Use this in components that need to pass slides to Lightbox or PhotoLightbox.
 */
export function toSlide(
  data: FragmentOf<typeof ResponsiveImageFragment>,
  caption?: string | null,
): LightboxSlide {
  const img = readFragment(ResponsiveImageFragment, data);
  return {
    src: img.src,
    srcSet: img.srcSet || undefined,
    width: img.width,
    height: img.height,
    alt: img.alt || undefined,
    caption,
  };
}
