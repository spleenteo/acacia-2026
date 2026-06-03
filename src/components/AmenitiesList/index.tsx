import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import WidgetTitle from '@/components/WidgetTitle';
import WidgetItemList from '@/components/WidgetItemList';

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
  if (data.length === 0) return null;

  const amenities = data.map((d) => readFragment(AmenityFragment, d));

  return (
    <div>
      <WidgetTitle tone="sage" label={label} title={title} />
      <WidgetItemList items={amenities} tone="sage" />
    </div>
  );
}
