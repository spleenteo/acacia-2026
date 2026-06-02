import './global.css';
import { Fraunces, Lato } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';
import type { Metadata } from 'next';

/**
 * Fonts are loaded via `next/font/google` (self-hosted, no layout shift) rather
 * than a CSS `@import` — Turbopack strips external `@import url()` rules from the
 * compiled stylesheet, so the webfonts never loaded and headings fell back to
 * Georgia. next/font also lets us pin Fraunces' variable axes.
 *
 * Fraunces — display serif. We load the `opsz` / `SOFT` / `WONK` axes so the
 * sharp Domaine-like cut (`'opsz' 144, 'SOFT' 0, 'WONK' 0`) actually applies,
 * plus italic for <em> emphasis.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale ?? defaultLocale} className={`${fraunces.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  );
}
