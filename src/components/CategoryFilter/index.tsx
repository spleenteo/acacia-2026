'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FragmentOf } from '@/lib/datocms/graphql';
import { ApartmentCardFragment } from '@/components/ApartmentCard';
import ApartmentCard from '@/components/ApartmentCard';
import type { Locale } from '@/i18n/config';

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
  };

  const filteredApartments = activeCategory
    ? apartments.filter((a) => a.categorySlug === activeCategory)
    : apartments;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`px-4 py-2 text-body-sm font-bold uppercase tracking-wider border transition-colors duration-300 cursor-pointer ${
            !activeCategory
              ? 'bg-rust text-white border-rust'
              : 'border-dark/20 text-dark hover:border-rust hover:text-rust'
          }`}
        >
          {t('allFilter')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.slug)}
            className={`px-4 py-2 text-body-sm font-bold uppercase tracking-wider border transition-colors duration-300 cursor-pointer ${
              activeCategory === cat.slug
                ? 'bg-rust text-white border-rust'
                : 'border-dark/20 text-dark hover:border-rust hover:text-rust'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
