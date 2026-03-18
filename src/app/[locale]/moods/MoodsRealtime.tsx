'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import MoodsContent, { type MoodsProps } from './MoodsContent';
import { moodsQuery } from './moodsQuery';

export const MoodsRealtime = generateRealtimeComponent<
  MoodsProps,
  ResultOf<typeof moodsQuery>,
  VariablesOf<typeof moodsQuery>
>({
  query: moodsQuery,
  contentComponent: MoodsContent,
});
