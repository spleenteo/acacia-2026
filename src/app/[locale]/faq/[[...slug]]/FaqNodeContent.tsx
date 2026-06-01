'use client';

import type { ResultOf } from 'gql.tada';
import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { readFragment } from '@/lib/datocms/graphql';
import { dastToText } from '@/lib/faq/dastText';
import type { nodeQuery } from './page';
import { FaqAnswerFragment } from '@/components/Faq/answerFragment';
import FaqStructuredText from '@/components/Faq/FaqStructuredText';
import FaqAccordion from '@/components/Faq/FaqAccordion';
import FaqBreadcrumb, { type Crumb } from '@/components/Faq/FaqBreadcrumb';
import FaqCard from '@/components/Faq/FaqCard';

export type ChildMeta = { id: string; isLeaf: boolean; href: string; question: string };

export type FaqNodeProps = {
  locale: Locale;
  crumbs: Crumb[];
  childOrder: ChildMeta[];
  childrenAllLeaves: boolean;
  siblings: { id: string; question: string; href: string }[];
  faqHrefById: Record<string, string>;
};
type FaqNodeData = ResultOf<typeof nodeQuery>;

export default function FaqNodeContent({
  locale,
  crumbs,
  childOrder,
  childrenAllLeaves,
  siblings,
  faqHrefById,
  data,
}: FaqNodeProps & { data: FaqNodeData }) {
  const faq = data.faq;
  if (!faq) return null;

  const childContentById = new Map((faq.children ?? []).map((c) => [c.id, c]));

  // FAQPage JSON-LD (only on accordion nodes whose children are questions)
  const mainEntity = childrenAllLeaves
    ? childOrder
        .map((c) => {
          const cc = childContentById.get(c.id);
          const answer = cc?.answerStructured
            ? readFragment(FaqAnswerFragment, cc.answerStructured)
            : null;
          const text = dastToText(answer?.value);
          return text
            ? {
                '@type': 'Question',
                name: cc?.question ?? c.question,
                acceptedAnswer: { '@type': 'Answer', text },
              }
            : null;
        })
        .filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      {mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity,
            }),
          }}
        />
      )}

      <FaqBreadcrumb crumbs={crumbs} />

      <h1 className="font-heading text-h1 font-normal text-dark leading-tight">{faq.question}</h1>

      <div className="mt-5">
        <FaqStructuredText data={faq.answerStructured} faqHrefById={faqHrefById} locale={locale} />
      </div>

      {childOrder.length > 0 && (
        <div className="mt-10">
          {childrenAllLeaves ? (
            <FaqAccordion
              faqHrefById={faqHrefById}
              locale={locale}
              items={childOrder.map((c) => ({
                id: c.id,
                question: childContentById.get(c.id)?.question ?? c.question,
                answer: childContentById.get(c.id)?.answerStructured ?? null,
              }))}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {childOrder.map((c) => (
                <FaqCard
                  key={c.id}
                  title={childContentById.get(c.id)?.question ?? c.question}
                  href={c.href}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {siblings.length > 0 && (
        <div className="mt-14 border-t border-border pt-6">
          <p className="font-body text-label uppercase tracking-[0.18em] text-light font-medium">
            Vai a
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {siblings.map((s) => (
              <li key={s.id}>
                <Link
                  href={s.href}
                  className="font-body text-body-sm text-muted transition-colors hover:text-rust"
                >
                  {s.question}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
