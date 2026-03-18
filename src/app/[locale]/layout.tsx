import ContentLink from '@/components/ContentLink';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales, isValidLocale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { toNextMetadata } from 'react-datocms';
import Script from 'next/script';
import type { Metadata } from 'next';

const query = graphql(
  `
    query LayoutQuery {
      _site {
        faviconMetaTags {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraftModeEnabled } = await draftMode();
  const data = await executeQuery(query, { includeDrafts: isDraftModeEnabled });
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

  return (
    <>
      {!isDraftModeEnabled && (
        <Script
          src="https://cdn.beddy.io/bol/prod/beddybar.js?release13052020_v0"
          strategy="lazyOnload"
        />
      )}
      {isDraftModeEnabled && <ContentLink />}
      <SiteHeader locale={locale} isDraftModeEnabled={isDraftModeEnabled} />
      <main style={{ paddingTop: 'var(--header-height)' }}>{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
