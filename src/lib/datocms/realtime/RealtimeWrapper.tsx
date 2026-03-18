'use client';

import type { ComponentType } from 'react';
import { type EnabledQueryListenerOptions, useQuerySubscription } from 'react-datocms';

/**
 * Generic client component that subscribes to DatoCMS Real-time Updates API.
 * Used in draft mode to provide live content updates without page reload.
 *
 * Receives the query, token, and initial data as props from the server component
 * (page.tsx), so no per-page client wrapper is needed.
 *
 * Variables are typed as `any` here because type safety is enforced at the call
 * site in the server component (page.tsx), where the query and variables are
 * already correctly typed by gql.tada.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RealtimeWrapper<ResolvedProps extends Record<string, unknown>, Result>({
  contentComponent: ContentComponent,
  resolvedProps,
  ...subscriptionOptions
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
EnabledQueryListenerOptions<Result, any> & {
  contentComponent: ComponentType<ResolvedProps & { data: Result }>;
  resolvedProps: ResolvedProps;
}) {
  const { data, error } = useQuerySubscription(subscriptionOptions);

  if (error) {
    return (
      <div>
        <pre>{error.code}</pre>: {error.message}
      </div>
    );
  }

  if (!data) return null;

  return <ContentComponent {...resolvedProps} data={data} />;
}
