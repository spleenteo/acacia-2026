'use client';

import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { stripStega } from 'react-datocms/stega';
import { useTranslations } from 'next-intl';
import ResponsiveImage from '@/components/ResponsiveImage';
import { PoiCardFragment } from './fragment';

type Props = {
  data: FragmentOf<typeof PoiCardFragment>;
};

type IconProps = { className?: string };

/** Location pin — precedes the "Acacia map for …" label. */
function PinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SunIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Instagram glyph — a visual cue next to the handle (no external link). */
function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// night_day drives the box tint (neutral / warm day / cool night). The moon+sun
// pair is always shown; the irrelevant one is dimmed.
const BOX: Record<string, string> = {
  anytime: 'bg-surface-alt',
  day: 'bg-surface-warm',
  night: 'bg-slate/20',
};

/**
 * POI card — a curated point of interest shown inside a mood's related content.
 * Top row: an "Acacia map for {category}" label (left) and the day/night indicator
 * (right, moon+sun with the active one lit + a label). Body: a framed thumbnail
 * beside the name, description and instagram handle. Only name + category are
 * guaranteed; thumbnail / instagram / description render only when present.
 */
export default function PoiCard({ data }: Props) {
  const t = useTranslations('poi');
  const poi = readFragment(PoiCardFragment, data);
  const image = poi.featuredImage;
  const thumb = image?.responsiveImage;
  const focal = image?.focalPoint;
  const objectPosition = focal ? `${focal.x * 100}% ${focal.y * 100}%` : undefined;
  // `category` is now a multi-link: a POI can sit in several categories. Join
  // their names for the "Acacia map for …" label.
  const categoryNames = (poi.category ?? []).map((c) => c.name).filter(Boolean);
  const category = categoryNames.length > 0 ? categoryNames.join(', ') : undefined;
  const moment = stripStega(poi.nightDay ?? 'anytime');

  const sunActive = moment === 'day' || moment === 'anytime';
  const moonActive = moment === 'night' || moment === 'anytime';
  const momentLabel =
    moment === 'day' ? t('dayTime') : moment === 'night' ? t('nightTime') : t('nightAndDay');

  return (
    <article className={`rounded-card p-6 ${BOX[moment] ?? BOX.anytime}`}>
      {/* Top row: map label (left) + day/night indicator (right) */}
      <div className="mb-5 flex items-start justify-between gap-4">
        {category && (
          <span className="flex min-w-0 items-center gap-2 text-primary">
            <PinIcon className="h-4 w-4 shrink-0" />
            <span className="truncate font-body text-label font-medium uppercase tracking-[0.16em] underline underline-offset-4">
              {t('mapFor', { category })}
            </span>
          </span>
        )}
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-2">
            <MoonIcon className={`h-5 w-5 ${moonActive ? 'text-dark' : 'text-dark/20'}`} />
            <SunIcon className={`h-5 w-5 ${sunActive ? 'text-dark' : 'text-dark/20'}`} />
          </div>
          <p className="mt-1 font-body text-caption text-muted">{momentLabel}</p>
        </div>
      </div>

      {/* Body: the thumbnail fills its column (object-cover on the focal point),
          beside the name / description / instagram. */}
      <div className="flex gap-5">
        {thumb && (
          <div className="relative w-24 shrink-0 self-stretch overflow-hidden rounded-sm sm:w-28">
            <ResponsiveImage
              data={thumb}
              pictureStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition }}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-h3 font-normal italic leading-tight text-dark">
            {poi.name}
          </h3>
          {poi.description && (
            <p className="mt-3 font-body text-body-sm text-dark">{poi.description}</p>
          )}
          {poi.instagram && (
            <p className="mt-4 flex items-center gap-1.5 font-body text-caption text-muted">
              <InstagramIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{poi.instagram}</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
