import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const InfoTextFragment = graphql(`
  fragment InfoTextFragment on InfoTextRecord {
    id
    detailsLabel {
      name(locale: $locale)
    }
    text
  }
`);

export const InfoAddressFragment = graphql(`
  fragment InfoAddressFragment on InfoAddressRecord {
    id
    detailsLabel {
      name(locale: $locale)
    }
    addressText
    addressMap {
      latitude
      longitude
    }
  }
`);

type InfoTextItem = {
  __typename: 'InfoTextRecord';
  fragment: FragmentOf<typeof InfoTextFragment>;
};

type InfoAddressItem = {
  __typename: 'InfoAddressRecord';
  fragment: FragmentOf<typeof InfoAddressFragment>;
};

type Props = {
  data: (InfoTextItem | InfoAddressItem)[];
  title: string;
};

export default function InfoDetail({ data, title }: Props) {
  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="font-serif italic text-gamma text-heading mb-6">{title}</h3>
      <dl className="space-y-4">
        {data.map((item) => {
          if (item.__typename === 'InfoTextRecord') {
            const info = readFragment(InfoTextFragment, item.fragment);
            return (
              <div key={info.id} className="border-b border-dotted border-beige pb-3">
                <dt className="font-bold text-small text-heading uppercase tracking-wider mb-1">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-body text-small">{info.text}</dd>
              </div>
            );
          }

          if (item.__typename === 'InfoAddressRecord') {
            const info = readFragment(InfoAddressFragment, item.fragment);
            return (
              <div key={info.id} className="border-b border-dotted border-beige pb-3">
                <dt className="font-bold text-small text-heading uppercase tracking-wider mb-1">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-body text-small">
                  {info.addressText && <p className="mb-2">{info.addressText}</p>}
                  {info.addressMap && (
                    <a
                      href={`https://www.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-secondary hover:text-primary transition-colors text-milli uppercase font-bold tracking-wider"
                    >
                      View on map &rarr;
                    </a>
                  )}
                </dd>
              </div>
            );
          }

          return null;
        })}
      </dl>
    </div>
  );
}
