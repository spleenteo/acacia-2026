import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const UpFragment = graphql(`
  fragment UpFragment on UpRecord {
    id
    name(locale: $locale)
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
      <h3 className="font-serif italic text-gamma text-heading mb-6">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {ups.map((up) => (
          <span key={up.id}>
            {up.url ? (
              <a
                href={up.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-primary/30 text-primary text-small px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
              >
                {up.name}
              </a>
            ) : (
              <span className="inline-block border border-beige text-body text-small px-3 py-1.5 rounded-full">
                {up.name}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
