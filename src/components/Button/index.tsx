import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { recordSlugToPath } from '@/lib/datocms/recordInfo';
import Link from 'next/link';

export const ButtonBlockFragment = graphql(`
  fragment ButtonBlockFragment on ButtonBlockRecord {
    id
    button
  }
`);

type Props = {
  data: FragmentOf<typeof ButtonBlockFragment>;
  /** When true, renders dark-on-light styles instead of light-on-dark */
  dark?: boolean;
  /** Current locale, needed to resolve record links to full paths */
  locale?: string;
};

/**
 * Formatted shape from the datocms-plugin-better-linking plugin.
 * This is the simplified, frontend-ready representation stored inside the JSON field.
 */
type BetterLinkFormatted = {
  isValid: boolean;
  type: 'record' | 'asset' | 'url' | 'tel' | 'email';
  modelApiKey?: string;
  text: string;
  ariaLabel: string;
  url: string | null;
  target: '_blank' | '_self';
  class: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFormatted(button: any): BetterLinkFormatted | null {
  if (!button?.formatted) return null;
  const f = button.formatted as BetterLinkFormatted;
  if (!f.isValid || !f.url) return null;
  return f;
}

const lightStyles: Record<string, string> = {
  primary: `font-body text-caption font-medium tracking-[0.06em]
    text-white bg-rust hover:bg-rust-hover
    px-8 py-3.5 rounded-pill transition-colors duration-300`,
  secondary: `font-body text-caption font-medium tracking-[0.06em]
    text-white border border-white/40 hover:border-white/70
    px-8 py-3.5 rounded-pill transition-colors duration-300`,
  tertiary: `font-body text-caption font-medium tracking-[0.06em]
    text-white/80 hover:text-white underline underline-offset-4
    decoration-white/30 hover:decoration-white/60
    transition-colors duration-300`,
};

const darkStyles: Record<string, string> = {
  primary: `font-body text-caption font-medium tracking-[0.06em]
    text-white bg-rust hover:bg-rust-hover
    px-8 py-3.5 rounded-pill transition-colors duration-300`,
  secondary: `font-body text-caption font-medium tracking-[0.06em]
    text-dark border border-dark/30 hover:border-dark/60
    px-8 py-3.5 rounded-pill transition-colors duration-300`,
  tertiary: `font-body text-caption font-medium tracking-[0.06em]
    text-muted hover:text-dark underline underline-offset-4
    decoration-muted/30 hover:decoration-dark/60
    transition-colors duration-300`,
};

export default function Button({ data, dark = false, locale }: Props) {
  const { button } = readFragment(ButtonBlockFragment, data);
  const formatted = getFormatted(button);
  if (!formatted) return null;

  const style = formatted.class || 'primary';
  const styles = dark ? darkStyles : lightStyles;
  const className = styles[style] || styles.primary;

  const isInternal = formatted.type === 'record';

  if (isInternal) {
    const href =
      locale && formatted.modelApiKey
        ? (recordSlugToPath(formatted.modelApiKey, formatted.url!, locale) ?? formatted.url!)
        : formatted.url!;
    return (
      <Link href={href} className={className} aria-label={formatted.ariaLabel}>
        {formatted.text}
      </Link>
    );
  }

  return (
    <a
      href={formatted.url!}
      className={className}
      target={formatted.target}
      rel={formatted.target === '_blank' ? 'noopener noreferrer' : undefined}
      aria-label={formatted.ariaLabel}
    >
      {formatted.text}
    </a>
  );
}
