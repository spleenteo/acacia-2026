'use client';

import type { ResultOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import type { indexQuery } from './page';
import FaqCard from '@/components/Faq/FaqCard';
import EditorialHero from '@/components/EditorialHero';
import StructuredTextContent from '@/components/StructuredTextContent';
import { toHeroTone } from '@/lib/heroTone';

export type FaqIndexProps = {
  roots: { id: string; question: string; href: string }[];
};
type FaqIndexData = ResultOf<typeof indexQuery>;

export default function FaqIndexContent({ roots, data }: FaqIndexProps & { data: FaqIndexData }) {
  const t = useTranslations('faq');
  const page = data.page;
  return (
    <>
      <EditorialHero
        tone={toHeroTone(page?.hero.color)}
        label="FAQ"
        title={page?.hero.title ?? 'FAQ'}
        subtitle={page?.hero.subtitle}
        image={page?.hero.featuredImage?.responsiveImage}
        priority
      />

      {/* Content scrolls BEHIND the sticky hero (desktop) — lower z-index. */}
      <div className="relative lg:z-0">
        <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
          {page?.description?.value ? (
            <StructuredTextContent
              data={page.description}
              className="font-body text-body-lg text-body"
            />
          ) : null}
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {roots.map((r) => (
              <FaqCard key={r.id} title={r.question} href={r.href} cta={t('explore')} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
