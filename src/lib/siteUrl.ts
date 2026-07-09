/**
 * Canonical origin of the site (no trailing slash), from `NEXT_PUBLIC_SITE_URL`.
 * Single source of truth for absolute URLs (metadataBase, sitemap, robots,
 * JSON-LD): the localhost fallback keeps URLs well-formed in dev.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
