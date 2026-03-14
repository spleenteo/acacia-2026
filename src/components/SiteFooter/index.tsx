import type { Locale } from '@/i18n/config';
import Link from 'next/link';

type Props = {
  locale: Locale;
};

const footerNav = [
  { href: '/florence/accommodations', label: { en: 'Accommodations', it: 'Alloggi' } },
  { href: '/florence/districts', label: { en: 'Districts', it: 'Quartieri' } },
  { href: '/moods', label: { en: 'Moods', it: 'Moods' } },
];

export default function SiteFooter({ locale }: Props) {
  return (
    <footer>
      <div className="bg-dark py-16">
        <div className="mx-auto max-w-6xl px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="font-heading italic font-semibold text-h4 text-white tracking-tight block mb-5">
              Acacia Firenze
            </span>
            <p className="font-body text-body-sm text-white/50 leading-relaxed">
              {locale === 'en'
                ? 'Curated apartments in the heart of Florence.'
                : 'Appartamenti selezionati nel cuore di Firenze.'}
            </p>
          </div>
          <div>
            <h4 className="font-body text-label uppercase tracking-[0.18em] text-white/40 font-medium mb-5">
              {locale === 'en' ? 'Explore' : 'Esplora'}
            </h4>
            <nav className="flex flex-col gap-3">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="font-body text-body-sm text-white/55 hover:text-rust transition-colors duration-300"
                >
                  {item.label[locale]}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="font-body text-label uppercase tracking-[0.18em] text-white/40 font-medium mb-5">
              {locale === 'en' ? 'Contact' : 'Contatti'}
            </h4>
            <div className="font-body text-body-sm text-white/55 space-y-1">
              <p>Acacia Firenze</p>
              <p>Florence, Italy</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-dark border-t border-white/10 py-5 text-center">
        <p className="font-body text-fine text-white/30">
          &copy; {new Date().getFullYear()} Acacia Firenze. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
