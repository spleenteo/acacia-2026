'use client';

import { useState } from 'react';
import type { FragmentOf } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import type { FaqAnswerFragment } from './answerFragment';
import FaqStructuredText from './FaqStructuredText';
import CopyLinkButton from './CopyLinkButton';

export type AccordionItem = {
  id: string;
  question: string;
  answer: FragmentOf<typeof FaqAnswerFragment> | null;
  /** The leaf's own page URL (each leaf has a standalone page, used for sharing). */
  href: string;
};

type Props = {
  items: AccordionItem[];
  faqHrefById: Record<string, string>;
  locale: Locale;
};

/**
 * Mobile-first scannable accordion: tap a question to reveal its answer inline.
 * Used on a section node whose children are the actual questions (leaves).
 * Each item also has its own shareable page (CopyLinkButton).
 */
export default function FaqAccordion({ items, faqHrefById, locale }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <ul className="divide-y divide-border border-t border-border">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <li key={item.id}>
            <div className="flex items-center gap-2 py-5">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className={`min-w-0 flex-1 text-left font-heading text-h4 transition-colors ${
                  isOpen ? 'font-medium text-rust' : 'font-normal text-dark'
                }`}
              >
                {item.question}
              </button>
              <CopyLinkButton href={item.href} />
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-label={isOpen ? 'Chiudi' : 'Apri'}
                aria-expanded={isOpen}
                className={`shrink-0 text-h4 leading-none text-rust transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </button>
            </div>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] pb-10 opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <FaqStructuredText data={item.answer} faqHrefById={faqHrefById} locale={locale} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
