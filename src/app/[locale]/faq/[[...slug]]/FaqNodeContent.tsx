'use client';

import type { ResultOf } from 'gql.tada';
import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { stripStega } from 'react-datocms/stega';
import { useTranslations } from 'next-intl';
import { readFragment } from '@/lib/datocms/graphql';
import { dastToText } from '@/lib/faq/dastText';
import type { FaqNavNode } from '@/lib/faq/faqTree';
import type { nodeQuery } from './page';
import { FaqShortAnswerFragment, FaqLongAnswerFragment } from '@/components/Faq/answerFragment';
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
  const t = useTranslations('faq');
  const faq = data.faq;
  if (!faq) return null;

  const short = faq.shortAnswer ? readFragment(FaqShortAnswerFragment, faq.shortAnswer) : null;
  const long = faq.longAnswer ? readFragment(FaqLongAnswerFragment, faq.longAnswer) : null;
  const longHasContent =
    !!long && (dastToText(long.value).trim().length > 0 || long.blocks.length > 0);

  // Single-question FAQPage JSON-LD on leaf pages (rich-result eligibility) —
  // the concise short answer is the accepted answer.
  const answerText = isLeaf ? dastToText(short?.value) : '';
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
          // Escape `<` so a `</script>` inside any field can't break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}

      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        {/* Side navigation — left column on desktop, on top on mobile */}
        <aside className="mb-10 lg:mb-0">
          <div className="faq-nav-sticky">
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

          {/* Short answer — the TL;DR, highlighted in a soft sand box. */}
          {short?.value ? (
            <div className="mt-6 rounded-card bg-surface-warm px-6 py-5 sm:px-7 sm:py-6">
              <p className="mb-2 font-body text-label font-medium uppercase tracking-[0.18em] text-primary">
                {locale === 'it' ? 'In breve' : 'In short'}
              </p>
              <FaqStructuredText data={short} faqHrefById={faqHrefById} locale={locale} />
            </div>
          ) : null}

          {/* Long answer — full write-up under a "want to know more?" heading. */}
          {longHasContent && (
            <div className="mt-10">
              <h2 className="font-heading text-h3 font-normal text-dark">{t('readMore')}</h2>
              <div className="mt-4">
                <FaqStructuredText data={long} faqHrefById={faqHrefById} locale={locale} />
              </div>
            </div>
          )}

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
