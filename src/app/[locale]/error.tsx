'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-heading flex items-center justify-center px-5">
      <div className="text-center text-white max-w-lg">
        <p className="font-heading font-extralight text-primary tracking-[0.3em] text-small uppercase mb-8">
          Acacia Firenze
        </p>

        <div className="font-heading font-extralight text-white/10 text-[180px] leading-none select-none mb-0">
          !
        </div>

        <h1 className="font-heading font-extralight text-alpha text-white -mt-4 mb-4">
          Qualcosa è andato storto
          <span className="block text-white/40 text-delta font-serif italic font-normal mt-1">
            Something went wrong
          </span>
        </h1>

        <p className="font-serif italic text-base text-white/60 mb-2">
          Si è verificato un errore imprevisto.
        </p>
        <p className="font-serif italic text-base text-white/40 mb-12">
          An unexpected error occurred.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="border border-primary/60 text-primary text-small uppercase tracking-widest px-8 py-3 hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            Riprova &nbsp;/&nbsp; Try again
          </button>
          <Link
            href="/"
            className="border border-white/40 text-white/80 text-small uppercase tracking-widest px-8 py-3 hover:bg-white/10 hover:border-white/60 transition-all duration-300"
          >
            ← Torna alla home &nbsp;/&nbsp; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
