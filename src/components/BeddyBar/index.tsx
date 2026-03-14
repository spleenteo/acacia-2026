import type { Locale } from '@/i18n/config';

type Props = {
  locale: Locale;
  widgetCode: string;
};

/**
 * Wrapper for the Beddy booking web component.
 * The <beddy-bar> custom element is registered by the CDN script loaded in the root layout.
 * Being a web component, it works in server components without hydration issues.
 */
export default function BeddyBar({ locale, widgetCode }: Props) {
  return (
    // @ts-expect-error — beddy-bar is a custom element not known to JSX
    <beddy-bar lang={locale} widgetcode={widgetCode} />
  );
}
