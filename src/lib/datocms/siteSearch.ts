import { buildClient } from '@datocms/cma-client';
import { MIN_QUERY_LENGTH, type SearchHit, type SearchResponse } from '@/lib/search/types';
import { getResultType, type SearchResultType } from '@/lib/search/searchType';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';

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

// Words (per type) that, when typed, should pull results of that type up.
const TYPE_SYNONYMS: Record<SearchResultType, string[]> = {
  apartment: ['apartment', 'apartments', 'appartamento', 'appartamenti'],
  district: ['district', 'districts', 'quartiere', 'quartieri', 'neighbourhood', 'neighborhood'],
  mood: ['mood', 'moods'],
  faq: ['faq', 'faqs', 'question', 'questions', 'domanda', 'domande'],
  magazine: ['magazine', 'blog', 'article', 'articolo', 'post'],
};

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function queryTerms(q: string): string[] {
  return normalize(q)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

/**
 * Heuristic re-rank on top of DatoCMS's text score: reward matches in the
 * result's slug, title, and type label — the structured signals the page
 * crawler ignores (e.g. "duomo district" should surface the Duomo *district*,
 * whose slug is `duomo-firenze` and whose type is District, even though its
 * page body barely says "duomo"). Ties fall back to the DatoCMS order.
 */
function rankBoost(hit: SearchHit, terms: string[]): number {
  if (terms.length === 0) return 0;
  const lastSegment = decodeURIComponent(hit.path.split('/').filter(Boolean).pop() ?? '');
  const slug = normalize(lastSegment.replace(/-/g, ' '));
  const title = normalize(hit.title);
  const type = getResultType(hit.path);
  const typeWords = type ? TYPE_SYNONYMS[type] : [];

  // Coverage (how many distinct query terms the result satisfies) dominates;
  // field strength (slug > title > type) only breaks ties within the same
  // coverage. So "duomo district" ranks the Duomo *district* (covers both
  // terms) above an apartment that only matches "duomo" — even twice.
  let covered = 0;
  let strength = 0;
  for (const term of terms) {
    let matched = false;
    if (slug.includes(term)) {
      strength += 3;
      matched = true;
    }
    if (title.includes(term)) {
      strength += 2;
      matched = true;
    }
    if (typeWords.includes(term)) {
      strength += 2;
      matched = true;
    }
    if (matched) covered += 1;
  }
  return covered * 10 + strength;
}

// Per-result SEO descriptions, fetched in one batched CDA query (by slug, per
// type). Site Search only returns the nav/footer-noisy body excerpt, so we use
// the editor-written SEO description for a clean preview line instead.
const seoQuery = graphql(`
  query SearchSeoDescriptions(
    $locale: SiteLocale!
    $apt: [String]
    $dist: [String]
    $mood: [String]
    $post: [String]
    $faq: [String]
  ) {
    allApartments(locale: $locale, filter: { slug: { in: $apt } }) {
      slug
      seo {
        description
      }
      category {
        name(locale: $locale)
      }
      featuredImage {
        responsiveImage(imgixParams: { w: 240, h: 240, fit: crop }) {
          src
          alt
        }
      }
    }
    allDistricts(locale: $locale, filter: { slug: { in: $dist } }) {
      slug
      seo {
        description
      }
    }
    allMoods(locale: $locale, filter: { slug: { in: $mood } }) {
      slug
      seo {
        description
      }
    }
    allPosts(locale: $locale, filter: { slug: { in: $post } }) {
      slug
      seo {
        description
      }
      category {
        name(locale: $locale)
      }
    }
    allFaqs(locale: $locale, filter: { slug: { in: $faq } }) {
      slug
      seo {
        description
      }
    }
  }
`);

function lastSegment(path: string): string {
  return decodeURIComponent(path.split('/').filter(Boolean).pop() ?? '');
}

/** Attach the clean SEO description to each hit (by slug + type). Best-effort:
 *  on any failure the hits are returned unchanged (the UI falls back). */
async function attachSeoDescriptions(hits: SearchHit[], locale: string): Promise<SearchHit[]> {
  const byType: Record<SearchResultType, string[]> = {
    apartment: [],
    district: [],
    mood: [],
    faq: [],
    magazine: [],
  };
  for (const h of hits) {
    const type = getResultType(h.path);
    if (type) byType[type].push(lastSegment(h.path));
  }

  try {
    const data = await executeQuery(seoQuery, {
      variables: {
        locale: locale as Locale,
        apt: byType.apartment,
        dist: byType.district,
        mood: byType.mood,
        post: byType.magazine,
        faq: byType.faq,
      },
    });

    type Extra = Pick<SearchHit, 'seoDescription' | 'category' | 'image'>;
    const map = new Map<string, Extra>();
    const put = (type: SearchResultType, slug: string | null, extra: Extra) => {
      if (slug) map.set(`${type}:${slug}`, extra);
    };

    for (const r of data.allApartments) {
      const ri = r.featuredImage?.responsiveImage;
      put('apartment', r.slug, {
        seoDescription: r.seo?.description ?? undefined,
        category: r.category?.name ?? undefined,
        image: ri ? { src: ri.src, alt: ri.alt } : undefined,
      });
    }
    for (const r of data.allPosts) {
      put('magazine', r.slug, {
        seoDescription: r.seo?.description ?? undefined,
        category: r.category?.name ?? undefined,
      });
    }
    for (const r of data.allDistricts)
      put('district', r.slug, { seoDescription: r.seo?.description ?? undefined });
    for (const r of data.allMoods)
      put('mood', r.slug, { seoDescription: r.seo?.description ?? undefined });
    for (const r of data.allFaqs)
      put('faq', r.slug, { seoDescription: r.seo?.description ?? undefined });

    return hits.map((h) => {
      const type = getResultType(h.path);
      const extra = type ? map.get(`${type}:${lastSegment(h.path)}`) : undefined;
      return extra ? { ...h, ...extra } : h;
    });
  } catch (e) {
    console.error('[search] SEO enrich failed:', e);
    return hits;
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

  // Re-rank: boost slug/title/type matches over the raw page-text score, keeping
  // the DatoCMS order as the tiebreak (results arrive in score-desc order, so a
  // lower index = higher score).
  const terms = queryTerms(q);
  const ranked = results
    .map((hit, index) => ({ hit, index, boost: rankBoost(hit, terms) }))
    .sort((a, b) => b.boost - a.boost || a.index - b.index)
    .map((x) => x.hit);

  // Enrich with clean SEO descriptions for the preview line.
  const enriched = await attachSeoDescriptions(ranked, locale);

  // `apiTotal` counts both languages; report the locale-filtered count actually
  // shown (exact for queries under the 100-result retrieval cap).
  return { results: enriched, total: enriched.length };
}
