'use client';

import { useEffect, useRef } from 'react';

/**
 * Adds the `in-view` class to an element when it scrolls well into the viewport.
 *
 * rootMargin: '-30% 0px' means the observer only fires when the element
 * has crossed 30% inward from the bottom edge — so the user is already
 * looking in that area when the animation starts.
 */
export function useInView<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '-30% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
