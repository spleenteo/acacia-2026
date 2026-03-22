import { getRequestConfig } from 'next-intl/server';
import { type Locale, isValidLocale } from './config';
import { fetchTranslations } from '@/lib/datocms/fetchTranslations';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const validLocale: Locale = locale && isValidLocale(locale) ? locale : 'en';

  return {
    locale: validLocale,
    messages: await fetchTranslations(validLocale),
  };
});
