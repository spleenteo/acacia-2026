'use client';

import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
  widgetCode: string;
};

function applyDefaultDates(bar: Element): boolean {
  const ref = (bar as any)?.ngElementStrategy?.componentRef;
  const form = ref?.instance?.beddyBarForm;
  if (!form) return false;

  const arrival = new Date();
  arrival.setDate(arrival.getDate() + 3);
  const departure = new Date();
  departure.setDate(departure.getDate() + 5);

  form.get('trip').setValue({ startDate: arrival, endDate: departure });
  ref.changeDetectorRef.detectChanges();
  ref.instance.updateTripPreview?.();
  return true;
}

/**
 * Wrapper for the Beddy booking web component.
 * The <beddy-bar> custom element is registered by the CDN script loaded in the locale layout.
 * The Angular runtime adds its own attributes (_nghost, ng-version, id) to the element on the
 * client, causing a React hydration mismatch. suppressHydrationWarning on the wrapper div
 * tells React to skip reconciliation for this subtree.
 *
 * After mount, we poll for Angular initialization and then pre-set arrival = today+3,
 * departure = today+5 via the internal Angular form API (setValue + detectChanges).
 */
export default function BeddyBar({ locale, widgetCode }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const bar = wrapperRef.current?.querySelector('beddy-bar');
      if (bar && applyDefaultDates(bar)) {
        clearInterval(interval);
        return;
      }
      if (attempts >= 20) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={wrapperRef} suppressHydrationWarning>
      {/* @ts-expect-error — beddy-bar is a custom element not known to JSX */}
      <beddy-bar lang={locale} widgetcode={widgetCode} />
    </div>
  );
}
