import type { Locale } from '@/i18n/config';
import Link from 'next/link';

type Props = {
  name: string;
  slug: string;
  locale: Locale;
};

const labels = {
  en: 'Get lost in',
  it: 'Perditi a',
} as const;

export default function DistrictLink({ name, slug, locale }: Props) {
  return (
    <div className="text-center py-14 bg-surface-alt">
      <p className="font-body text-label uppercase tracking-[0.18em] text-muted font-medium mb-2">
        {labels[locale]}
      </p>
      <Link
        href={`/${locale}/florence/districts/${slug}`}
        className="font-heading text-h2 font-normal text-dark hover:text-rust transition-colors duration-300"
      >
        {name}
      </Link>
      <div className="mx-auto mt-5 w-12 h-[3px] bg-rust rounded-sm" />
    </div>
  );
}
