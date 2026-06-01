'use client';

import { useState } from 'react';
import type { FragmentOf } from '@/lib/datocms/graphql';
import type { FaqAnswerFragment } from './answerFragment';
import FaqStructuredText from './FaqStructuredText';

export type AccordionItem = {
  id: string;
  question: string;
  answer: FragmentOf<typeof FaqAnswerFragment> | null;
};

/**
 * Mobile-first scannable accordion: tap a question to reveal its answer inline.
 * Used on a section node whose children are the actual questions (leaves).
 */
export default function FaqAccordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <ul className="divide-y divide-border border-t border-border">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-heading text-h4 font-normal text-dark">{item.question}</span>
              <span
                aria-hidden
                className={`shrink-0 text-rust text-h4 leading-none transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <FaqStructuredText data={item.answer} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
