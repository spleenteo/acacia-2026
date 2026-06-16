import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { dastToText } from '@/lib/faq/dastText';
import { excerpt } from '@/lib/text/excerpt';
import Link from 'next/link';

/**
 * FAQ card for a mood's related content — a coloured box echoing the "in short"
 * panel on the FAQ node page (warm sand ground). Shows only the question and a
 * short-answer excerpt, with no image. The destination URL is resolved by the
 * caller from the FAQ tree (a single record doesn't know its ancestor chain).
 */
export const RelatedFaqCardFragment = graphql(`
  fragment RelatedFaqCardFragment on FaqRecord {
    id
    question
    shortAnswer {
      value
    }
  }
`);

type Props = {
  data: FragmentOf<typeof RelatedFaqCardFragment>;
  /** Full FAQ URL (root → node), resolved from the tree by the caller. */
  href: string;
};

export default function RelatedFaqCard({ data, href }: Props) {
  const faq = readFragment(RelatedFaqCardFragment, data);
  const answer = excerpt(dastToText(faq.shortAnswer?.value), 160);

  return (
    <Link
      href={href}
      className="group block rounded-card bg-surface-warm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-7"
    >
      <p className="mb-3 font-body text-label font-medium uppercase tracking-[0.18em] text-primary">
        FAQ
      </p>
      <h3 className="font-heading text-h4 font-normal leading-snug text-dark transition-colors group-hover:text-primary">
        {faq.question}
      </h3>
      {answer && (
        <p className="mt-3 line-clamp-4 font-body text-body-sm text-muted leading-relaxed">
          {answer}
        </p>
      )}
    </Link>
  );
}
