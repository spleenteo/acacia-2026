import { ExternalLink } from 'lucide-react';
import { getAmenityIcon } from '@/lib/amenity-icons';
import { TONES, type Tone } from '@/components/WidgetLabel';

export type WidgetItem = {
  id: string;
  name: string;
  icon: string | null;
  url: string | null;
};

type Props = {
  items: WidgetItem[];
  /** Drives the leading icon colour, matched to the widget's label chip. */
  tone: Tone;
};

/**
 * Uniform sidebar list (amenities / essentials / comforts): each row is a large
 * tone-coloured leading icon, the label at ~0.8rem, and — when the item links
 * out — a small external-link icon on the right that opens in a new tab. Rows
 * are split by a hairline divider with tight, even vertical padding.
 */
export default function WidgetItemList({ items, tone }: Props) {
  const iconColor = TONES[tone].fg;

  return (
    <ul>
      {items.map((item) => {
        const Icon = getAmenityIcon(item.icon);
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 py-1.5 border-b border-border-light last:border-b-0"
          >
            <Icon size={24} strokeWidth={1.5} className="shrink-0" style={{ color: iconColor }} />
            <span className="flex-1 font-body text-[0.9rem] leading-snug text-muted">
              {item.name}
            </span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.name} (opens in a new tab)`}
                className="shrink-0 text-muted/50 hover:text-primary transition-colors duration-300"
              >
                <ExternalLink size={16} strokeWidth={1.5} />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
