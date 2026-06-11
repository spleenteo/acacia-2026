import ContentLink from '@/components/ContentLink';
import DraftModeToggler from '@/components/DraftModeToggler';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { HeaderThemeProvider } from '@/components/HeaderTheme';
import { AlternateLocaleProvider } from '@/components/LocaleSwitcher/AlternateLocaleContext';
import { BookingProvider } from '@/components/BookingModal';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql, type ResultOf } from '@/lib/datocms/graphql';
import { type Locale, locales, isValidLocale } from '@/i18n/config';
import { modelPath } from '@/i18n/paths';
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
          ... on MenuItemRecord {
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
            }
          }
          ... on MenuExternalItemRecord {
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
            ... on MenuItemRecord {
              __typename
              id
              label
              page {
                __typename
                # See navItems above — one interface fragment covers all members.
                ... on RecordInterface {
                  _modelApiKey
                }
              }
            }
            ... on MenuExternalItemRecord {
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
    page?: { _modelApiKey: string } | null;
  },
  locale: Locale,
): NavItem | null {
  if (item.__typename === 'MenuItemRecord') {
    if (!item.page || !item.label) return null;
    const href = modelPath(item.page._modelApiKey, '', locale);
    if (!href) return null;
    return { label: item.label, href, isExternal: false };
  }
  if (item.__typename === 'MenuExternalItemRecord') {
    if (!item.label || !item.url) return null;
    return { label: item.label, href: item.url, isExternal: true };
  }
  // MenuDropdownRecord and others — skipped
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

  return (
    <NextIntlClientProvider messages={messages}>
      {!isDraftModeEnabled && (
        <Script
          src="https://cdn.beddy.io/bol/prod/beddybar.js?release13052020_v0"
          strategy="lazyOnload"
        />
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
      <DraftModeToggler draftModeEnabled={isDraftModeEnabled} />
    </NextIntlClientProvider>
  );
}
