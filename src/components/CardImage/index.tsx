import { type FragmentOf } from '@/lib/datocms/graphql';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';

type Props = {
  data: FragmentOf<typeof ResponsiveImageFragment>;
  /** Extra classes on the outer frame (e.g. `mt-4` when the image sits below text). */
  className?: string;
};

/**
 * The portrait image frame shared by the index cards (apartment / mood / post):
 * rounded, clipped, with a shadow on hover and a slow inner zoom. Lives in one
 * place so the easing and hover feel stay consistent. Expects to sit inside a
 * `group` so `group-hover` triggers. Easing comes from the `ease-card` token.
 */
export default function CardImage({ data, className }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-sm transition-shadow duration-500 ease-card group-hover:shadow-card-hover ${className ?? ''}`}
    >
      <div className="transition-transform duration-700 ease-card group-hover:scale-[1.03]">
        <ResponsiveImage data={data} />
      </div>
    </div>
  );
}
