'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import BeddyBar from '@/components/BeddyBar';
import WidgetLabel, { type Tone } from '@/components/WidgetLabel';

const TONES_LIST: Tone[] = ['rust', 'gold', 'sage', 'slate'];

type OpenOptions = { widgetCode?: string | null };
type BookingContextValue = { open: (opts?: OpenOptions) => void; close: () => void };

const BookingContext = createContext<BookingContextValue>({ open: () => {}, close: () => {} });

export function useBooking() {
  return useContext(BookingContext);
}

/** Static intro copy (not yet in DatoCMS). The booking portal is an external,
 *  trusted service that looks a little different from the rest of the site. */
const INTRO: Record<Locale, { kicker: string; title: string; body: string; close: string }> = {
  en: {
    kicker: 'Booking',
    title: 'Book your stay',
    body: 'You’re about to open our booking portal. It looks a little different from the rest of acaciafirenze.com because it’s an external service — one we know well and trust completely.',
    close: 'Close',
  },
  it: {
    kicker: 'Prenotazione',
    title: 'Prenota il tuo soggiorno',
    body: 'Stai per aprire il nostro portale di prenotazione. Avrà un aspetto leggermente diverso dal resto di acaciafirenze.com perché è un servizio esterno — che conosciamo bene e di cui ci fidiamo completamente.',
    close: 'Chiudi',
  },
};

type Props = {
  locale: Locale;
  /** Site-wide Beddy widget code (from the home page) used when no apartment-specific one is given. */
  defaultWidgetCode: string | null;
  children: React.ReactNode;
};

/**
 * Global booking modal. Any "Book" CTA calls useBooking().open() — without args
 * for the site-wide widget, or { widgetCode } for an apartment-specific one.
 * `mounted` keeps the dialog in the DOM through its exit transition; `shown`
 * drives the enter/leave animation a frame after mount.
 */
export function BookingProvider({ locale, defaultWidgetCode, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [widgetCode, setWidgetCode] = useState<string | null>(defaultWidgetCode);
  const [tone, setTone] = useState<Tone>('sage');

  const open = useCallback(
    (opts?: OpenOptions) => {
      setWidgetCode(opts?.widgetCode || defaultWidgetCode);
      // A random tone for the label chip each time the modal opens.
      setTone(TONES_LIST[Math.floor(Math.random() * TONES_LIST.length)]);
      setMounted(true);
    },
    [defaultWidgetCode],
  );

  const close = useCallback(() => setShown(false), []);

  // Animate in a frame after mounting; lock scroll and wire Esc while open.
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setShown(true));
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShown(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mounted]);

  // Unmount once the exit transition has finished.
  useEffect(() => {
    if (shown || !mounted) return;
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [shown, mounted]);

  const intro = INTRO[locale];

  return (
    <BookingContext.Provider value={{ open, close }}>
      {children}

      {mounted && (
        // The overlay is also the scroll container: centred when the card fits,
        // scrollable (min-h-full) when the Beddy widget is taller than the
        // viewport — e.g. its vertical layout on phones. Clicking it closes.
        <div
          onClick={close}
          className={`fixed inset-0 z-[70] overflow-y-auto bg-dark/60 backdrop-blur-sm transition-opacity duration-300 ${
            shown ? 'opacity-100' : 'opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={intro.title}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            {/* Card — width tracks Beddy's own 980px breakpoint: narrow (vertical
                bar) below, wide (horizontal bar) above. */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg overflow-hidden rounded-card bg-surface shadow-card-hover transition-all duration-300 min-[981px]:max-w-5xl ${
                shown
                  ? 'translate-y-0 scale-100 opacity-100'
                  : 'translate-y-4 scale-[0.97] opacity-0'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }}
            >
              {/* Close */}
              <button
                type="button"
                onClick={close}
                aria-label={intro.close}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-dark"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>

              {/* Intro */}
              <div className="px-6 pb-5 pt-9 text-center sm:px-10 sm:pt-11">
                <p className="mb-3">
                  <WidgetLabel tone={tone}>{intro.kicker}</WidgetLabel>
                </p>
                <h2 className="mb-4 font-heading italic text-h2 text-dark">{intro.title}</h2>
                <p className="mx-auto max-w-xl font-body text-body text-muted leading-relaxed">
                  {intro.body}
                </p>
              </div>

              {/* Beddy booking widget — Beddy picks horizontal/vertical by viewport */}
              <div className="px-5 pb-9 sm:px-8">
                {widgetCode && (
                  <BeddyBar key={widgetCode} locale={locale} widgetCode={widgetCode} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </BookingContext.Provider>
  );
}
