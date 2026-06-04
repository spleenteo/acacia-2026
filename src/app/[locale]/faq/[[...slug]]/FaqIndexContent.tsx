'use client';

import type { ResultOf } from 'gql.tada';
import type { indexQuery } from './page';
import FaqCard from '@/components/Faq/FaqCard';
import EditorialHero from '@/components/EditorialHero';

export type FaqIndexProps = {
  roots: { id: string; question: string; href: string }[];
};
type FaqIndexData = ResultOf<typeof indexQuery>;

export default function FaqIndexContent({ roots, data }: FaqIndexProps & { data: FaqIndexData }) {
  const page = data.pageFaq;
  return (
    <>
      <EditorialHero
        tone="sage"
        label="FAQ"
        title={page?.title ?? 'FAQ'}
        subtitle={page?.subtitle}
        priority
      />

      {/* Content scrolls BEHIND the sticky hero (desktop) — lower z-index. */}
      <div className="relative lg:z-0">
        <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
          {page?.intro && (
            <p className="font-body text-body-lg text-body leading-relaxed whitespace-pre-line">
              {page.intro}
            </p>
          )}
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {roots.map((r) => (
              <FaqCard key={r.id} title={r.question} href={r.href} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
