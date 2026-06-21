import type { Locale } from '@/i18n/config';
import type { FooterColumn, SocialLink } from '@/app/[locale]/layout';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { SocialBrandIcon, SocialFallbackIcon, hasSocialIcon } from '@/lib/social-icons';

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
      {/* Band 1 — Light navigation columns (+ social as its own column) */}
      {(footerColumns.length > 0 || socialLinks.length > 0) && (
        <div className="bg-surface-alt border-t border-border py-14">
          <div
            className="mx-auto max-w-6xl px-8 grid grid-cols-1 gap-12"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                footerColumns.length + (socialLinks.length > 0 ? 1 : 0),
                4,
              )}, minmax(0, 1fr))`,
            }}
          >
            {footerColumns.map((column) => (
              <div key={column.widgetLabel} className="max-md:first:pt-0">
                <h4 className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium mb-5">
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
                        className="font-body text-body hover:text-primary transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="font-body text-body hover:text-primary transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </nav>
              </div>
            ))}

            {socialLinks.length > 0 && (
              <div className="max-md:first:pt-0">
                <h4 className="font-body text-label uppercase tracking-[0.22em] text-primary font-medium mb-5">
                  {tFooter('followUs')}
                </h4>
                <nav className="flex flex-col gap-3">
                  {socialLinks.map((social) => {
                    const iconKey = social.iconName || social.platform;
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 font-body text-body text-dark hover:text-primary transition-colors duration-300"
                      >
                        {hasSocialIcon(iconKey) ? (
                          <SocialBrandIcon name={iconKey} size={18} />
                        ) : (
                          <SocialFallbackIcon size={18} strokeWidth={1.5} />
                        )}
                        <span className="capitalize">{social.platform}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Band 2 — Dark brand */}
      <div className="bg-dark py-14">
        <div className="mx-auto max-w-6xl px-8">
          <span className="font-heading italic font-normal text-h4 text-white tracking-tight block mb-4">
            Acacia Firenze
          </span>
          <p className="font-body text-body text-white/80 leading-relaxed max-w-md">
            {tFooter('brandDescription')}
          </p>
        </div>
      </div>

      {/* Band 3 — Bottom bar */}
      <div className="bg-dark border-t border-white/10 py-5">
        <div className="mx-auto max-w-6xl px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-5">
            <p className="font-body text-caption text-white/55">
              {typeof legalText === 'string'
                ? legalText
                : `© ${new Date().getFullYear()} Acacia Firenze — P.IVA 07339190485`}
            </p>
            {/* Legal policies — Iubenda embed (opens in a modal), same id as the
                legacy acaciafirenze.com footer. */}
            <nav className="flex items-center gap-4">
              <a
                className="iubenda-nostyle no-brand iubenda-embed font-body text-caption text-white/55 transition-colors duration-300 hover:text-white"
                href="https://www.iubenda.com/privacy-policy/684676"
                title="Privacy Policy"
              >
                Privacy policy
              </a>
              <a
                className="iubenda-nostyle no-brand iubenda-embed font-body text-caption text-white/55 transition-colors duration-300 hover:text-white"
                href="https://www.iubenda.com/privacy-policy/684676/cookie-policy"
                title="Cookie Policy"
              >
                Cookie Policy
              </a>
            </nav>
          </div>
          <LocaleSwitcher locale={locale} variant="footer" />
        </div>
      </div>
    </footer>
  );
}
