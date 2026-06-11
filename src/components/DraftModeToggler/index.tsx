'use client';

import { useTranslations } from 'next-intl';

type Props = {
  draftModeEnabled: boolean;
};

/**
 * Discreet fixed control, bottom-left of every page. When draft mode is off it
 * lets an editor enable it from the browser by entering the SECRET_API_TOKEN;
 * when on, it shows a "draft" badge with a button to disable it. Both flows hit
 * the /api/draft-mode/* routes and reload so the new cookie takes effect.
 */
export default function DraftModeToggler({ draftModeEnabled }: Props) {
  const t = useTranslations('draftMode');

  async function disable() {
    const response = await fetch('/api/draft-mode/disable');
    if (!response.ok) {
      alert(t('error'));
      return;
    }
    document.location.reload();
  }

  async function enable() {
    const token = prompt(t('tokenPrompt'));
    if (!token) return;
    const response = await fetch(`/api/draft-mode/enable?token=${encodeURIComponent(token)}`);
    if (!response.ok) {
      alert(t('error'));
      return;
    }
    document.location.reload();
  }

  if (draftModeEnabled) {
    return (
      <div className="fixed bottom-4 left-4 z-[60] flex items-center gap-2.5 rounded-pill border border-white/15 bg-dark/90 px-3.5 py-2 text-white shadow-card-hover backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden />
        <span className="font-body text-fine uppercase tracking-[0.18em] text-white/60">Draft</span>
        <button
          type="button"
          onClick={disable}
          title={t('tooltipDisable')}
          className="font-body text-caption font-medium text-white transition-colors duration-200 hover:text-gold"
        >
          {t('disable')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      title={t('tooltipEnable')}
      className="fixed bottom-4 left-4 z-[60] rounded-pill border border-border bg-surface/80 px-3 py-1.5 font-body text-caption text-muted opacity-50 shadow-card backdrop-blur transition-all duration-200 hover:border-primary/40 hover:text-primary hover:opacity-100"
    >
      {t('enable')}
    </button>
  );
}
