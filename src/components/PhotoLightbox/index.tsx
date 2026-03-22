'use client';

import Lightbox, { useLightbox, type LightboxSlide } from '@/components/Lightbox';

type Props = {
  slides: LightboxSlide[];
  label: string;
  variant?: 'dark' | 'light';
};

export default function PhotoLightbox({ slides, label, variant = 'dark' }: Props) {
  const lightbox = useLightbox();

  if (slides.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => lightbox.openAt(0)}
        className={`inline-flex items-center gap-2 font-body text-body-sm font-medium tracking-wide px-5 py-2.5 rounded-pill border transition-all duration-300 cursor-pointer mt-5 ${
          variant === 'light'
            ? 'bg-surface-alt hover:bg-surface-warm text-dark border-border-light'
            : 'bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20'
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={variant === 'light' ? 'opacity-60' : 'opacity-80'}
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {label}
        <span
          className={`text-caption ml-0.5 ${variant === 'light' ? 'text-muted' : 'text-white/50'}`}
        >
          {slides.length}
        </span>
      </button>

      <Lightbox
        slides={slides}
        open={lightbox.open}
        index={lightbox.index}
        onClose={lightbox.close}
      />
    </>
  );
}
