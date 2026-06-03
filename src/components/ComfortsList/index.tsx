import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import WidgetItemList from '@/components/WidgetItemList';

export const ComfortFragment = graphql(`
  fragment ComfortFragment on ComfortRecord {
    id
    name(locale: $locale)
    icon
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof ComfortFragment>[];
  title: string;
};

export default function ComfortsList({ data, title }: Props) {
  if (data.length === 0) return null;

  const comforts = data.map((d) => readFragment(ComfortFragment, d));

  return (
    <div>
      <WidgetTitle tone="slate" label={title} />
      <WidgetItemList items={comforts} tone="slate" />
    </div>
  );
}
