import './global.css';
import { defaultLocale } from '@/i18n/config';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale ?? defaultLocale}>
      <body>{children}</body>
    </html>
  );
}
