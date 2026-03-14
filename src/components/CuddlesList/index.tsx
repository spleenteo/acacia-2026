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
      <h3 className="font-serif italic text-gamma text-heading mb-6">{title}</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {cuddles.map((cuddle) => (
          <li
            key={cuddle.id}
            className="border-b border-dotted border-beige py-2 text-small text-body"
          >
            {cuddle.url ? (
              <a
                href={cuddle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {cuddle.name}
              </a>
            ) : (
              cuddle.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
