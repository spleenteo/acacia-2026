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
      <div className="bg-cream py-12">
        <div className="mx-auto max-w-7xl px-5 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold uppercase text-small text-heading tracking-wider">
              {locale === 'en' ? 'Explore' : 'Esplora'}
            </h3>
            <nav className="flex flex-col gap-2">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="text-body-light text-small hover:text-primary transition-colors"
                >
                  {item.label[locale]}
                </Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold uppercase text-small text-heading tracking-wider">
              {locale === 'en' ? 'Contact' : 'Contatti'}
            </h3>
            <div className="text-body-light text-small space-y-1">
              <p>Acacia Firenze</p>
              <p>Florence, Italy</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-heading py-4 text-center">
        <p className="text-white text-milli">
          &copy; {new Date().getFullYear()} Acacia Firenze. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
