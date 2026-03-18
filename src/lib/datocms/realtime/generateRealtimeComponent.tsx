'use client';

import type { TadaDocumentNode } from 'gql.tada';
import type { ComponentType } from 'react';
import { type EnabledQueryListenerOptions, useQuerySubscription } from 'react-datocms';

/**
 * Generates a Client Component that subscribes to DatoCMS's Real-time Updates
 * API using the useQuerySubscription hook. When an editor saves a record in
 * DatoCMS, the component receives the updated data and re-renders automatically.
 */
export function generateRealtimeComponent<ResolvedProps, Result, Variables>({
  contentComponent: ContentComponent,
}: {
  query: TadaDocumentNode<Result, Variables>;
  contentComponent: NoInfer<ComponentType<ResolvedProps & { data: Result }>>;
}) {
  const RealtimeComponent: RealtimeComponentType<ResolvedProps, Result, Variables> = ({
    resolvedProps,
    ...subscriptionOptions
  }) => {
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
  };

  return RealtimeComponent;
}

export type RealtimeComponentType<ResolvedProps, Result, Variables> = ComponentType<
  EnabledQueryListenerOptions<Result, Variables> & {
    resolvedProps: ResolvedProps;
  }
>;
