'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-5">
      <div className="text-center text-white max-w-lg">
        <p className="font-heading font-light text-rust tracking-[0.3em] text-body-sm uppercase mb-8">
          Acacia Firenze
        </p>

        <div className="font-heading font-light text-white/10 text-[180px] leading-none select-none mb-0">
          !
        </div>

        <h1 className="font-heading font-light text-h1 text-white -mt-4 mb-4">
          Qualcosa è andato storto
          <span className="block text-white/40 text-body-lg font-heading italic font-normal mt-1">
            Something went wrong
          </span>
        </h1>

        <p className="font-heading italic text-body text-white/60 mb-2">
          Si è verificato un errore imprevisto.
        </p>
        <p className="font-heading italic text-body text-white/40 mb-12">
          An unexpected error occurred.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="border border-rust/60 text-rust text-body-sm uppercase tracking-widest px-8 py-3 hover:bg-rust/10 hover:border-rust transition-all duration-300"
          >
            Riprova &nbsp;/&nbsp; Try again
          </button>
          <Link
            href="/"
            className="border border-white/40 text-white/80 text-body-sm uppercase tracking-widest px-8 py-3 hover:bg-white/10 hover:border-white/60 transition-all duration-300"
          >
            ← Torna alla home &nbsp;/&nbsp; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
