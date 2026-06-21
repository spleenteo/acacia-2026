'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/i18n/config';
import { localizedPath } from '@/i18n/paths';
import { SEARCH_PROMPTS } from '@/lib/search/searchPrompts';

type Props = {
  locale: Locale;
  className?: string;
};

/**
 * Reusable search entry point: a typewriter label cycling ~10 hardcoded
 * questions above an input + button. Submitting navigates to the dedicated
 * search page (`/{locale}/cerca?q=…`). Uses `window.location.assign` rather
 * than the router (Turbopack workaround). Drop it anywhere, passing the locale.
 */
export default function SearchBox({ locale, className }: Props) {
  const t = useTranslations('search');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [typing, setTyping] = useState(true);

  // Typewriter: type a prompt, hold, delete, advance to the next. Respects
  // reduced-motion by showing the first prompt statically.
  useEffect(() => {
    const prompts = SEARCH_PROMPTS[locale];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabel(prompts[0]);
      setTyping(false);
      return;
    }

    let promptIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = prompts[promptIdx];
      if (!deleting) {
        charIdx += 1;
        setLabel(current.slice(0, charIdx));
        if (charIdx === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
        } else {
          timer = setTimeout(tick, 45);
        }
      } else {
        charIdx -= 1;
        setLabel(current.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          promptIdx = (promptIdx + 1) % prompts.length;
          timer = setTimeout(tick, 350);
        } else {
          timer = setTimeout(tick, 24);
        }
      }
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [locale]);

  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    const base = `/${locale}${localizedPath(locale, '/search')}`;
    window.location.assign(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  return (
    <form onSubmit={submit} className={['mx-auto w-full max-w-2xl text-left', className].join(' ')}>
      {/* Typewriter label — the rotating questions */}
      <p aria-hidden className="mb-3 min-h-[1.6em] pl-1 font-heading text-h4 italic text-dark">
        {label}
        <span
          className={[
            'ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[2px] bg-primary align-middle',
            typing ? 'animate-pulse' : 'opacity-0',
          ].join(' ')}
        />
      </p>

      <div className="flex items-center gap-2 rounded-pill border border-strong bg-surface px-2 py-2 shadow-card">
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('title')}
          className="min-w-0 flex-1 bg-transparent px-4 py-2 font-body text-body text-dark outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          className="shrink-0 rounded-pill bg-primary px-6 py-2.5 font-body text-caption font-medium uppercase tracking-[0.06em] text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          {t('button')}
        </button>
      </div>
    </form>
  );
}
