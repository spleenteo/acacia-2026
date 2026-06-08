'use client';

import { useEffect, useState } from 'react';
import { type Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import type { ResultOf } from 'gql.tada';
import EditorialHero from '@/components/EditorialHero';
import EditorialListingLayout from '@/components/EditorialListingLayout';
import GuestbookCard from '@/components/GuestbookCard';
import type { query } from './page';

export type GuestbookProps = { locale: Locale };
type GuestbookData = ResultOf<typeof query>;

export default function GuestbookContent({
  locale,
  data,
}: GuestbookProps & { data: GuestbookData }) {
  const t = useTranslations('guestbook');
  const { pageGuestbook, allGuestbooks } = data;

  // Masonry that keeps date-DESC reading order left→right: round-robin the
  // reviews into N columns (item 0 → col 0, item 1 → col 1, item 2 → col 0…),
  // so the first row is the two newest, the next row the two after, and so on.
  // Columns drop to 1 below `sm` (single ordered stack). Default 2 for SSR so
  // first paint matches the desktop-first markup; the effect narrows on mobile.
  const [columnCount, setColumnCount] = useState(2);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setColumnCount(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const columns = Array.from({ length: columnCount }, (_, c) =>
    allGuestbooks.filter((_review, i) => i % columnCount === c),
  );

  return (
    <>
      {/* Hero — same treatment as the moods index: solid tone panel + animated
          diagonal, title + subtitle, no photo. */}
      <EditorialHero
        tone="gold"
        label={t('kicker')}
        title={pageGuestbook?.title ?? ''}
        subtitle={pageGuestbook?.subtitle}
        priority
      />

      {/* Content tucks up under the hero's diagonal on mobile. */}
      <div className="relative z-0 -mt-8 lg:mt-0">
        {/* Editorial rail (intro) on the left + reviews grid on the right. */}
        <EditorialListingLayout kicker={t('kicker')} intro={pageGuestbook?.intro}>
          {/* Masonry — natural-height cards in N ordered columns (see above). */}
          <div className="flex gap-6">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-1 flex-col gap-6">
                {col.map((review) => (
                  <GuestbookCard key={review.id} data={review} locale={locale} />
                ))}
              </div>
            ))}
          </div>
        </EditorialListingLayout>
      </div>
    </>
  );
}
