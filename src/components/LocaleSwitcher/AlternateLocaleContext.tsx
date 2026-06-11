'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';

/** Per-locale URLs for "this same page in the other language". */
export type AlternateLocalePaths = Partial<Record<Locale, string>>;

type ContextValue = {
  paths: AlternateLocalePaths | null;
  setPaths: (paths: AlternateLocalePaths | null) => void;
};

const AlternateLocaleContext = createContext<ContextValue | null>(null);

/**
 * Provides the override slot read by `<LocaleSwitcher>`. Placed in the locale
 * layout so it wraps BOTH the page (`children`) and the footer — that's why a
 * page can publish its alternate URLs (via `<SetAlternateLocalePaths>`) and have
 * the footer switcher pick them up, even though the footer is a layout sibling.
 */
export function AlternateLocaleProvider({ children }: { children: ReactNode }) {
  const [paths, setPaths] = useState<AlternateLocalePaths | null>(null);
  return (
    <AlternateLocaleContext.Provider value={{ paths, setPaths }}>
      {children}
    </AlternateLocaleContext.Provider>
  );
}

/** Read the current page's alternate-locale URLs, or `null` if none published. */
export function useAlternateLocalePaths(): AlternateLocalePaths | null {
  return useContext(AlternateLocaleContext)?.paths ?? null;
}

/**
 * Rendered by pages whose slug is localized (mood, FAQ) to publish the correct
 * other-language URLs to the switcher. Resets on unmount so a later non-override
 * page falls back to the generic path transform.
 */
export function SetAlternateLocalePaths({ paths }: { paths: AlternateLocalePaths }) {
  const ctx = useContext(AlternateLocaleContext);
  // Stable dependency: the paths object identity changes every server render.
  const key = JSON.stringify(paths);
  useEffect(() => {
    ctx?.setPaths(paths);
    return () => ctx?.setPaths(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, key]);
  return null;
}
