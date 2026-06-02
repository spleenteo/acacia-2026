'use client';

import type { ResultOf } from 'gql.tada';
import type { indexQuery } from './page';
import FaqCard from '@/components/Faq/FaqCard';

export type FaqIndexProps = {
  roots: { id: string; question: string; href: string }[];
};
type FaqIndexData = ResultOf<typeof indexQuery>;

export default function FaqIndexContent({ roots, data }: FaqIndexProps & { data: FaqIndexData }) {
  const page = data.pageFaq;
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <p className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium">
        FAQ
      </p>
      <h1 className="mt-3 font-heading text-h1 md:text-hero font-normal text-dark">
        {page?.title ?? 'FAQ'}
      </h1>
      {page?.subtitle && (
        <p className="mt-3 font-heading text-h3 font-normal text-muted italic">{page.subtitle}</p>
      )}
      {page?.intro && (
        <p className="mt-5 font-body text-body-lg text-body leading-relaxed whitespace-pre-line">
          {page.intro}
        </p>
      )}
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {roots.map((r) => (
          <FaqCard key={r.id} title={r.question} href={r.href} />
        ))}
      </div>
    </div>
  );
}
