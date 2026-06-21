import { type NextRequest, NextResponse } from 'next/server';
import { searchSite } from '@/lib/datocms/siteSearch';
import { isValidLocale } from '@/i18n/config';

/**
 * Server-side proxy for DatoCMS Site Search. Keeps the API token off the client
 * and centralizes the fetch-all + normalization. Live (no caching).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const localeParam = req.nextUrl.searchParams.get('locale') ?? 'en';
  const locale = isValidLocale(localeParam) ? localeParam : 'en';

  try {
    const data = await searchSite(q, locale);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ results: [], total: 0, error: 'search_failed' }, { status: 500 });
  }
}
