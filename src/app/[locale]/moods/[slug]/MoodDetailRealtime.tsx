'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import MoodDetailContent, { type MoodDetailProps } from './MoodDetailContent';
import { moodDetailQuery } from './moodDetailQuery';

export const MoodDetailRealtime = generateRealtimeComponent<
  MoodDetailProps,
  ResultOf<typeof moodDetailQuery>,
  VariablesOf<typeof moodDetailQuery>
>({
  query: moodDetailQuery,
  contentComponent: MoodDetailContent,
});
