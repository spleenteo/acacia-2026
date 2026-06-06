'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FragmentOf } from '@/lib/datocms/graphql';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import ApartmentCard from '@/components/ApartmentCard';
import { wonkyClip } from '@/lib/wonkyClip';
import { HERO_PIN_TOP_PX } from '@/lib/useHeroPin';
import { TONES } from '@/components/WidgetLabel';
import type { Locale } from '@/i18n/config';

/** Light Japan Fish tints, cycled across filters for the hover highlight. */
const FILTER_TINTS = [TONES.sage.bg, TONES.gold.bg, TONES.slate.bg, TONES.rust.bg];

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  apartments: {
    id: string;
    categorySlug: string;
    data: FragmentOf<typeof ApartmentCardFragment>;
  }[];
  locale: Locale;
  allLabel: string;
};

function CategoryFilterInner({ categories, apartments, locale }: Props) {
  const t = useTranslations('listing');
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'));
  const filtersRef = useRef<HTMLDivElement>(null);

  /**
   * After a filter change, glide the page to the point where the hero settles
   * into its pinned (sticky) position, so the freshly filtered grid sits right
   * below the collapsed hero band. Desktop only — the hero never pins below lg,
   * where we instead bring the filter bar just under the fixed header. The
   * threshold mirrors `useHeroPin` so we land exactly where it pins.
   */
  const scrollToHeroPin = () => {
    if (window.innerWidth >= 1024) {
      const hero = document.querySelector('[data-editorial-hero]');
      if (!hero) return;
      const heroTopDoc = hero.getBoundingClientRect().top + window.scrollY;
      const stickyTop = HERO_PIN_TOP_PX - 0.68 * window.innerHeight;
      window.scrollTo({ top: Math.max(0, heroTopDoc - stickyTop), behavior: 'smooth' });
    } else {
      const el = filtersRef.current;
      if (!el) return;
      const headerH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) ||
        64;
      const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const setCategory = (slug: string | null) => {
    setActiveCategory(slug);

    // Update URL without triggering navigation
    const params = new URLSearchParams(window.location.search);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);

    // Let the filtered grid commit first, then glide to the pinned-hero point.
    requestAnimationFrame(scrollToHeroPin);
  };

  const filteredApartments = activeCategory
    ? apartments.filter((a) => a.categorySlug === activeCategory)
    : apartments;

  return (
    <>
      <div ref={filtersRef} className="flex flex-wrap justify-start gap-x-1 gap-y-1 mb-10">
        {[
          { slug: null as string | null, label: t('allFilter') },
          ...categories.map((c) => ({ slug: c.slug, label: c.name })),
        ].map((item, i) => {
          const isActive = (item.slug ?? null) === (activeCategory ?? null);
          return (
            <button
              key={item.slug ?? '__all'}
              type="button"
              onClick={() => setCategory(item.slug)}
              className="group relative inline-flex items-center px-3 py-1.5 font-body text-body-sm font-normal tracking-wide cursor-pointer"
            >
              {/* Wonky-clip tint that wipes in on hover (and stays for the active filter). */}
              <span
                aria-hidden
                className={[
                  'pointer-events-none absolute -inset-x-1 -inset-y-0.5 transition-all duration-300',
                  isActive
                    ? 'scale-100 opacity-100'
                    : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100',
                ].join(' ')}
                style={{
                  backgroundColor: FILTER_TINTS[i % FILTER_TINTS.length],
                  clipPath: wonkyClip(i + 1),
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
              <span
                className={[
                  'relative transition-colors duration-300',
                  isActive ? 'text-dark font-medium' : 'text-muted group-hover:text-dark',
                ].join(' ')}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
        {filteredApartments.map((apartment) => (
          <ApartmentCard key={apartment.id} data={apartment.data} locale={locale} />
        ))}
      </div>

      {filteredApartments.length === 0 && (
        <p className="text-center text-light font-heading italic text-body-lg py-12">
          {t('noApartments')}
        </p>
      )}
    </>
  );
}

export default function CategoryFilter(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-6">
          {props.apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} data={apartment.data} locale={props.locale} />
          ))}
        </div>
      }
    >
      <CategoryFilterInner {...props} />
    </Suspense>
  );
}
