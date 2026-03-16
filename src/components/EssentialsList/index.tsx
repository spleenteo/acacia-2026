import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { getAmenityIcon } from '@/lib/amenity-icons';

export const EssentialFragment = graphql(`
  fragment EssentialFragment on EssentialRecord {
    id
    name(locale: $locale)
    icon
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof EssentialFragment>[];
  title: string;
};

export default function EssentialsList({ data, title }: Props) {
  if (data.length === 0) return null;

  const essentials = data.map((d) => readFragment(EssentialFragment, d));

  return (
    <div>
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-4">
        {title}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
        {essentials.map((essential) => {
          const Icon = getAmenityIcon(essential.icon);
          const content = (
            <span className="flex items-start gap-3">
              <Icon size={22} strokeWidth={1.5} className="shrink-0 text-rust/50 mt-0.5" />
              <span>{essential.name}</span>
            </span>
          );

          return (
            <li key={essential.id} className="border-b border-border-light py-3">
              {essential.url ? (
                <a
                  href={essential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-body text-muted hover:text-rust transition-colors duration-300"
                >
                  {content}
                </a>
              ) : (
                <span className="font-body text-body text-muted">{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
