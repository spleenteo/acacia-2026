'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/i18n/config';
import { renderHighlight } from '@/lib/highlightMarks';
import { MIN_QUERY_LENGTH, type SearchHit } from '@/lib/search/types';

type Props = { locale: Locale; initialQuery: string };

const DEBOUNCE_MS = 250;

export default function SearchResults({ locale, initialQuery }: Props) {
  const t = useTranslations('search');
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();
  const tooShort = trimmed.length < MIN_QUERY_LENGTH;

  // Live search: debounce the query, abort in-flight requests on change. Skip
  // while the query is too short (the hint is shown instead).
  useEffect(() => {
    if (tooShort) return;
    const controller = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((d: { results?: SearchHit[]; total?: number }) => {
          setResults(d.results ?? []);
          setTotal(d.total ?? 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [trimmed, tooShort, locale]);

  return (
    <>
      <p className="mb-4 font-body text-label uppercase tracking-[0.2em] text-primary">
        {t('title')}
      </p>

      {/* Search field */}
      <div className="flex items-center gap-2 rounded-pill border border-strong bg-surface px-5 py-2 shadow-card">
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('title')}
          className="min-w-0 flex-1 bg-transparent py-2 font-body text-body text-dark outline-none placeholder:text-muted/70"
        />
        <span
          aria-hidden
          className="rounded-pill bg-primary px-5 py-2 font-body text-caption font-medium uppercase tracking-[0.06em] text-white"
        >
          {t('button')}
        </span>
      </div>

      {/* Status line */}
      <p className="mt-6 font-body text-body-sm text-muted">
        {tooShort
          ? t('minChars')
          : loading
            ? t('loading')
            : total === 0
              ? t('empty', { q: trimmed })
              : t('resultsFor', { count: total, q: trimmed })}
      </p>

      {/* Results */}
      {!tooShort && results.length > 0 && (
        <ul className="mt-8 space-y-7">
          {results.map((hit) => (
            <li key={hit.id} className="border-b border-border pb-7 last:border-0">
              <Link href={hit.path} className="group block">
                <h2 className="font-heading text-h4 text-dark transition-colors group-hover:text-primary">
                  {hit.titleHighlights.length ? renderHighlight(hit.titleHighlights[0]) : hit.title}
                </h2>
                <p className="mt-1.5 font-body text-body-sm leading-relaxed text-muted">
                  {hit.bodyHighlights.length
                    ? renderHighlight(hit.bodyHighlights.join(' … '))
                    : hit.bodyExcerpt}
                </p>
                <span className="mt-2 inline-block font-body text-fine uppercase tracking-[0.14em] text-light">
                  {hit.path}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
