import { Info } from 'lucide-react';
import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import { TONES } from '@/components/WidgetLabel';

export const TruthFragment = graphql(`
  fragment TruthFragment on TruthBlockRecord {
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
      <WidgetTitle tone="gold" label={label} title={title} />
      <ul>
        {truths.map((truth) => (
          <li
            key={truth.id}
            className="flex gap-3 items-start py-1.5 border-b border-border-light last:border-b-0"
          >
            <Info
              size={24}
              strokeWidth={1.5}
              className="shrink-0 mt-0.5"
              style={{ color: TONES.gold.fg }}
            />
            <div
              className="font-body text-[0.9rem] text-muted leading-snug prose-acacia"
              dangerouslySetInnerHTML={{ __html: truth.body }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
