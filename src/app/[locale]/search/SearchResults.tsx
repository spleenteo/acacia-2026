'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/i18n/config';
import { renderHighlight } from '@/lib/highlightMarks';
import { MIN_QUERY_LENGTH, type SearchHit } from '@/lib/search/types';
import {
  getResultType,
  cleanTitle,
  SEARCH_TYPES,
  SEARCH_TYPE_LABEL_KEY,
  type SearchResultType,
} from '@/lib/search/searchType';

type Props = { locale: Locale; initialQuery: string };
type TypedHit = SearchHit & { type: SearchResultType | null };
type Filter = 'all' | SearchResultType;

const DEBOUNCE_MS = 250;

export default function SearchResults({ locale, initialQuery }: Props) {
  const t = useTranslations('search');
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const trimmed = query.trim();
  const tooShort = trimmed.length < MIN_QUERY_LENGTH;

  // Live search: debounce, abort in-flight on change. Skip while too short.
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

  // Keep the URL shareable: reflect the current query in `?q=` (replaceState,
  // no router — Turbopack-safe). The initial `?q=` is read server-side (page.tsx).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (trimmed.length >= MIN_QUERY_LENGTH) params.set('q', trimmed);
    else params.delete('q');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [trimmed]);

  // Bucket the (retrieved) results by type, derived from the URL — Site Search
  // has no native facets. Counts reflect the retrieved set (API caps at 100).
  const typed = useMemo<TypedHit[]>(
    () => results.map((r) => ({ ...r, type: getResultType(r.path) })),
    [results],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: typed.length };
    for (const ty of SEARCH_TYPES) c[ty] = 0;
    for (const r of typed) if (r.type) c[r.type] += 1;
    return c;
  }, [typed]);
  const visible = filter === 'all' ? typed : typed.filter((r) => r.type === filter);
  const activeTypes = SEARCH_TYPES.filter((ty) => counts[ty] > 0);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setFilter('all');
  };

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
          onChange={(e) => onQueryChange(e.target.value)}
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

      {/* Type filters + counters */}
      {!tooShort && typed.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-label uppercase tracking-[0.18em] text-light">
            {t('filterBy')}
          </span>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            {t('filterAll')} · {counts.all}
          </FilterChip>
          {activeTypes.map((ty) => (
            <FilterChip key={ty} active={filter === ty} onClick={() => setFilter(ty)}>
              {t(SEARCH_TYPE_LABEL_KEY[ty])} · {counts[ty]}
            </FilterChip>
          ))}
        </div>
      )}

      {/* Results */}
      {!tooShort && visible.length > 0 && (
        <ul className="mt-8 space-y-7">
          {visible.map((hit) => (
            <li key={hit.id} className="border-b border-border pb-7 last:border-0">
              <Link href={hit.path} className="group block">
                {hit.type && (
                  <p className="mb-1.5 font-body text-label uppercase tracking-[0.18em] text-rust">
                    {t(SEARCH_TYPE_LABEL_KEY[hit.type])}
                  </p>
                )}
                <h2 className="font-heading text-h4 text-dark transition-colors group-hover:text-primary">
                  {cleanTitle(hit.title)}
                </h2>
                {hit.seoDescription ? (
                  // Clean editor-written summary (no nav/footer noise).
                  <p className="mt-1.5 line-clamp-2 font-body text-body-sm leading-relaxed text-muted">
                    {hit.seoDescription}
                  </p>
                ) : hit.bodyHighlights.length > 0 ? (
                  <p className="mt-1.5 line-clamp-2 font-body text-body-sm leading-relaxed text-muted">
                    {renderHighlight(hit.bodyHighlights[0])}
                  </p>
                ) : null}
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-pill border px-4 py-1.5 font-body text-caption font-medium tracking-[0.04em] transition-colors',
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border text-muted hover:border-strong hover:text-dark',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
