'use client';

import { generateRealtimeComponent } from '@/lib/datocms/realtime/generateRealtimeComponent';
import type { ResultOf, VariablesOf } from 'gql.tada';
import ApartmentDetailContent, { type ApartmentDetailProps } from './ApartmentDetailContent';
import { apartmentDetailQuery } from './apartmentDetailQuery';

export const ApartmentDetailRealtime = generateRealtimeComponent<
  ApartmentDetailProps,
  ResultOf<typeof apartmentDetailQuery>,
  VariablesOf<typeof apartmentDetailQuery>
>({
  query: apartmentDetailQuery,
  contentComponent: ApartmentDetailContent,
});
