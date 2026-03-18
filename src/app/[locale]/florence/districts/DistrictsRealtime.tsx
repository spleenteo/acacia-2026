'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import DistrictsContent, { type DistrictsProps } from './DistrictsContent';
import { districtsQuery } from './districtsQuery';

export const DistrictsRealtime = generateRealtimeComponent<
  DistrictsProps,
  ResultOf<typeof districtsQuery>,
  VariablesOf<typeof districtsQuery>
>({
  query: districtsQuery,
  contentComponent: DistrictsContent,
});
