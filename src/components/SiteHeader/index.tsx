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
      <div className="mx-auto max-w-6xl flex items-center justify-between px-8 py-6">
        <Link href={`/${locale}`} className="block">
          <span className="font-heading italic font-semibold text-h4 text-white tracking-tight">
            Acacia Firenze
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="font-body text-body-sm font-normal text-white/80 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {item.label[locale]}
            </Link>
          ))}
          <span className="font-body text-caption font-normal text-white/50">
            {locale.toUpperCase()} /{' '}
            <Link
              href={`/${otherLocale}`}
              className="text-white/50 hover:text-white transition-colors duration-300"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </span>
          {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
        </nav>
      </div>
    </header>
  );
}
