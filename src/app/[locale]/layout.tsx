import ContentLink from '@/components/ContentLink';
import DraftModeToggler from '@/components/DraftModeToggler';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import JsonLd from '@/components/JsonLd';
import { HeaderThemeProvider } from '@/components/HeaderTheme';
import { AlternateLocaleProvider } from '@/components/LocaleSwitcher/AlternateLocaleContext';
import { BookingProvider } from '@/components/BookingModal';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql, type ResultOf } from '@/lib/datocms/graphql';
import { type Locale, locales, isValidLocale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
import { SITE_URL } from '@/lib/siteUrl';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { toNextMetadata } from 'react-datocms/seo';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Script from 'next/script';
import type { Metadata } from 'next';

const query = graphql(
  `
    query LayoutQuery($locale: SiteLocale!) {
      _site {
        faviconMetaTags {
          ...TagFragment
        }
      }
      app {
        navItems(locale: $locale) {
          ... on MenuItemBlockRecord {
            __typename
            id
            label
            page {
              __typename
              # All page targets implement RecordInterface, so one fragment
              # covers every current and future member of the menu page union.
              ... on RecordInterface {
                _modelApiKey
              }
              # index_page is a collection — its slug selects which index route.
              ... on IndexPageRecord {
                slug
              }
            }
          }
          ... on MenuExternalItemBlockRecord {
            __typename
            id
            label
            url
          }
        }
        footerLinks(locale: $locale) {
          id
          widgetLabel
          navLinks {
            ... on MenuItemBlockRecord {
              __typename
              id
              label
              page {
                __typename
                # See navItems above — one interface fragment covers all members.
                ... on RecordInterface {
                  _modelApiKey
                }
                ... on IndexPageRecord {
                  slug
                }
              }
            }
            ... on MenuExternalItemBlockRecord {
              __typename
              id
              label
              url
            }
          }
        }
        socialLinks {
          id
          platform
          url
          iconName
        }
        legalText(locale: $locale, fallbackLocales: [en]) {
          value
        }
      }
      homePage {
        beddyId
      }
    }
  `,
  [TagFragment],
);

export type NavItem = {
  label: string;
  href: string;
  isExternal: boolean;
};

export type FooterColumn = {
  widgetLabel: string;
  links: NavItem[];
};

export type SocialLink = {
  platform: string;
  url: string;
  iconName: string;
};

type LayoutData = ResultOf<typeof query>;

function resolveMenuLink(
  item: {
    __typename?: string;
    label?: string | null;
    url?: string;
    page?: { _modelApiKey: string; slug?: string | null } | null;
  },
  locale: Locale,
): NavItem | null {
  if (item.__typename === 'MenuItemBlockRecord') {
    if (!item.page || !item.label) return null;
    // `index_page` records carry a slug that selects the index route; legacy
    // singleton targets ignore the slug (fixed path).
    const href = modelPath(item.page._modelApiKey, item.page.slug ?? '', locale);
    if (!href) return null;
    return { label: item.label, href, isExternal: false };
  }
  if (item.__typename === 'MenuExternalItemBlockRecord') {
    if (!item.label || !item.url) return null;
    return { label: item.label, href: item.url, isExternal: true };
  }
  // MenuDropdownBlockRecord and others — skipped
  return null;
}

function resolveNavItems(app: LayoutData['app'], locale: Locale): NavItem[] {
  if (!app) return [];
  return app.navItems
    .map((item) => resolveMenuLink(item, locale))
    .filter((item): item is NavItem => item !== null);
}

function resolveFooterColumns(app: LayoutData['app'], locale: Locale): FooterColumn[] {
  if (!app) return [];
  return app.footerLinks.map((block) => ({
    widgetLabel: block.widgetLabel,
    links: block.navLinks
      .map((item) => resolveMenuLink(item, locale))
      .filter((item): item is NavItem => item !== null),
  }));
}

function resolveSocialLinks(app: LayoutData['app']): SocialLink[] {
  if (!app) return [];
  return app.socialLinks.map((link) => ({
    platform: link.platform,
    url: link.url,
    iconName: link.iconName,
  }));
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();
  const data = await executeQuery(query, {
    variables: { locale: locale as Locale },
    includeDrafts: isDraftModeEnabled,
  });
  return toNextMetadata(data._site.faviconMetaTags);
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const { isEnabled: isDraftModeEnabled } = await draftMode();
  const data = await executeQuery(query, {
    variables: { locale },
    includeDrafts: isDraftModeEnabled,
  });
  const messages = await getMessages();
  const navItems = resolveNavItems(data.app, locale);
  const footerColumns = resolveFooterColumns(data.app, locale);
  const socialLinks = resolveSocialLinks(data.app);
  const legalText = data.app?.legalText?.value ?? null;

  // Sitewide Organization structured data. All values are static or `link`-type
  // URLs (socialLinks), so none carry stega — nothing to strip here.
  const organizationLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acacia Firenze',
    url: SITE_URL,
    logo: `${SITE_URL}/acacia-isologo.svg`,
    ...(socialLinks.length ? { sameAs: socialLinks.map((s) => s.url).filter(Boolean) } : {}),
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <JsonLd data={organizationLd} />
      {!isDraftModeEnabled && (
        <Script
          src="https://cdn.beddy.io/bol/prod/beddybar.js?release13052020_v0"
          strategy="lazyOnload"
        />
      )}
      {/* Iubenda Cookie Solution (consent banner) + embed (for the footer
          policy links to open in a modal). Same project ids as the legacy site. */}
      {!isDraftModeEnabled && (
        <>
          <Script id="iubenda-cs-config" strategy="afterInteractive">
            {`var _iub = _iub || [];
_iub.csConfiguration = {
  siteId: 306241,
  cookiePolicyId: 684676,
  lang: "${locale}",
  /* Site-owner decision (July 2026): GA4 analytics runs for every visitor —
     analytics_storage defaults to "granted" in <GoogleAnalytics> and is NOT
     downgraded here, so pageviews/engagement are counted even when a visitor
     rejects. The banner only governs ADVERTISING (purpose 5 → ad_*), which
     stays denied until explicitly accepted. NOTE: counting analytics without
     prior consent is a deliberate, owner-accepted tradeoff (not aligned with
     the Garante's GA4 cookie guidelines); re-add analytics_storage here and
     flip the default back to "denied" to restore the compliant behaviour. */
  callback: {
    onPreferenceExpressedOrNotNeeded: function (preference) {
      if (typeof gtag !== "function" || !preference || !preference.purposes) return;
      var ads = preference.purposes[5] ? "granted" : "denied";
      gtag("consent", "update", {
        ad_storage: ads,
        ad_user_data: ads,
        ad_personalization: ads,
      });
    },
  },
  /* Per-purpose consent so advertising can be granted on its own. */
  perPurposeConsent: true,
  /* Garante 2021: explicit accept/reject buttons; the X rejects. Governs
     advertising and the cookie policy — analytics is counted regardless. */
  banner: {
    acceptButtonDisplay: true,
    rejectButtonDisplay: true,
    customizeButtonDisplay: true,
    closeButtonRejects: true,
    position: "float-bottom-center",
  },
};`}
          </Script>
          {/* Standard (non-safemode) loader: safemode fetches the banner config
              saved on the Iubenda dashboard and ignores the local
              csConfiguration — which silently dropped the accept/reject
              buttons and the Consent Mode integration configured above. */}
          <Script src="https://cdn.iubenda.com/cs/iubenda_cs.js" strategy="afterInteractive" />
          <Script src="https://cdn.iubenda.com/iubenda.js" strategy="afterInteractive" />
        </>
      )}
      {isDraftModeEnabled && <ContentLink />}
      <AlternateLocaleProvider>
        <BookingProvider locale={locale} defaultWidgetCode={data.homePage?.beddyId ?? null}>
          <HeaderThemeProvider>
            <SiteHeader locale={locale} navItems={navItems} />
            <main style={{ paddingTop: 'var(--header-height)' }}>{children}</main>
          </HeaderThemeProvider>
          <SiteFooter
            locale={locale}
            footerColumns={footerColumns}
            socialLinks={socialLinks}
            legalText={legalText}
          />
        </BookingProvider>
      </AlternateLocaleProvider>
      {/* Only shown while draft mode is on (lets editors exit). The public site
          no longer shows an "enable draft" button. */}
      {isDraftModeEnabled && <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />}
      <WhatsAppWidget />
    </NextIntlClientProvider>
  );
}
