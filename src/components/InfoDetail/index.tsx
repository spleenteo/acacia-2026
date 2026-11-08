import { ExternalLink } from 'lucide-react';
import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import DistrictAnchor from '@/components/DistrictAnchor';

export const InfoAddressFragment = graphql(`
  fragment InfoAddressFragment on InfoAddressBlockRecord {
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

type District = {
  name: string;
  slug: string;
};

type Props = {
  data: FragmentOf<typeof InfoAddressFragment>[];
  title: string;
  district?: District | null;
};

export default function InfoDetail({ data, title, district }: Props) {
  if (data.length === 0) return null;

  return (
    <div>
      <WidgetTitle tone="slate" label={title} />
      {data.map((item) => {
        const info = readFragment(InfoAddressFragment, item);
        const mapsUrl = info.addressMap
          ? `https://www.google.com/maps?q=${info.addressMap.latitude},${info.addressMap.longitude}`
          : null;
        return (
          <div key={info.id} className="py-1.5">
            <div className="flex items-center gap-3">
              <p className="flex-1 text-muted text-caption leading-snug">
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
                  tabIndex={-1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
