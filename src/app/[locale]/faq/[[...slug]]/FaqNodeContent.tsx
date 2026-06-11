'use client';

import type { ResultOf } from 'gql.tada';
import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { stripStega } from 'react-datocms/use-content-link';
import { readFragment } from '@/lib/datocms/graphql';
import { dastToText } from '@/lib/faq/dastText';
import type { FaqNavNode } from '@/lib/faq/faqTree';
import type { nodeQuery } from './page';
import { FaqAnswerFragment } from '@/components/Faq/answerFragment';
import FaqStructuredText from '@/components/Faq/FaqStructuredText';
import FaqBreadcrumb, { type Crumb } from '@/components/Faq/FaqBreadcrumb';
import FaqSideNav from '@/components/Faq/FaqSideNav';
import CopyLinkButton from '@/components/Faq/CopyLinkButton';

export type FaqNodeProps = {
  locale: Locale;
  /** This node's own page URL, for the share button. */
  selfHref: string;
  crumbs: Crumb[];
  /** Full phase tree for the docs-style side navigation. */
  navTree: FaqNavNode[];
  activeId: string;
  ancestorIds: string[];
  /** True when this node has no children (a question, not a section). */
  isLeaf: boolean;
  faqHrefById: Record<string, string>;
};
type FaqNodeData = ResultOf<typeof nodeQuery>;

/** Depth-first flatten of the nav tree, for the prev/next pager. */
function flatten(nodes: FaqNavNode[], out: FaqNavNode[] = []): FaqNavNode[] {
  for (const n of nodes) {
    out.push(n);
    if (n.children.length) flatten(n.children, out);
  }
  return out;
}

export default function FaqNodeContent({
  locale,
  selfHref,
  crumbs,
  navTree,
  activeId,
  ancestorIds,
  isLeaf,
  faqHrefById,
  data,
}: FaqNodeProps & { data: FaqNodeData }) {
  const faq = data.faq;
  if (!faq) return null;

  const answer = faq.answerStructured
    ? readFragment(FaqAnswerFragment, faq.answerStructured)
    : null;

  // Single-question FAQPage JSON-LD on leaf pages (rich-result eligibility).
  const answerText = isLeaf ? dastToText(answer?.value) : '';
  const jsonLd =
    isLeaf && answerText
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              // Strip stega: in draft mode `question` carries invisible
              // click-to-edit metadata that must not leak into JSON-LD.
              name: stripStega(faq.question ?? ''),
              acceptedAnswer: { '@type': 'Answer', text: answerText },
            },
          ],
        }
      : null;

  // Prev / next across the flattened tree, docs-style pager.
  const flat = flatten(navTree);
  const idx = flat.findIndex((n) => n.id === activeId);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        {/* Side navigation — left column on desktop, on top on mobile */}
        <aside className="mb-10 lg:mb-0">
          <div className="lg:sticky lg:top-28">
            <FaqSideNav
              navTree={navTree}
              activeId={activeId}
              ancestorIds={ancestorIds}
              locale={locale}
            />
          </div>
        </aside>

        {/* Article */}
        <article className="min-w-0 max-w-3xl">
          <FaqBreadcrumb crumbs={crumbs} />

          <div className="flex items-start gap-3">
            <h1 className="font-heading text-h1 font-normal leading-tight text-dark">
              {faq.question}
            </h1>
            <CopyLinkButton href={selfHref} className="mt-2" />
          </div>

          <div className="mt-6">
            <FaqStructuredText
              data={faq.answerStructured}
              faqHrefById={faqHrefById}
              locale={locale}
            />
          </div>

          {(prev || next) && (
            <nav className="mt-14 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="group rounded-card border border-border p-4 transition-colors hover:border-primary-pale"
                >
                  <span className="font-body text-label uppercase tracking-[0.18em] text-light">
                    ←
                  </span>
                  <span className="mt-1 block font-heading text-h4 font-normal text-dark transition-colors group-hover:text-primary">
                    {prev.question}
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-card border border-border p-4 text-right transition-colors hover:border-primary-pale"
                >
                  <span className="font-body text-label uppercase tracking-[0.18em] text-light">
                    →
                  </span>
                  <span className="mt-1 block font-heading text-h4 font-normal text-dark transition-colors group-hover:text-primary">
                    {next.question}
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
            </nav>
          )}
        </article>
      </div>
    </div>
  );
}
