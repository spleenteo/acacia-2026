import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetList from '@/components/WidgetList';

export const AmenityFragment = graphql(`
  fragment AmenityFragment on AmenityRecord {
    id
    name(locale: $locale)
    icon
    url(locale: $locale)
  }
`);

type Props = {
  data: FragmentOf<typeof AmenityFragment>[];
  label: string;
  title: string;
};

export default function AmenitiesList({ data, label, title }: Props) {
  const amenities = data.map((d) => readFragment(AmenityFragment, d));
  return <WidgetList items={amenities} tone="sage" label={label} title={title} />;
}
