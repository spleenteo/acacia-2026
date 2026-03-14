import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import ResponsiveImage from '@/components/ResponsiveImage';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

export const MoodCardFragment = graphql(
  `
    fragment MoodCardFragment on MoodRecord {
      id
      name(locale: $locale)
      slug(locale: $locale)
      claim(locale: $locale)
      image {
        responsiveImage(imgixParams: { w: 600, h: 800, fit: crop }) {
          ...ResponsiveImageFragment
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

type Props = {
  data: FragmentOf<typeof MoodCardFragment>;
  locale: Locale;
};

export default function MoodCard({ data, locale }: Props) {
  const mood = readFragment(MoodCardFragment, data);

  return (
    <Link href={`/${locale}/moods/${mood.slug}`} className="group block">
      <article>
        {/* Image — portrait 3:4, overflow-hidden scoped here only */}
        <div
          className="overflow-hidden rounded-sm transition-shadow duration-500 group-hover:shadow-card-hover"
          style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
        >
          {mood.image?.responsiveImage && (
            <div
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
            >
              <ResponsiveImage data={mood.image.responsiveImage} />
            </div>
          )}
        </div>

        {/* Content — no background, blends with page */}
        <div className="pt-4">
          <h3 className="font-heading text-h3 font-normal text-dark leading-snug">{mood.name}</h3>
          {mood.claim && (
            <p className="font-body text-caption text-muted font-normal mt-2 transition-all duration-300 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0">
              {mood.claim}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
