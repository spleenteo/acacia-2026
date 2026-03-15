import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const TruthFragment = graphql(`
  fragment TruthFragment on TruthRecord {
    id
    body(markdown: true)
  }
`);

type Props = {
  data: FragmentOf<typeof TruthFragment>[];
  title: string;
  label: string;
};

export default function HomeTruths({ data, title, label }: Props) {
  if (data.length === 0) return null;

  const truths = data.map((d) => readFragment(TruthFragment, d));

  return (
    <div>
      <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-2">
        {label}
      </p>
      <h3 className="font-heading text-h3 text-dark mb-6">
        <em>{title}</em>
      </h3>
      <ul className="space-y-3">
        {truths.map((truth) => (
          <li key={truth.id} className="flex gap-3 items-start">
            <span className="shrink-0 mt-0.5 text-rust/60">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <div
              className="font-body text-body text-muted leading-relaxed prose-acacia"
              dangerouslySetInnerHTML={{ __html: truth.body }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
