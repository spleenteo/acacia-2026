import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const InfoTextFragment = graphql(`
  fragment InfoTextFragment on InfoTextBlockRecord {
    id
    detailsLabel {
      name(locale: $locale)
    }
    text
  }
`);

type Props = {
  data: FragmentOf<typeof InfoTextFragment>[];
  /** Accessible name for the list: the strip has no visible heading. */
  label: string;
};

/**
 * The facts a guest checks right after the photos (size, floor, elevator…),
 * placed straight after the hero so a dealbreaker never hides further down.
 */
export default function KeyFacts({ data, label }: Props) {
  if (data.length === 0) return null;

  return (
    <dl
      aria-label={label}
      className="mb-12 grid grid-cols-2 gap-x-6 gap-y-4 border-b border-border-light pb-6 lg:mb-16 lg:flex lg:flex-wrap lg:gap-x-12"
    >
      {data.map((item) => {
        const fact = readFragment(InfoTextFragment, item);
        return (
          <div key={fact.id}>
            <dt className="font-body text-label font-medium uppercase tracking-[0.18em] text-muted">
              {fact.detailsLabel.name}
            </dt>
            <dd className="mt-1.5 font-body text-body-sm leading-snug text-dark">{fact.text}</dd>
          </div>
        );
      })}
    </dl>
  );
}
