import { type FragmentOf } from '@/lib/datocms/graphql';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { modelPath } from '@/i18n/paths';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

export type RelatedItem = {
  id: string;
  name?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  image?: FragmentOf<typeof ResponsiveImageFragment> | null;
};

type Props = {
  /** Section heading (e.g. "You might also be interested in"). */
  title: string;
  /** Which model the rows link to — drives the URL. */
  model: 'mood' | 'district';
  items: RelatedItem[];
  locale: Locale;
};

/**
 * "You might also be interested in" — a compact, avatar-led list of sibling
 * records (other moods / other districts) shown at the foot of a detail page.
 * Each row: small round avatar on the left, name (+ optional subtitle) on the
 * right. Same UI for moods and districts; only the collection differs.
 */
export default function RelatedList({ title, model, items, locale }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-surface-alt">
      <div className="mx-auto max-w-3xl px-8">
        <p className="mb-6 font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
          {title}
        </p>
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const href = (item.slug && modelPath(model, item.slug, locale)) || '#';
            return (
              <li key={item.id}>
                <Link href={href} className="group flex items-center gap-4 py-6">
                  <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[5px] bg-surface-warm">
                    {item.image ? (
                      <ResponsiveImage
                        data={item.image}
                        pictureClassName="block h-14 w-14"
                        imgClassName="h-14 w-14 object-cover"
                        imgStyle={{ width: '3.5rem', height: '3.5rem', maxWidth: 'none' }}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-heading text-h4 text-muted">
                        {item.name?.charAt(0) ?? '?'}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading text-h4 text-dark transition-colors duration-300 group-hover:text-primary">
                      {item.name}
                    </span>
                    {item.subtitle && (
                      <span className="mt-0.5 block truncate font-body text-body-sm text-muted">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
