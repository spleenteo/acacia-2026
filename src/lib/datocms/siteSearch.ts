import { buildClient } from '@datocms/cma-client';
import { MIN_QUERY_LENGTH, type SearchHit, type SearchResponse } from '@/lib/search/types';

/**
 * Server-side helper for DatoCMS Site Search. The crawler indexes the rendered
 * pages of the deployed site (see `frontend_url` on the search index); this
 * queries that index. Kept server-only — the token never reaches the browser
 * (the `/api/search` route handler is the public surface).
 *
 * Results carry absolute URLs on the crawled domain; we rewrite them to
 * relative paths so links resolve on whatever origin is serving the app
 * (including localhost).
 */

const INDEX_ID = process.env.DATOCMS_SITE_SEARCH_INDEX_ID;
const TOKEN = process.env.DATOCMS_CMA_TOKEN;

const PAGE_SIZE = 20;
const MAX_RESULTS = 100;

function toRelativePath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

/**
 * Full-text search across the crawled site for `query` in `locale`. Pages
 * through the Site Search API up to `MAX_RESULTS` so the caller can bucket and
 * count client-side. Returns empty for queries shorter than `MIN_QUERY_LENGTH`.
 */
export async function searchSite(query: string, locale: string): Promise<SearchResponse> {
  if (!INDEX_ID || !TOKEN) {
    throw new Error(
      'Site search is not configured (DATOCMS_SITE_SEARCH_INDEX_ID / DATOCMS_CMA_TOKEN)',
    );
  }

  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return { results: [], total: 0 };

  const client = buildClient({ apiToken: TOKEN });
  const results: SearchHit[] = [];
  // DatoCMS can't reliably detect per-page locale here, so the API `locale`
  // filter is a no-op (it returns both languages). Enforce the locale by the
  // result's URL prefix instead — bulletproof, since every page is `/{locale}/…`.
  const localePrefix = `/${locale}/`;
  let apiTotal = 0;

  for (let offset = 0; offset < MAX_RESULTS; offset += PAGE_SIZE) {
    const { data, meta } = await client.searchResults.rawList({
      filter: { query: q, search_index_id: INDEX_ID, locale, fuzzy: true },
      page: { limit: PAGE_SIZE, offset },
    });
    apiTotal = meta.total_count;

    for (const r of data) {
      const a = r.attributes;
      const path = toRelativePath(a.url);
      if (!path.startsWith(localePrefix)) continue;
      results.push({
        id: r.id,
        title: a.title ?? '',
        bodyExcerpt: a.body_excerpt ?? '',
        path,
        titleHighlights: a.highlight?.title ?? [],
        bodyHighlights: a.highlight?.body ?? [],
      });
    }

    if (data.length < PAGE_SIZE || offset + PAGE_SIZE >= apiTotal) break;
  }

  // `apiTotal` counts both languages; report the locale-filtered count actually
  // shown (exact for queries under the 100-result retrieval cap).
  return { results, total: results.length };
}
