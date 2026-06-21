/**
 * Client-safe shared types/constants for site search. Kept separate from
 * `@/lib/datocms/siteSearch` (server-only, imports the CMA client + token) so
 * client components can reuse them without pulling server code into the bundle.
 */

export const MIN_QUERY_LENGTH = 3;

export type SearchHit = {
  id: string;
  title: string;
  bodyExcerpt: string;
  /** Relative path (origin stripped) so the link works on any host. */
  path: string;
  /** Highlight fragments with `[h]…[/h]` markers (rendered by `renderHighlight`). */
  titleHighlights: string[];
  bodyHighlights: string[];
  /** Clean SEO meta description (fetched per result) — preferred over the
   *  nav/footer-noisy `bodyExcerpt` for the preview line. */
  seoDescription?: string;
};

export type SearchResponse = { results: SearchHit[]; total: number };
