import type en from '@/messages/en.json';
import type it from '@/messages/it.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en;
  }
}

type Extends<Sub extends Super, Super> = [Sub, Super];

// Fails `tsc` when a key exists in one language only. Not a .d.ts: `skipLibCheck` would skip it.
export type MessagesHaveSameKeys = [Extends<typeof en, typeof it>, Extends<typeof it, typeof en>];
