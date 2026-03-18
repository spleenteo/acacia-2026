'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import HomeContent, { type HomeProps } from './HomeContent';
import { homeQuery } from './homeQuery';

export const HomeRealtime = generateRealtimeComponent<
  HomeProps,
  ResultOf<typeof homeQuery>,
  VariablesOf<typeof homeQuery>
>({
  query: homeQuery,
  contentComponent: HomeContent,
});
