'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** Same WhatsApp Business number as the header + apartment detail CTA. */
const WHATSAPP_NUMBER = '393939070181';
const WHATSAPP_GREEN = '#25D366';

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01ZM12.05 20.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('prefill'))}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {/* Card — always mounted, toggled for a smooth open/close transition */}
      <div
        role="dialog"
        aria-label={t('title')}
        aria-hidden={!open}
        className={`w-72 origin-bottom-right overflow-hidden rounded-lg border border-border bg-surface shadow-card-hover transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 bg-primary px-4 py-3.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <WhatsAppGlyph className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-body-sm font-medium leading-tight text-white">
              {t('title')}
            </p>
            <p className="font-body text-caption text-white/70">{t('replyTime')}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('closeLabel')}
            className="-mr-1 shrink-0 p-1 text-white/60 transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-5">
          <p className="mb-4 max-w-[88%] rounded-lg rounded-tl-sm bg-surface-alt px-3.5 py-2.5 font-body text-body-sm leading-relaxed text-dark">
            {t('welcome')}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-pill px-5 py-3 font-body text-caption font-medium uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: WHATSAPP_GREEN }}
          >
            <WhatsAppGlyph className="h-4 w-4" />
            {t('cta')}
          </a>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('openLabel')}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-card-hover transition-transform duration-300 hover:scale-105 active:scale-95"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <WhatsAppGlyph className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
