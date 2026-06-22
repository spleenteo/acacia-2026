import Link from 'next/link';

type Props = {
  title: string;
  intro?: string | null;
  href: string;
  /** Localized "Explore" CTA label, resolved by the (translation-aware) parent. */
  cta: string;
};

/** Card linking to a FAQ section node (used for root phases and branch children). */
export default function FaqCard({ title, intro, href, cta }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-card border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-primary-pale"
    >
      <h3 className="font-heading text-h3 font-normal text-dark leading-snug transition-colors group-hover:text-primary">
        {title}
      </h3>
      {intro && <p className="mt-2 font-body text-body-sm text-muted leading-relaxed">{intro}</p>}
      <span className="mt-4 inline-flex items-center gap-1 font-body text-label uppercase tracking-[0.18em] text-primary font-medium">
        {cta}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
