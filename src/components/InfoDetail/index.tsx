import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import Link from 'next/link';

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

type District = {
  name: string;
  slug: string;
};

type Props = {
  data: (InfoTextItem | InfoAddressItem)[];
  title: string;
  locale?: string;
  district?: District | null;
};

export default function InfoDetail({ data, title, locale, district }: Props) {
  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="font-heading italic text-h4 text-dark mb-4">{title}</h3>
      <dl className="space-y-2">
        {data.map((item) => {
          if (item.__typename === 'InfoTextRecord') {
            const info = readFragment(InfoTextFragment, item.fragment);
            return (
              <div key={info.id} className="border-b border-dotted border-border pb-2">
                <dt className="font-medium text-caption text-dark uppercase tracking-wider mb-0.5">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-muted text-body-sm">{info.text}</dd>
              </div>
            );
          }

          if (item.__typename === 'InfoAddressRecord') {
            const info = readFragment(InfoAddressFragment, item.fragment);
            return (
              <div key={info.id} className="border-b border-dotted border-border pb-2">
                <dt className="font-medium text-caption text-dark uppercase tracking-wider mb-0.5">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-muted text-body-sm">
                  {info.addressText && (
                    <p className="mb-3">
                      {info.addressText}
                      {district && locale && (
                        <>
                          {' – '}
                          <Link
                            href={`/${locale}/florence/districts/${district.slug}`}
                            className="text-rust hover:text-rust-hover transition-colors"
                          >
                            {district.name}
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                  {info.addressMap && (
                    <>
                      <div className="mt-4 overflow-hidden rounded-card">
                        <iframe
                          src={`https://maps.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}&z=15&layer=transit&output=embed`}
                          width="100%"
                          height="260"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Map"
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-muted hover:text-rust transition-colors text-caption uppercase font-bold tracking-wider"
                      >
                        Google Maps &rarr;
                      </a>
                    </>
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
