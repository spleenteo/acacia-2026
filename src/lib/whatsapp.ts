import { stripStega } from 'react-datocms/stega';

/**
 * WhatsApp Business contact, in the format wa.me expects: country code + number,
 * no '+' and no separators. Human-readable form: +39 055 244750.
 */
export const WHATSAPP_NUMBER = '39055244750';

/**
 * wa.me link for the site's WhatsApp Business number, optionally pre-filling the
 * first message. The text lands in a URL — outside the render path — so any stega
 * metadata picked up in draft mode is stripped before encoding.
 */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(stripStega(text))}` : base;
}
