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
        responsiveImage(imgixParams: { w: 400, h: 300, fit: crop }) {
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
      <div className="border-b border-dotted border-heading mb-8 transition-colors duration-500 hover:bg-cream">
        <div className="overflow-hidden">
          {mood.image?.responsiveImage && (
            <div className="transition-transform duration-500 group-hover:scale-[1.3]">
              <ResponsiveImage data={mood.image.responsiveImage} />
            </div>
          )}
        </div>
        <div className="px-4 pb-4">
          <h2 className="font-heading font-extralight text-gamma leading-tight my-3">
            {mood.name}
          </h2>
          {mood.claim && (
            <p className="font-serif italic text-small text-body-light">{mood.claim}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
