import Link from 'next/link';

export type Crumb = { label: string; href: string };

/** Breadcrumb from the FAQ index down to the current node. Last item is current (not linked). */
export default function FaqBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-caption text-light">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-x-2">
              {isLast ? (
                <span className="text-muted">{c.label}</span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-primary">
                  {c.label}
                </Link>
              )}
              {!isLast && <span className="text-border select-none">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
