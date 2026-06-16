import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetList from '@/components/WidgetList';

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
  const comforts = data.map((d) => readFragment(ComfortFragment, d));
  return <WidgetList items={comforts} tone="slate" label={title} />;
}
