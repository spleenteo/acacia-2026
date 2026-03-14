import DraftModeToggler from '@/components/DraftModeToggler';
import type { Locale } from '@/i18n/config';
import Link from 'next/link';

type Props = {
  locale: Locale;
  isDraftModeEnabled: boolean;
};

const nav = [
  { href: '/florence/accommodations', label: { en: 'Accommodations', it: 'Alloggi' } },
  { href: '/florence/districts', label: { en: 'Districts', it: 'Quartieri' } },
  { href: '/moods', label: { en: 'Moods', it: 'Moods' } },
];

export default function SiteHeader({ locale, isDraftModeEnabled }: Props) {
  const otherLocale = locale === 'en' ? 'it' : 'en';

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="bg-primary/70">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3">
          <Link href={`/${locale}`} className="block">
            <span className="bg-primary inline-block px-4 py-2 text-white font-body font-black text-delta tracking-wider uppercase">
              Acacia Firenze
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="text-white text-small font-bold uppercase tracking-wider hover:text-cream transition-colors"
              >
                {item.label[locale]}
              </Link>
            ))}
            <Link
              href={`/${otherLocale}`}
              className="text-white text-small font-bold uppercase tracking-wider border border-white/50 px-2 py-1 hover:bg-white/20 transition-colors"
            >
              {otherLocale.toUpperCase()}
            </Link>
            {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
          </nav>
        </div>
      </div>
    </header>
  );
}
