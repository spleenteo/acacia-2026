import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { getAmenityIcon } from '@/lib/amenity-icons';

export const UpFragment = graphql(`
  fragment UpFragment on UpRecord {
    id
    name(locale: $locale)
    icon
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof UpFragment>[];
  title: string;
};

export default function UpsList({ data, title }: Props) {
  if (data.length === 0) return null;

  const ups = data.map((d) => readFragment(UpFragment, d));

  return (
    <div>
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-4">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {ups.map((up) => {
          const Icon = getAmenityIcon(up.icon);
          const content = (
            <span className="inline-flex items-center gap-1.5">
              <Icon size={18} strokeWidth={1.5} />
              {up.name}
            </span>
          );

          return (
            <span key={up.id}>
              {up.url ? (
                <a
                  href={up.url}
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
