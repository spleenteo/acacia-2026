import type { Locale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import type { FragmentOf } from '@/lib/datocms/graphql';
import type { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import HtmlContent from '@/components/HtmlContent';
import Link from 'next/link';

type Props = {
  name: string;
  slug: string;
  locale: Locale;
  abstract?: string | null;
  description?: string | null;
  image?: FragmentOf<typeof ResponsiveImageFragment> | null;
};

const labels = {
  en: 'Discover the area',
  it: 'Scopri la zona',
} as const;

export default function DistrictLink({ name, slug, locale, abstract, description, image }: Props) {
  const href = modelPath('district', slug, locale)!;

  return (
    <div className="py-20 lg:py-28 bg-surface-alt">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Label + Title */}
        <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
          {labels[locale]}
        </p>
        <Link
          href={href}
          className="font-heading text-h2 font-normal text-dark hover:text-rust transition-colors duration-300"
        >
          <em>{name}</em>
        </Link>

        {/* Abstract */}
        {abstract && (
          <div className="mt-4 max-w-2xl">
            <HtmlContent
              html={abstract}
              className="font-body text-body-lg text-muted leading-relaxed prose-acacia"
            />
          </div>
        )}

        {/* Image + Description — flag layout */}
        {(image || description) && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {image && (
              <div className="overflow-hidden rounded-card">
                <ResponsiveImage data={image} />
              </div>
            )}
            {description && (
              <div>
                <HtmlContent
                  html={description}
                  className="font-body text-body text-muted leading-relaxed prose-acacia"
                />
                <Link
                  href={href}
                  className="inline-block mt-6 font-body text-caption font-medium text-rust uppercase tracking-wider hover:text-rust-hover transition-colors"
                >
                  Explore {name} &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
