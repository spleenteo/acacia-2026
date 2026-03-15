import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const CuddleFragment = graphql(`
  fragment CuddleFragment on CuddleRecord {
    id
    name(locale: $locale)
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof CuddleFragment>[];
  title: string;
};

export default function CuddlesList({ data, title }: Props) {
  if (data.length === 0) return null;

  const cuddles = data.map((d) => readFragment(CuddleFragment, d));

  return (
    <div>
      <p className="font-body text-label uppercase tracking-[0.18em] text-rust font-medium mb-2">
        {title}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
        {cuddles.map((cuddle) => (
          <li key={cuddle.id} className="border-b border-border-light py-2.5">
            {cuddle.url ? (
              <a
                href={cuddle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-body text-muted hover:text-rust transition-colors duration-300"
              >
                {cuddle.name}
              </a>
            ) : (
              <span className="font-body text-body text-muted">{cuddle.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
