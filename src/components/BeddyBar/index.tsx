'use client';

import { useEffect, useRef, useState } from 'react';
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
 *
 * The element is mounted only AFTER React's StrictMode mount→unmount→remount probe has
 * settled (deferred via a double requestAnimationFrame). Mounting it directly in JSX makes
 * StrictMode insert and immediately destroy the Angular element mid-initialisation, which
 * throws "Cannot read properties of undefined (reading 'unsubscribe')" from its ngOnDestroy.
 * Deferring keeps the element out of the DOM during the probe, so it's only ever created once.
 * It's also client-only, so there's no SSR hydration mismatch.
 *
 * After mount, we poll for Angular initialization and then pre-set arrival = today+3,
 * departure = today+5 via the internal Angular form API (setValue + detectChanges).
 */
export default function BeddyBar({ locale, widgetCode }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Defer the custom element past StrictMode's mount→unmount→remount probe.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

  return (
    <div ref={wrapperRef} suppressHydrationWarning>
      {mounted && (
        <>
          {/* @ts-expect-error — beddy-bar is a custom element not known to JSX */}
          <beddy-bar lang={locale} widgetcode={widgetCode} />
        </>
      )}
    </div>
  );
}
