import { ExternalLink } from 'lucide-react';
import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import DistrictAnchor from '@/components/DistrictAnchor';

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

export default function InfoDetail({ data, title, district }: Props) {
  if (data.length === 0) return null;

  return (
    <div>
      <WidgetTitle tone="slate" label={title} />
      <dl>
        {data.map((item) => {
          if (item.__typename === 'InfoTextRecord') {
            const info = readFragment(InfoTextFragment, item.fragment);
            return (
              <div
                key={info.id}
                className="flex gap-4 py-1.5 border-b border-border-light last:border-b-0"
              >
                <dt className="shrink-0 w-24 font-medium text-[0.9rem] text-dark uppercase tracking-wider">
                  {info.detailsLabel.name}
                </dt>
                <dd className="text-muted text-[0.9rem] leading-snug">{info.text}</dd>
              </div>
            );
          }

          if (item.__typename === 'InfoAddressRecord') {
            const info = readFragment(InfoAddressFragment, item.fragment);
            const mapsUrl = info.addressMap
              ? `https://www.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}`
              : null;
            return (
              <div key={info.id} className="py-1.5 border-b border-border-light last:border-b-0">
                <div className="flex items-center gap-3">
                  <p className="flex-1 text-muted text-[0.9rem] leading-snug">
                    {info.addressText}
                    {district && (
                      <>
                        {' ('}
                        <DistrictAnchor
                          name={district.name}
                          className="text-primary hover:text-primary-hover transition-colors cursor-pointer"
                        />
                        {' area)'}
                      </>
                    )}
                  </p>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open in Google Maps (opens in a new tab)"
                      className="shrink-0 text-muted/50 hover:text-primary transition-colors duration-300"
                    >
                      <ExternalLink size={16} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
                {info.addressMap && (
                  <div className="mt-2 overflow-hidden rounded-card">
                    <iframe
                      src={`https://maps.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}&z=15&layer=transit&output=embed`}
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map"
                    />
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
