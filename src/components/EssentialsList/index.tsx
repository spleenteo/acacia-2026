import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetList from '@/components/WidgetList';

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
  const essentials = data.map((d) => readFragment(EssentialFragment, d));
  return <WidgetList items={essentials} tone="rust" label={title} />;
}
