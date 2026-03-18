'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import AccommodationsContent, { type AccommodationsProps } from './AccommodationsContent';
import { accommodationsQuery } from './accommodationsQuery';

export const AccommodationsRealtime = generateRealtimeComponent<
  AccommodationsProps,
  ResultOf<typeof accommodationsQuery>,
  VariablesOf<typeof accommodationsQuery>
>({
  query: accommodationsQuery,
  contentComponent: AccommodationsContent,
});
