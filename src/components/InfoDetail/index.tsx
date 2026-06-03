import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetLabel from '@/components/WidgetLabel';
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
      <p className="pt-4">
        <WidgetLabel tone="slate">{title}</WidgetLabel>
      </p>
      <dl>
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
              <div key={info.id} className="pt-4 mt-2 pb-6 space-y-3">
                <p className="text-muted text-body-sm">
                  {info.addressText && mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {info.addressText}
                    </a>
                  ) : (
                    info.addressText
                  )}
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
                    <div className="text-center text-body-sm mt-3">
                      <a
                        href={mapsUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-muted hover:text-primary hover:border-primary font-body text-caption uppercase tracking-wider text-body-sm font-medium px-4 py-1.5 rounded-pill transition-all duration-300"
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
