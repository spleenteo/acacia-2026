'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type HeaderTheme = { overDark: boolean; setOverDark: (v: boolean) => void };

const HeaderThemeContext = createContext<HeaderTheme>({
  overDark: false,
  setOverDark: () => {},
});

/**
 * Tracks whether the current page renders a dark hero behind the fixed header.
 * Default is `false` (solid, light header) so any page without a dark hero —
 * incl. content pages with a white top — stays legible. Dark-hero pages opt in
 * by rendering <OverDarkHeader />.
 */
export function HeaderThemeProvider({ children }: { children: React.ReactNode }) {
  const [overDark, setOverDark] = useState(false);
  return (
    <HeaderThemeContext.Provider value={{ overDark, setOverDark }}>
      {children}
    </HeaderThemeContext.Provider>
  );
}

export function useHeaderOverDark(): boolean {
  return useContext(HeaderThemeContext).overDark;
}

/**
 * Rendered by a page whose hero is dark at the very top: the header becomes
 * transparent with white text until the user scrolls (then it turns solid like
 * everywhere else). Resets to the solid theme on unmount — React runs effect
 * cleanups before the next page's effects, so navigating between dark heroes
 * settles on `true`, and navigating to a light page settles on `false`.
 */
export function OverDarkHeader(): null {
  const { setOverDark } = useContext(HeaderThemeContext);
  useEffect(() => {
    setOverDark(true);
    return () => setOverDark(false);
  }, [setOverDark]);
  return null;
}
