import type { ReactNode } from 'react';
import WidgetTitle from '@/components/WidgetTitle';
import WidgetItemList, { type WidgetItem } from '@/components/WidgetItemList';
import type { Tone } from '@/components/WidgetLabel';

type Props = {
  items: WidgetItem[];
  /** Tone for the label chip + item icons. */
  tone: Tone;
  /** Coloured label chip text. */
  label: ReactNode;
  /** Optional serif title under the chip. */
  title?: ReactNode;
};

/**
 * A titled sidebar widget (label chip + optional title + icon list). Shared by
 * the amenities / comforts / essentials lists, which differ only by tone and
 * record type. Renders nothing when there are no items.
 */
export default function WidgetList({ items, tone, label, title }: Props) {
  if (items.length === 0) return null;

  return (
    <div>
      <WidgetTitle tone={tone} label={label} title={title} />
      <WidgetItemList items={items} tone={tone} />
    </div>
  );
}
