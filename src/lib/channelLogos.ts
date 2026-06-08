import { stripStega } from 'react-datocms';

export type ChannelLogo = { src: string; alt: string };

const channelLogos: Record<string, ChannelLogo> = {
  booking: { src: '/booking-logo.svg', alt: 'Booking.com' },
  airbnb: { src: '/airbnb-logo.svg', alt: 'Airbnb' },
};

const defaultLogo: ChannelLogo = { src: '/acacia-isologo.svg', alt: 'Acacia Firenze' };

/**
 * Maps a Guestbook `channel` value (`booking` | `airbnb` | `acacia` | null) to
 * its review-platform logo, falling back to the Acacia isologo.
 *
 * `channel` is a DatoCMS string field, so in draft mode it carries stega-encoded
 * metadata — we `stripStega()` before the `.toLowerCase()` lookup so the match
 * doesn't silently fail behind the invisible Unicode markers.
 */
export function getChannelLogo(channel: string | null | undefined): ChannelLogo {
  const clean = stripStega(channel ?? '');
  if (!clean) return defaultLogo;
  return channelLogos[clean.toLowerCase()] ?? defaultLogo;
}
