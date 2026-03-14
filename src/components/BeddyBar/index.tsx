import type { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
  widgetCode: string;
};

/**
 * Wrapper for the Beddy booking web component.
 * The <beddy-bar> custom element is registered by the CDN script loaded in the locale layout.
 * The Angular runtime adds its own attributes (_nghost, ng-version, id) to the element on the
 * client, causing a React hydration mismatch. suppressHydrationWarning on the wrapper div
 * tells React to skip reconciliation for this subtree.
 */
export default function BeddyBar({ locale, widgetCode }: Props) {
  return (
    <div suppressHydrationWarning>
      {/* @ts-expect-error — beddy-bar is a custom element not known to JSX */}
      <beddy-bar lang={locale} widgetcode={widgetCode} />
    </div>
  );
}
