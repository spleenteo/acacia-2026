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
    <div className="text-center py-12">
      <p className="font-serif italic text-delta text-body-light mb-2">{labels[locale]}</p>
      <Link
        href={`/${locale}/florence/districts/${slug}`}
        className="font-heading font-extralight text-alpha text-heading hover:text-primary transition-colors duration-300"
      >
        {name}
      </Link>
      <div className="mx-auto mt-4 w-12 border-b-2 border-primary" />
    </div>
  );
}
