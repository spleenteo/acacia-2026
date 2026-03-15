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
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-4">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {ups.map((up) => (
          <span key={up.id}>
            {up.url ? (
              <a
                href={up.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-rust/30 text-rust font-body text-body px-3 py-1.5 rounded-pill hover:bg-rust hover:text-white hover:border-rust transition-all duration-300"
              >
                {up.name}
              </a>
            ) : (
              <span className="inline-block border border-border text-muted font-body text-body px-3 py-1.5 rounded-pill">
                {up.name}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
