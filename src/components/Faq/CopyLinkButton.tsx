'use client';

import { useState } from 'react';

/**
 * Copies the absolute, shareable URL of a FAQ page/leaf to the clipboard.
 * `href` is a locale-prefixed path (e.g. /it/faq/...); it is resolved against
 * the current origin so the copied link is ready to paste into WhatsApp/mail.
 */
export default function CopyLinkButton({ href, className }: { href: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = new URL(href, window.location.origin).href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Link copiato' : 'Copia link'}
      title={copied ? 'Link copiato!' : 'Copia link'}
      className={`shrink-0 rounded-full p-1.5 text-light transition-colors hover:text-primary hover:bg-primary-pale/60 ${className ?? ''}`}
    >
      {copied ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}
