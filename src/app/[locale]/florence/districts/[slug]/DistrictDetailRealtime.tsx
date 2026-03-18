'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import DistrictDetailContent, { type DistrictDetailProps } from './DistrictDetailContent';
import { districtDetailQuery } from './districtDetailQuery';

export const DistrictDetailRealtime = generateRealtimeComponent<
  DistrictDetailProps,
  ResultOf<typeof districtDetailQuery>,
  VariablesOf<typeof districtDetailQuery>
>({
  query: districtDetailQuery,
  contentComponent: DistrictDetailContent,
});
