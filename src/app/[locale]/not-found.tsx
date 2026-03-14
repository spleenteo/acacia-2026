import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-5">
      <div className="text-center text-white max-w-lg">
        <p className="font-heading font-light text-rust tracking-[0.3em] text-body-sm uppercase mb-8">
          Acacia Firenze
        </p>

        <div className="font-heading font-light text-white/10 text-[180px] leading-none select-none mb-0">
          404
        </div>

        <h1 className="font-heading font-light text-h1 text-white -mt-4 mb-4">
          Pagina non trovata
          <span className="block text-white/40 text-body-lg font-heading italic font-normal mt-1">
            Page not found
          </span>
        </h1>

        <p className="font-heading italic text-body text-white/60 mb-2">
          L&apos;alloggio che cerchi non esiste o è stato rimosso.
        </p>
        <p className="font-heading italic text-body text-white/40 mb-12">
          The accommodation you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>

        <Link
          href="/"
          className="inline-block border border-white/40 text-white/80 text-body-sm uppercase tracking-widest px-8 py-3 hover:bg-white/10 hover:border-white/60 transition-all duration-300"
        >
          Torna alla home &nbsp;/&nbsp; Back to home
        </Link>
      </div>
    </div>
  );
}
