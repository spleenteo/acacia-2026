import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { type Locale } from '@/i18n/config';
import SearchResults from './SearchResults';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  // Search result pages shouldn't be indexed.
  return { title: t('title'), robots: { index: false, follow: true } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;

  return (
    <section className="mx-auto min-h-[70svh] max-w-3xl px-6 py-16 md:px-8 md:py-24">
      {/* useSearchParams (read inside SearchResults later, V4) needs Suspense. */}
      <Suspense fallback={null}>
        <SearchResults locale={locale as Locale} initialQuery={q ?? ''} />
      </Suspense>
    </section>
  );
}
