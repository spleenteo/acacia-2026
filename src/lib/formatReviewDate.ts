/**
 * Formats a review date as a localized "Month Year" (e.g. "January 2025" /
 * "gennaio 2025"). Shared by ReviewsList and GuestbookCard so the two never
 * drift. Accepts any locale string and falls back to en-GB for non-Italian.
 */
export function formatReviewDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
