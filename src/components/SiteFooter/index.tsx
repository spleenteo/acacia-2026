import type { Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  locale: Locale;
};

const exploreNavItems = [
  { href: '/florence/accommodations', key: 'accommodations' },
  { href: '/florence/districts', key: 'districts' },
  { href: '/moods', key: 'moods' },
] as const;

const infoNavItems = [
  { href: '#', key: 'aboutUs' },
  { href: '#', key: 'privacyPolicy' },
  { href: '#', key: 'faq' },
] as const;

export default async function SiteFooter({ locale }: Props) {
  const tNav = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  return (
    <footer>
      {/* Band 1 — Light navigation */}
      <div className="bg-surface-alt border-t border-border py-14">
        <div className="mx-auto max-w-6xl px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-5">
              {tFooter('explore')}
            </h4>
            <nav className="flex flex-col gap-3">
              {exploreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${localizedPath(locale, item.href)}`}
                  className="font-body text-body text-body hover:text-rust transition-colors duration-300"
                >
                  {tNav(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-5">
              {tFooter('info')}
            </h4>
            <nav className="flex flex-col gap-3">
              {infoNavItems.map((item) => (
                <Link
                  key={`${item.href}-${item.key}`}
                  href={item.href}
                  className="font-body text-body text-body hover:text-rust transition-colors duration-300"
                >
                  {tFooter(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-5">
              {tFooter('getInTouch')}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@acaciafirenze.com"
                className="font-body text-body text-body hover:text-rust transition-colors duration-300"
              >
                info@acaciafirenze.com
              </a>
              <a
                href="tel:+393939070181"
                className="font-body text-body text-body hover:text-rust transition-colors duration-300"
              >
                +39 393 9070181
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Band 2 — Dark brand + address */}
      <div className="bg-dark py-14">
        <div className="mx-auto max-w-6xl px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <span className="font-heading italic font-normal text-h4 text-white tracking-tight block mb-4">
              Acacia Firenze
            </span>
            <p className="font-body text-body text-white/80 leading-relaxed max-w-md">
              {tFooter('brandDescription')}
            </p>
          </div>

          <div>
            <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust/70 font-medium mb-5">
              {tFooter('address')}
            </h4>
            <address className="font-body text-body text-white/85 not-italic space-y-1.5">
              <p>Acacia Firenze</p>
              <p>DSM Srl</p>
              <p>Firenze, Italia</p>
            </address>
          </div>
        </div>
      </div>

      {/* Band 3 — Bottom bar */}
      <div className="bg-dark border-t border-white/10 py-5">
        <div className="mx-auto max-w-6xl px-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-body text-caption text-white/55">
            &copy; {new Date().getFullYear()} Acacia Firenze — P.IVA 07339190485
          </p>
          <p className="font-body text-caption text-white/40">Made with DatoCMS</p>
        </div>
      </div>
    </footer>
  );
}
