import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { getAmenityIcon } from '@/lib/amenity-icons';

export const AmenityFragment = graphql(`
  fragment AmenityFragment on AmenityRecord {
    id
    name(locale: $locale)
    icon
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof AmenityFragment>[];
  label: string;
  title: string;
};

export default function AmenitiesList({ data, label, title }: Props) {
  if (data.length === 0) return null;

  const amenities = data.map((d) => readFragment(AmenityFragment, d));

  return (
    <div>
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
        {label}
      </p>
      <h3 className="font-heading italic text-h3 text-dark mb-6">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.icon);
          const content = (
            <span className="inline-flex items-center gap-1.5">
              <Icon size={18} strokeWidth={1.5} />
              {amenity.name}
            </span>
          );

          return (
            <span key={amenity.id}>
              {amenity.url ? (
                <a
                  href={amenity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-rust/30 text-rust font-body text-body px-3 py-1.5 rounded-pill hover:bg-rust hover:text-white hover:border-rust transition-all duration-300"
                >
                  {content}
                </a>
              ) : (
                <span className="inline-block border border-border text-muted font-body text-body px-3 py-1.5 rounded-pill">
                  {content}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
