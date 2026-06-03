import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import WidgetItemList from '@/components/WidgetItemList';

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
      <WidgetTitle tone="rust" label={title} />
      <WidgetItemList items={essentials} tone="rust" />
    </div>
  );
}
