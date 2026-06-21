import Link from 'next/link';

/**
 * Creative 404 scene — a tourist lost in Florence, watercolor-styled
 * illustration with gentle animation. Shared by the root and locale
 * `not-found.tsx` so both matched-but-missing and unmatched URLs get it.
 * No locale context here, so the copy is bilingual.
 */
export default function NotFoundScene() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-warm px-6 py-16">
      <style>{`
        @keyframes nf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes nf-bob { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-7px) rotate(3deg)} }
        @keyframes nf-pulse { 0%,100%{opacity:.45;transform:scale(.94)} 50%{opacity:1;transform:scale(1)} }
        @keyframes nf-dash { to { stroke-dashoffset:-220 } }
        @keyframes nf-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media (prefers-reduced-motion: reduce){ [style*="nf-"]{animation:none!important} }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-sage)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-gold-soft)' }}
      />

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <svg
          viewBox="0 0 360 280"
          role="img"
          aria-label="A traveller lost in front of the Florence skyline"
          className="w-[320px] max-w-full sm:w-[400px]"
        >
          <defs>
            <filter id="nf-watercolor" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012"
                numOctaves="2"
                seed="7"
                result="n"
              />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
            </filter>
            <linearGradient id="nf-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a0cbad" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#a0cbad" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <ellipse
            cx="180"
            cy="232"
            rx="155"
            ry="30"
            fill="url(#nf-ground)"
            filter="url(#nf-watercolor)"
          />

          <g filter="url(#nf-watercolor)" opacity="0.92">
            <rect x="232" y="96" width="26" height="116" rx="3" fill="#e7d9c2" />
            <rect x="232" y="96" width="26" height="10" rx="3" fill="#c9b79a" />
            <rect x="120" y="150" width="96" height="62" rx="4" fill="#efe6d4" />
            <path d="M132 150 q36 -70 72 0 Z" fill="#c75b39" />
            <path
              d="M132 150 q36 -70 72 0"
              fill="none"
              stroke="#a8451f"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="168"
              y1="90"
              x2="168"
              y2="150"
              stroke="#a8451f"
              strokeWidth="1.5"
              opacity="0.4"
            />
            <rect x="161" y="74" width="14" height="16" rx="2" fill="#e7d9c2" />
            <circle cx="168" cy="70" r="4" fill="#ffaa4d" />
          </g>

          <path
            d="M70 236 C 110 210, 96 196, 138 200 S 176 232, 150 214"
            fill="none"
            stroke="#d53302"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 11"
            opacity="0.65"
            style={{ animation: 'nf-dash 9s linear infinite' }}
          />

          <g
            style={{
              animation: 'nf-float 5s ease-in-out infinite',
              transformOrigin: '120px 200px',
            }}
          >
            <g
              style={{
                animation: 'nf-pulse 2.4s ease-in-out infinite',
                transformOrigin: '150px 120px',
              }}
            >
              <circle cx="150" cy="120" r="18" fill="#fff" stroke="#dce6e6" />
              <circle cx="133" cy="140" r="4" fill="#fff" stroke="#dce6e6" />
              <text
                x="150"
                y="127"
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill="#d53302"
                fontFamily="Georgia, serif"
              >
                ?
              </text>
            </g>
            <rect x="106" y="196" width="6" height="20" rx="3" fill="#00012a" />
            <rect x="118" y="196" width="6" height="20" rx="3" fill="#00012a" />
            <path d="M100 168 q15 -10 30 0 l4 32 q-19 8 -38 0 Z" fill="#48182f" />
            <circle cx="115" cy="156" r="12" fill="#f0c9a8" />
            <path d="M101 152 q14 -16 28 0 Z" fill="#a0cbad" />
            <rect x="99" y="151" width="32" height="4" rx="2" fill="#8fb1be" />
            <g
              style={{
                animation: 'nf-bob 3.2s ease-in-out infinite',
                transformOrigin: '150px 184px',
              }}
            >
              <rect x="132" y="172" width="34" height="26" rx="2" fill="#fbf3e3" stroke="#dce6e6" />
              <line x1="143" y1="172" x2="143" y2="198" stroke="#dce6e6" />
              <line x1="155" y1="172" x2="155" y2="198" stroke="#dce6e6" />
              <path
                d="M136 186 q8 -6 16 2 t12 -2"
                fill="none"
                stroke="#d53302"
                strokeWidth="1.4"
                opacity="0.7"
              />
            </g>
            <rect x="88" y="200" width="20" height="15" rx="2" fill="#ffaa4d" />
            <rect x="95" y="196" width="6" height="5" rx="1" fill="#c9882f" />
          </g>
        </svg>

        <p
          className="mt-6 font-body text-label uppercase tracking-[0.24em] text-rust"
          style={{ animation: 'nf-rise .6s ease-out both' }}
        >
          404
        </p>
        <h1
          className="mt-2 font-heading text-h1 leading-tight text-dark"
          style={{ animation: 'nf-rise .6s ease-out .06s both' }}
        >
          Ti sei perso?
          <span className="mt-1 block font-heading text-h3 italic text-muted">
            Lost in Florence?
          </span>
        </h1>
        <p
          className="mt-5 max-w-md font-body text-body-lg leading-relaxed text-muted"
          style={{ animation: 'nf-rise .6s ease-out .12s both' }}
        >
          Hey, niente panico — la crew di Acacia ti riporta a casa.
          <span className="mt-1 block text-body text-muted/80">
            No worries — the Acacia® crew has your back.
          </span>
        </p>

        <Link
          href="/"
          className="mt-9 inline-flex items-center rounded-pill bg-primary px-9 py-3.5 font-body text-caption font-medium uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-primary-hover"
          style={{ animation: 'nf-rise .6s ease-out .18s both' }}
        >
          Torna alla home&nbsp;·&nbsp;Back home
        </Link>
      </div>
    </main>
  );
}
