import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { modelPath } from '@/i18n/paths';
import type { Locale } from '@/i18n/config';
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
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-4">
        {title}
      </p>
      <dl className="divide-y divide-dotted divide-border">
        {data.map((item) => {
          if (item.__typename === 'InfoTextRecord') {
            const info = readFragment(InfoTextFragment, item.fragment);
            return (
              <div key={info.id} className="flex gap-4 py-2.5">
                <dt className="shrink-0 w-24 font-medium text-caption text-dark uppercase tracking-wider pt-0.5">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-muted text-body-sm">{info.text}</dd>
              </div>
            );
          }

          if (item.__typename === 'InfoAddressRecord') {
            const info = readFragment(InfoAddressFragment, item.fragment);
            const mapsUrl = info.addressMap
              ? `https://www.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}`
              : null;
            return (
              <div
                key={info.id}
                className="border-t border-dotted border-border pt-4 mt-2 pb-6 space-y-3"
              >
                <p className="text-muted text-body-sm">
                  {info.addressText && mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-rust transition-colors"
                    >
                      {info.addressText}
                    </a>
                  ) : (
                    info.addressText
                  )}
                  {district && locale && (
                    <>
                      {' ('}
                      <Link
                        href={modelPath('district', district.slug, locale as Locale)!}
                        className="text-rust hover:text-rust-hover transition-colors"
                      >
                        {district.name}
                      </Link>
                      {' area)'}
                    </>
                  )}
                </p>
                {info.addressMap && (
                  <div>
                    <div className="overflow-hidden rounded-card">
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
                    <div className="text-center mt-3">
                      <a
                        href={mapsUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-border text-muted hover:text-rust hover:border-rust font-body text-caption uppercase tracking-wider font-medium px-4 py-1.5 rounded-pill transition-all duration-300"
                      >
                        Google Maps &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </dl>
    </div>
  );
}
