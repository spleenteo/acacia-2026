'use client';

import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
  widgetCode: string;
};

/**
 * After the Angular element initialises, pre-set arrival = today+3,
 * departure = today+5 via its internal form API (setValue + detectChanges).
 */
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
 * Wrapper for the Beddy booking web component. The <beddy-bar> custom element
 * is registered by the CDN script loaded in the locale layout.
 *
 * The element is created and removed IMPERATIVELY (not via JSX), so React's
 * reconciliation never destroys/recreates it. Letting React manage it makes
 * StrictMode (and modal open/close) tear the Angular element down mid-init,
 * which throws "Cannot read properties of undefined (reading 'unsubscribe')"
 * from its ngOnDestroy and corrupts Beddy's singleton state — so the next
 * widget renders broken. Creation is deferred one frame so StrictMode's
 * mount→unmount→remount probe cancels before any element is created, and the
 * element is built exactly once per mount.
 */
export default function BeddyBar({ locale, widgetCode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let bar: HTMLElement | null = null;
    let interval: ReturnType<typeof setInterval> | undefined;

    const raf = requestAnimationFrame(() => {
      if (cancelled || !container) return;
      bar = document.createElement('beddy-bar');
      bar.setAttribute('lang', locale);
      bar.setAttribute('widgetcode', widgetCode);
      container.appendChild(bar);

      let attempts = 0;
      interval = setInterval(() => {
        attempts++;
        if (bar && applyDefaultDates(bar)) {
          clearInterval(interval);
          return;
        }
        if (attempts >= 20) clearInterval(interval);
      }, 500);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (interval) clearInterval(interval);
      bar?.parentNode?.removeChild(bar);
    };
  }, [locale, widgetCode]);

  return <div ref={containerRef} suppressHydrationWarning />;
}
