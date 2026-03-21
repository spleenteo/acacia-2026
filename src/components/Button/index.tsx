import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import Link from 'next/link';

export const ButtonBlockFragment = graphql(`
  fragment ButtonBlockFragment on ButtonBlockRecord {
    id
    label
    style
    url
  }
`);

type Props = {
  data: FragmentOf<typeof ButtonBlockFragment>;
};

type DatoCmsLink = {
  value?: string;
  url?: string;
  meta?: { rel?: string; target?: string; title?: string }[];
};

function resolveUrl(url: DatoCmsLink | null | undefined): {
  href: string;
  isExternal: boolean;
  target?: string;
  rel?: string;
} | null {
  if (!url) return null;
  const href = url.value || url.url || '';
  if (!href) return null;

  const isExternal = href.startsWith('http://') || href.startsWith('https://');
  const meta = url.meta?.[0];

  return {
    href,
    isExternal,
    target: meta?.target || (isExternal ? '_blank' : undefined),
    rel: meta?.rel || (isExternal ? 'noopener noreferrer' : undefined),
  };
}

const styleClasses: Record<string, string> = {
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

export default function Button({ data }: Props) {
  const { label, style, url } = readFragment(ButtonBlockFragment, data);
  const resolved = resolveUrl(url as DatoCmsLink | null);
  if (!resolved) return null;

  const className = styleClasses[style] || styleClasses.primary;

  if (resolved.isExternal) {
    return (
      <a href={resolved.href} className={className} target={resolved.target} rel={resolved.rel}>
        {label}
      </a>
    );
  }

  return (
    <Link href={resolved.href} className={className}>
      {label}
    </Link>
  );
}
