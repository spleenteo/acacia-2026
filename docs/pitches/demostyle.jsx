import { useState, useEffect, useRef } from 'react';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap';
const D = 'https://www.datocms-assets.com/454/';
const I = {
  logo: 'https://acaciafirenze.com/images/logo--main-d01e14a0.svg',
  hero: D + '1768054968-img_3363.jpeg?w=1600&h=800&fit=crop&crop=center&fm=jpg&q=78',
  breaker1: D + '1480775601-welcome.jpg?w=1600&h=600&fit=crop&crop=center&fm=jpg&q=75',
  breaker2: D + '1517392724-contest-nadia3683.jpg?w=1600&h=600&fit=crop&crop=center&fm=jpg&q=75',
  about:
    D +
    '1768181541-dfbc6bb1-9b16-441d-849b-af4482ac8857.png?w=600&h=600&fit=crop&crop=faces&fm=jpg&q=75',
  apts: [
    {
      name: 'Adelfa',
      tag: 'ELEGANZA E COMFORT',
      type: '2 Camere · Santa Croce',
      img: D + '1750230970-adelfa-vert-48.avif?w=700&h=520&fit=crop&fm=jpg&q=72',
    },
    {
      name: 'Artemisia',
      tag: 'GIARDINO PRIVATO',
      type: '4 Camere · Duomo',
      img: D + '1768060702-angelica-oriz-2-21.jpeg?w=700&h=520&fit=crop&fm=jpg&q=72',
    },
    {
      name: 'Flora',
      tag: 'VICINO A PONTE VECCHIO',
      type: '1 Camera · Oltrarno',
      img: D + '1725459811-img_1547_jpg.jpg?w=700&h=520&fit=crop&fm=jpg&q=72',
    },
  ],
  grid: [
    {
      name: 'Abaco',
      sub: 'Studio · Santa Croce',
      img: D + '1738005024-16-img_2257.jpg?w=600&h=440&fit=crop&fm=jpg&q=70',
    },
    {
      name: 'Agave',
      sub: 'Studio · Romantico',
      img: D + '1750231200-agave-oriz-18.avif?w=600&h=440&fit=crop&fm=jpg&q=70',
    },
    {
      name: 'Baobab',
      sub: '1 Camera · P.za Signoria',
      img: D + '1534173510-baobab-oriz-67.jpg?w=600&h=440&fit=crop&fm=jpg&q=70',
    },
    {
      name: 'Cumino',
      sub: '1 Camera · Vista',
      img: D + '1731005234-cumino-albero-natale.jpg?w=600&h=440&fit=crop&fm=jpg&q=70',
    },
  ],
  promise: [
    { img: D + '1603032519-1.jpg?w=700&h=500&fit=crop&fm=jpg&q=72' },
    { img: D + '1642076697-girasole-oriz-2.jpg?w=700&h=500&fit=crop&fm=jpg&q=72' },
    { img: D + '1543580292-bamboo-oriz-3.jpg?w=700&h=500&fit=crop&fm=jpg&q=72' },
  ],
};

// --- PALETTE: brighter rust, warmer darks, more color presence ---
const C = {
  bg: '#FDFBF8',
  bg2: '#F5F0E8',
  bg3: '#ECE6DB',
  dark: '#2E2822', // warm brown-black, not pure black
  text: '#2E2822',
  muted: '#847A6F',
  light: '#B0A698',
  rust: '#D0512A', // the new hero: bright warm rust
  rustHover: '#B8441F',
  rustSoft: '#E07A52',
  rustPale: '#FADDD2',
  rustDeep: '#9C3A1A',
  gold: '#D4A94B',
  card: '#FFFFFF',
  border: '#E5DDD2',
  borderLight: '#EFEADF',
};
const F = {
  h: "'Playfair Display', Georgia, serif",
  b: "'DM Sans', 'Helvetica Neue', sans-serif",
};

function useVis(t = 0.1) {
  const r = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.disconnect();
        }
      },
      { threshold: t },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return [r, v];
}
function Fade({ children, delay = 0, y = 28, style = {} }) {
  const [r, v] = useVis(0.08);
  return (
    <div
      ref={r}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? 'none' : `translateY(${y}px)`,
        transition: `opacity .75s cubic-bezier(.19,1,.22,1) ${delay}s, transform .75s cubic-bezier(.19,1,.22,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── NAV ── */
function Nav() {
  const [s, setS] = useState(false);
  useEffect(() => {
    const h = () => setS(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: s ? 'rgba(253,251,248,0.96)' : 'transparent',
        backdropFilter: s ? 'blur(20px)' : 'none',
        borderBottom: s ? `1px solid ${C.border}` : '1px solid transparent',
        padding: '0 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
        transition: 'all .4s',
      }}
    >
      <img src={I.logo} alt="Acacia" style={{ height: 26 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {['Appartamenti', 'Quartieri', 'Esperienze'].map((t) => (
          <NL key={t}>{t}</NL>
        ))}
        <div style={{ width: 1, height: 18, background: C.border }} />
        <NL small>IT / EN</NL>
        {/* CTA in rust, not black */}
        <button
          style={{
            fontFamily: F.b,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: '#fff',
            background: C.rust,
            border: 'none',
            padding: '11px 28px',
            borderRadius: 100,
            cursor: 'pointer',
            transition: 'background .25s',
          }}
          onMouseOver={(e) => (e.target.style.background = C.rustHover)}
          onMouseOut={(e) => (e.target.style.background = C.rust)}
        >
          Prenota
        </button>
      </div>
    </nav>
  );
}
function NL({ children, small }) {
  const [h, setH] = useState(false);
  return (
    <span
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: F.b,
        fontSize: small ? 12 : 14,
        fontWeight: 400,
        color: h ? C.rust : C.muted,
        cursor: 'pointer',
        transition: 'color .2s',
      }}
    >
      {children}
    </span>
  );
}

/* ── HERO ── */
function Hero() {
  return (
    <section style={{ position: 'relative', height: 620, overflow: 'hidden', marginTop: -72 }}>
      <img src={I.hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(46,40,34,0.12) 0%, rgba(46,40,34,0.62) 100%)',
        }}
      />
      <div style={{ position: 'absolute', bottom: 80, left: 56, maxWidth: 620 }}>
        <Fade delay={0.15}>
          <h1
            style={{
              fontFamily: F.h,
              fontSize: 56,
              fontWeight: 700,
              color: '#FDFBF8',
              lineHeight: 1.06,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            The most <em style={{ fontWeight: 500, fontStyle: 'italic' }}>authentic</em> way to stay
            in Florence.
          </h1>
        </Fade>
        <Fade delay={0.3}>
          <p
            style={{
              fontFamily: F.b,
              fontSize: 17,
              fontWeight: 300,
              color: 'rgba(253,251,248,0.75)',
              marginTop: 20,
              lineHeight: 1.55,
              maxWidth: 440,
            }}
          >
            A curated collection of homes with soul, in the city's most beloved neighborhoods.
          </p>
        </Fade>
        <Fade delay={0.45}>
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            {/* Primary CTA in rust */}
            <button
              style={{
                fontFamily: F.b,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: '#fff',
                background: C.rust,
                border: 'none',
                padding: '14px 36px',
                borderRadius: 100,
                cursor: 'pointer',
              }}
            >
              Esplora gli appartamenti
            </button>
            <button
              style={{
                fontFamily: F.b,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: '#FDFBF8',
                background: 'transparent',
                border: '1.5px solid rgba(253,251,248,0.4)',
                padding: '14px 28px',
                borderRadius: 100,
                cursor: 'pointer',
              }}
            >
              Come funziona
            </button>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── INTRO ── */
function Intro() {
  return (
    <section style={{ padding: '88px 56px 72px', background: C.bg, textAlign: 'center' }}>
      <Fade>
        <p
          style={{
            fontFamily: F.b,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.rust,
            marginBottom: 16,
          }}
        >
          Selezionati con cura dal 2015
        </p>
        <h2
          style={{
            fontFamily: F.h,
            fontSize: 42,
            fontWeight: 700,
            color: C.dark,
            lineHeight: 1.12,
            margin: '0 auto',
            maxWidth: 640,
            letterSpacing: '-0.02em',
          }}
        >
          Non ci accontentiamo del{' '}
          <em style={{ fontWeight: 500, fontStyle: 'italic' }}>quasi perfetto.</em>
        </h2>
        <p
          style={{
            fontFamily: F.b,
            fontSize: 16,
            fontWeight: 300,
            color: C.muted,
            lineHeight: 1.65,
            marginTop: 18,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Scegliamo personalmente ogni appartamento. Solo quelli che superano i nostri standard di
          stile, comfort e anima entrano nella collezione Acacia.
        </p>
        {/* Decorative rust line */}
        <div
          style={{
            width: 48,
            height: 3,
            background: C.rust,
            borderRadius: 2,
            margin: '28px auto 0',
          }}
        />
      </Fade>
    </section>
  );
}

/* ── FEATURED APARTMENTS ── */
function FeaturedApts() {
  return (
    <section style={{ padding: '0 56px 80px', background: C.bg }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
        {I.apts.map((a, i) => (
          <Fade key={i} delay={i * 0.1}>
            <BigCard a={a} />
          </Fade>
        ))}
      </div>
      <Fade delay={0.3}>
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <button
            style={{
              fontFamily: F.b,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: C.rust,
              background: 'transparent',
              border: `1.5px solid ${C.rust}`,
              padding: '13px 36px',
              borderRadius: 100,
              cursor: 'pointer',
              transition: 'all .25s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = C.rust;
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = C.rust;
            }}
          >
            Vedi tutti gli appartamenti
          </button>
        </div>
      </Fade>
    </section>
  );
}

function BigCard({ a }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: C.card,
        cursor: 'pointer',
        boxShadow: h ? '0 16px 48px rgba(46,40,34,0.1)' : '0 2px 12px rgba(46,40,34,0.04)',
        transform: h ? 'translateY(-4px)' : 'none',
        transition: 'all .4s cubic-bezier(.19,1,.22,1)',
      }}
    >
      <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        <img
          src={a.img}
          alt={a.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: h ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform .6s cubic-bezier(.19,1,.22,1)',
          }}
        />
        {/* Tag pill with rust background */}
        <div style={{ position: 'absolute', bottom: 18, left: 18 }}>
          <span
            style={{
              fontFamily: F.b,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: '#fff',
              background: C.rust,
              padding: '6px 16px',
              borderRadius: 100,
            }}
          >
            {a.tag}
          </span>
        </div>
      </div>
      <div style={{ padding: '22px 24px 26px' }}>
        <h3 style={{ fontFamily: F.h, fontSize: 24, fontWeight: 600, color: C.dark, margin: 0 }}>
          {a.name}
        </h3>
        <p
          style={{
            fontFamily: F.b,
            fontSize: 13,
            fontWeight: 400,
            color: C.muted,
            margin: '6px 0 0',
          }}
        >
          {a.type}
        </p>
        {/* Rust-colored link on hover */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <span
            style={{
              fontFamily: F.b,
              fontSize: 12,
              fontWeight: 500,
              color: h ? C.rust : C.muted,
              transition: 'color .25s',
              letterSpacing: '0.04em',
            }}
          >
            Scopri questo appartamento →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── BREAKER: full-width photo + overlay quote ── */
function Breaker({ img, quote, source }) {
  return (
    <section style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,40,34,0.5)' }} />
      <Fade
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        <h2
          style={{
            fontFamily: F.h,
            fontSize: 40,
            fontWeight: 700,
            color: '#FDFBF8',
            lineHeight: 1.15,
            margin: 0,
            maxWidth: 580,
          }}
        >
          {quote}
        </h2>
        {source && (
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Rust-colored decorative lines */}
            <div style={{ width: 40, height: 2, background: C.rustSoft, borderRadius: 1 }} />
            <span
              style={{
                fontFamily: F.b,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.rustSoft,
              }}
            >
              {source}
            </span>
            <div style={{ width: 40, height: 2, background: C.rustSoft, borderRadius: 1 }} />
          </div>
        )}
      </Fade>
    </section>
  );
}

/* ── PROMISE ── */
function Promise() {
  const items = [
    {
      icon: '✦',
      title: (
        <>
          Solo le case <em>migliori.</em>
        </>
      ),
      desc: 'Selezioniamo personalmente ogni appartamento. Solo quelli che ci convincono entrano nella collezione.',
    },
    {
      icon: '◆',
      title: (
        <>
          Accoglienza <em>personale.</em>
        </>
      ),
      desc: 'Vi accogliamo di persona, vi raccontiamo il quartiere e restiamo a disposizione per tutto il soggiorno.',
    },
    {
      icon: '●',
      title: (
        <>
          Firenze <em>autentica.</em>
        </>
      ),
      desc: 'Tour privati, corsi di cucina, botteghe artigiane. La Firenze che i fiorentini custodiscono per sé.',
    },
  ];
  return (
    <section style={{ padding: '88px 56px', background: C.bg2 }}>
      <Fade>
        <p
          style={{
            fontFamily: F.b,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.rust,
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          La promessa Acacia
        </p>
        <h2
          style={{
            fontFamily: F.h,
            fontSize: 40,
            fontWeight: 700,
            color: C.dark,
            lineHeight: 1.12,
            textAlign: 'center',
            marginBottom: 56,
            letterSpacing: '-0.02em',
          }}
        >
          Abbiamo fatto il lavoro{' '}
          <em style={{ fontWeight: 500, fontStyle: 'italic' }}>difficile</em> per voi.
        </h2>
      </Fade>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 }}>
        {items.map((it, i) => (
          <Fade key={i} delay={i * 0.12}>
            <div style={{ borderRadius: 18, overflow: 'hidden', background: C.card, padding: '0' }}>
              <img
                src={I.promise[i].img}
                alt=""
                style={{ width: '100%', height: 260, objectFit: 'cover' }}
              />
              <div style={{ padding: '28px 28px 32px' }}>
                {/* Rust icon marker */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.rustPale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: C.rust, fontSize: 14 }}>{it.icon}</span>
                </div>
                <h3
                  style={{
                    fontFamily: F.h,
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.dark,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontFamily: F.b,
                    fontSize: 14,
                    fontWeight: 300,
                    color: C.muted,
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {it.desc}
                </p>
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </section>
  );
}

/* ── EXPLORE GRID ── */
function Explore() {
  return (
    <section style={{ padding: '80px 56px', background: C.bg }}>
      <Fade>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 36,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: F.b,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: C.rust,
                marginBottom: 12,
              }}
            >
              Esplora la collezione
            </p>
            <h2
              style={{
                fontFamily: F.h,
                fontSize: 36,
                fontWeight: 700,
                color: C.dark,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Ogni casa, una <em style={{ fontWeight: 500, fontStyle: 'italic' }}>storia.</em>
            </h2>
          </div>
          {/* Rust underline link */}
          <span
            style={{
              fontFamily: F.b,
              fontSize: 13,
              fontWeight: 500,
              color: C.rust,
              cursor: 'pointer',
              borderBottom: `1.5px solid ${C.rustSoft}`,
              paddingBottom: 2,
            }}
          >
            Tutti gli alloggi →
          </span>
        </div>
      </Fade>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18 }}>
        {I.grid.map((g, i) => (
          <Fade key={i} delay={i * 0.08}>
            <GridCard g={g} />
          </Fade>
        ))}
      </div>
    </section>
  );
}
function GridCard({ g }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: 14 }}>
        <img
          src={g.img}
          alt={g.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: h ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform .5s cubic-bezier(.19,1,.22,1)',
          }}
        />
        {/* Subtle rust border on hover */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            border: h ? `2px solid ${C.rust}` : '2px solid transparent',
            transition: 'border-color .3s',
          }}
        />
      </div>
      <div style={{ padding: '14px 4px 0' }}>
        <h4 style={{ fontFamily: F.h, fontSize: 18, fontWeight: 600, color: C.dark, margin: 0 }}>
          {g.name}
        </h4>
        <p
          style={{
            fontFamily: F.b,
            fontSize: 12,
            fontWeight: 400,
            color: C.muted,
            margin: '3px 0 0',
          }}
        >
          {g.sub}
        </p>
      </div>
    </div>
  );
}

/* ── REVIEWS ── */
function Reviews() {
  const revs = [
    {
      text: 'The apartment was beautiful. So much character, an authentic sense of history. Beds were comfortable. Best thing is the location — incredible views.',
      author: 'Famiglia P.',
      src: 'Airbnb',
    },
    {
      text: 'This is the perfect stay. Central, beautiful, full of stuff to do and pretty quiet for the city center. The backyard is beautiful and huge.',
      author: 'Guest',
      src: 'Review',
    },
    {
      text: "One of the best places I've stayed. The apartment is huge and tastefully decorated to feel authentic to Italy. Fantastic location.",
      author: 'Sarah J.',
      src: 'Airbnb',
    },
  ];
  return (
    <section style={{ padding: '80px 56px', background: C.bg2 }}>
      <Fade>
        <h2
          style={{
            fontFamily: F.h,
            fontSize: 36,
            fontWeight: 700,
            color: C.dark,
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: '-0.02em',
          }}
        >
          I nostri ospiti <em style={{ fontWeight: 500, fontStyle: 'italic' }}>raccontano.</em>
        </h2>
      </Fade>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {revs.map((r, i) => (
          <Fade key={i} delay={i * 0.1}>
            <div
              style={{
                background: C.card,
                borderRadius: 16,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 220,
                borderTop: `3px solid ${C.rust}`,
              }}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} style={{ color: C.gold, fontSize: 14 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontFamily: F.b,
                  fontSize: 15,
                  fontWeight: 300,
                  color: C.text,
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                "{r.text}"
              </p>
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: F.b, fontSize: 13, fontWeight: 500, color: C.dark }}>
                  {r.author}
                </span>
                <span style={{ fontFamily: F.b, fontSize: 11, fontWeight: 400, color: C.light }}>
                  {r.src}
                </span>
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </section>
  );
}

/* ── ABOUT ── */
function About() {
  return (
    <section style={{ padding: '80px 56px', background: C.bg }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'center' }}
      >
        <Fade>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
            <img src={I.about} alt="" style={{ width: '100%', height: 440, objectFit: 'cover' }} />
            {/* Rust-colored accent bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: C.rust,
              }}
            />
          </div>
        </Fade>
        <Fade delay={0.15}>
          <div>
            <p
              style={{
                fontFamily: F.b,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: C.rust,
                marginBottom: 14,
              }}
            >
              Chi siamo
            </p>
            <h2
              style={{
                fontFamily: F.h,
                fontSize: 36,
                fontWeight: 700,
                color: C.dark,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Una famiglia, <em style={{ fontWeight: 500, fontStyle: 'italic' }}>tante storie.</em>
            </h2>
            <p
              style={{
                fontFamily: F.b,
                fontSize: 15,
                fontWeight: 300,
                color: C.muted,
                lineHeight: 1.7,
                marginTop: 20,
                maxWidth: 480,
              }}
            >
              Quando abbiamo fondato Acacia avevamo un'idea chiara: rendere semplice prenotare con
              fiducia. Qualità, comfort e ospitalità sono al cuore di tutto ciò che facciamo.
            </p>
            <p
              style={{
                fontFamily: F.b,
                fontSize: 15,
                fontWeight: 300,
                color: C.muted,
                lineHeight: 1.7,
                marginTop: 12,
                maxWidth: 480,
              }}
            >
              Selezioniamo solo gli appartamenti che ci convincono davvero — per stile, funzionalità
              e anima. Ed è per questo che molti ospiti tornano, anno dopo anno.
            </p>
            {/* Stats with rust numbers */}
            <div
              style={{
                display: 'flex',
                gap: 40,
                marginTop: 32,
                paddingTop: 28,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              {[
                { n: '25+', l: 'Appartamenti' },
                { n: '10+', l: 'Anni di esperienza' },
                { n: '12', l: 'Quartieri' },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    style={{
                      fontFamily: F.h,
                      fontSize: 32,
                      fontWeight: 700,
                      color: C.rust,
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontFamily: F.b,
                      fontSize: 12,
                      fontWeight: 400,
                      color: C.muted,
                      marginTop: 4,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <button
                style={{
                  fontFamily: F.b,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: '#fff',
                  background: C.rust,
                  border: 'none',
                  padding: '13px 32px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  transition: 'background .25s',
                }}
                onMouseOver={(e) => (e.target.style.background = C.rustHover)}
                onMouseOut={(e) => (e.target.style.background = C.rust)}
              >
                Scopri la nostra storia
              </button>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── NEWSLETTER ── */
function Newsletter() {
  return (
    <section style={{ padding: '72px 56px', background: C.bg3 }}>
      <Fade>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: F.h,
              fontSize: 32,
              fontWeight: 700,
              color: C.dark,
              margin: '0 0 12px',
            }}
          >
            Resta <em style={{ fontWeight: 500, fontStyle: 'italic' }}>ispirato.</em>
          </h2>
          <p
            style={{
              fontFamily: F.b,
              fontSize: 14,
              fontWeight: 300,
              color: C.muted,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Offerte esclusive, eventi in città e consigli per vivere Firenze come un fiorentino.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              background: C.card,
              borderRadius: 100,
              padding: '5px 5px 5px 24px',
              border: `1px solid ${C.border}`,
            }}
          >
            <input
              type="email"
              placeholder="La tua email"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontFamily: F.b,
                fontSize: 14,
                fontWeight: 300,
                color: C.dark,
                outline: 'none',
              }}
            />
            {/* Rust CTA */}
            <button
              style={{
                fontFamily: F.b,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: '#fff',
                background: C.rust,
                border: 'none',
                padding: '12px 28px',
                borderRadius: 100,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background .25s',
              }}
              onMouseOver={(e) => (e.target.style.background = C.rustHover)}
              onMouseOut={(e) => (e.target.style.background = C.rust)}
            >
              Iscriviti
            </button>
          </div>
        </div>
      </Fade>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer
      style={{ background: C.dark, padding: '60px 56px 36px', color: 'rgba(253,251,248,0.5)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}
      >
        <div>
          <img
            src={I.logo}
            alt="Acacia"
            style={{ height: 22, filter: 'brightness(10)', marginBottom: 18 }}
          />
          <p
            style={{
              fontFamily: F.b,
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.65,
              maxWidth: 280,
            }}
          >
            Una selezione curata di appartamenti nel cuore di Firenze. Ogni soggiorno, un'esperienza
            autentica.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {['Instagram', 'Facebook', 'Pinterest'].map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: F.b,
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'rgba(253,251,248,0.4)',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(253,251,248,0.15)',
                  paddingBottom: 2,
                  transition: 'color .2s',
                }}
                onMouseOver={(e) => (e.target.style.color = C.rustSoft)}
                onMouseOut={(e) => (e.target.style.color = 'rgba(253,251,248,0.4)')}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        {[
          { t: 'Scopri', items: ['Appartamenti', 'Quartieri', 'Esperienze', 'Offerte'] },
          { t: 'Info', items: ['Chi siamo', 'FAQ', 'Blog', 'Contatti'] },
          {
            t: 'Contatti',
            items: ['info@acaciafirenze.com', '+39 393 907 0181', 'Firenze, Italia'],
          },
        ].map((col) => (
          <div key={col.t}>
            <div
              style={{
                fontFamily: F.b,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(253,251,248,0.3)',
                marginBottom: 18,
              }}
            >
              {col.t}
            </div>
            {col.items.map((item) => (
              <div
                key={item}
                style={{
                  fontFamily: F.b,
                  fontSize: 13,
                  fontWeight: 300,
                  marginBottom: 12,
                  cursor: 'pointer',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Rust accent line above copyright */}
      <div
        style={{ width: 48, height: 2, background: C.rust, borderRadius: 1, marginBottom: 20 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: F.b,
          fontSize: 11,
          fontWeight: 300,
          color: 'rgba(253,251,248,0.25)',
        }}
      >
        <span>© 2026 Acacia Firenze — DSM Srl — P.IVA 07339190485</span>
        <span>
          made with <span style={{ color: C.rustSoft }}>DatoCMS</span>
        </span>
      </div>
    </footer>
  );
}

/* ── APP ── */
export default function AcaciaV4() {
  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      <style>{`* { margin: 0; box-sizing: border-box; } body { background: ${C.bg}; } ::selection { background: ${C.rust}; color: #fff; }`}</style>
      <div style={{ fontFamily: F.b, color: C.text, background: C.bg }}>
        <Nav />
        <Hero />
        <Intro />
        <FeaturedApts />
        <Breaker
          img={I.breaker1}
          quote={
            <>
              Non vorrai più tornare in{' '}
              <em style={{ fontWeight: 500, fontStyle: 'italic' }}>hotel.</em>
            </>
          }
          source="I nostri ospiti"
        />
        <Promise />
        <Explore />
        <Breaker
          img={I.breaker2}
          quote={
            <>
              Dove le tradizioni incontrano{' '}
              <em style={{ fontWeight: 500, fontStyle: 'italic' }}>l'arte e il gusto.</em>
            </>
          }
        />
        <Reviews />
        <About />
        <Newsletter />
        <Footer />
      </div>
    </>
  );
}
