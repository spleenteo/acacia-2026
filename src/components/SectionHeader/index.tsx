import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';

export const SectionHeaderFragment = graphql(`
  fragment SectionHeaderFragment on SectionHeaderRecord {
    id
    label
    title(markdown: true)
    subtitle
  }
`);

type Props = {
  data: FragmentOf<typeof SectionHeaderFragment>;
};

function unwrapParagraph(html: string): string {
  return html.replace(/^<p>([\s\S]*)<\/p>\n?$/, '$1');
}

export default function SectionHeader({ data }: Props) {
  const { label, title, subtitle } = readFragment(SectionHeaderFragment, data);

  return (
    <div className="text-center mb-12">
      {label && (
        <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-3">
          {label}
        </p>
      )}
      <h2
        className="section-title font-heading font-normal text-h1 text-dark tracking-[-0.02em]"
        dangerouslySetInnerHTML={{ __html: unwrapParagraph(title) }}
      />
      {subtitle && (
        <p className="font-body text-body-lg text-muted mt-4 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
