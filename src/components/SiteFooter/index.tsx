import type { Locale } from '@/i18n/config';
import type { FooterColumn, SocialLink } from '@/app/[locale]/layout';
import { getAmenityIcon } from '@/lib/amenity-icons';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  locale: Locale;
  footerColumns: FooterColumn[];
  socialLinks: SocialLink[];
  legalText: unknown;
};

export default async function SiteFooter({ locale, footerColumns, socialLinks, legalText }: Props) {
  const tFooter = await getTranslations('footer');

  return (
    <footer>
      {/* Band 1 — Light navigation columns */}
      {footerColumns.length > 0 && (
        <div className="bg-surface-alt border-t border-border py-14">
          <div
            className="mx-auto max-w-6xl px-8 grid grid-cols-1 gap-12"
            style={{
              gridTemplateColumns: `repeat(${Math.min(footerColumns.length, 4)}, minmax(0, 1fr))`,
            }}
          >
            {footerColumns.map((column) => (
              <div key={column.widgetLabel} className="max-md:first:pt-0">
                <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium mb-5">
                  {column.widgetLabel}
                </h4>
                <nav className="flex flex-col gap-3">
                  {column.links.map((link) =>
                    link.isExternal ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-body hover:text-rust transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="font-body text-body hover:text-rust transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </nav>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Band 2 — Dark brand + social */}
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

          {socialLinks.length > 0 && (
            <div>
              <h4 className="font-body text-label uppercase tracking-[0.22em] text-rust/70 font-medium mb-5">
                {tFooter('followUs')}
              </h4>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = getAmenityIcon(social.iconName);
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="text-white/70 hover:text-rust transition-colors duration-300"
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Band 3 — Bottom bar */}
      <div className="bg-dark border-t border-white/10 py-5">
        <div className="mx-auto max-w-6xl px-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-body text-caption text-white/55">
            {typeof legalText === 'string'
              ? legalText
              : `© ${new Date().getFullYear()} Acacia Firenze — P.IVA 07339190485`}
          </p>
          <p className="font-body text-caption text-white/40">Made with DatoCMS</p>
        </div>
      </div>
    </footer>
  );
}
