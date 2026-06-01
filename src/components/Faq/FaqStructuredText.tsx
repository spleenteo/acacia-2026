import { StructuredText } from 'react-datocms/structured-text';
import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import { FaqAnswerFragment } from './answerFragment';

type Props = {
  data: FragmentOf<typeof FaqAnswerFragment> | null | undefined;
};

/**
 * Renders a FAQ answer (Structured Text). Editorial body styling tuned for
 * mobile reading. Safe in server components (no interactivity).
 */
export default function FaqStructuredText({ data }: Props) {
  const answer = data ? readFragment(FaqAnswerFragment, data) : null;
  if (!answer?.value) return null;
  return (
    <div className="font-body text-body-lg text-body leading-relaxed [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-rust [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-rust-hover">
      <StructuredText data={answer} />
    </div>
  );
}
