import type { Locale } from '@/i18n/config';

/**
 * Rotating prompt questions shown (typewriter) above the search input. These
 * are intentionally hardcoded (not from the CMS) and playful — they set the
 * "ask a real person" tone, no AI. Keep EN/IT in sync, ~10 each.
 */
export const SEARCH_PROMPTS: Record<Locale, string[]> = {
  en: [
    'In which mood are you visiting Florence?',
    'Looking for an apartment near the Duomo?',
    'How do I get there from the airport?',
    'Which district feels most like you?',
    'Travelling with your four-legged friend?',
    'Where do the locals get their gelato?',
    'Need a quiet corner to work from?',
    'Planning a family stay in the city?',
    'What should I see in San Frediano?',
    '…no AI here, keep it simple :)',
  ],
  it: [
    'Con quale mood visiti Firenze?',
    'Cerchi un appartamento vicino al Duomo?',
    'Come ci arrivo dall’aeroporto?',
    'Quale quartiere ti somiglia di più?',
    'Viaggi con il tuo amico a quattro zampe?',
    'Dove prendono il gelato i fiorentini?',
    'Ti serve un angolo tranquillo per lavorare?',
    'Stai organizzando un soggiorno in famiglia?',
    'Cosa vedo a San Frediano?',
    '…niente AI qui, semplice :)',
  ],
};
