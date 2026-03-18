import type { TadaDocumentNode } from 'gql.tada';
import { draftMode } from 'next/headers';
import type { ComponentType } from 'react';
import { executeQuery } from '../executeQuery';
import type { RealtimeComponentType } from './generateRealtimeComponent';

/**
 * Generates a Next.js page component that:
 * - When Draft Mode is ON: fetches draft content and renders realtimeComponent (live updates)
 * - When Draft Mode is OFF: fetches published content and renders contentComponent (static)
 */
export function generatePageComponent<ResolvedProps, Result, Variables>({
  query,
  resolveProps,
  buildQueryVariables,
  contentComponent: ContentComponent,
  realtimeComponent: RealTimeComponent,
}: {
  query: TadaDocumentNode<Result, Variables>;
  resolveProps: (rawPageProps: unknown) => Promise<ResolvedProps> | ResolvedProps;
  buildQueryVariables?: (resolvedProps: ResolvedProps) => Variables;
  contentComponent: NoInfer<ComponentType<ResolvedProps & { data: Result }>>;
  realtimeComponent: NoInfer<RealtimeComponentType<ResolvedProps, Result, Variables>>;
}) {
  return async function Page(rawPageProps: unknown) {
    const { isEnabled: isDraftModeEnabled } = await draftMode();

    const resolvedProps = await resolveProps(rawPageProps);

    const variables = buildQueryVariables
      ? buildQueryVariables(resolvedProps)
      : ({} as Variables);

    const data = await executeQuery(query, {
      variables,
      includeDrafts: isDraftModeEnabled,
    });

    return isDraftModeEnabled ? (
      <RealTimeComponent
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={query}
        variables={variables}
        initialData={data}
        resolvedProps={resolvedProps}
        includeDrafts={isDraftModeEnabled}
        excludeInvalid={true}
        contentLink="v1"
        baseEditingUrl={`${process.env.DATOCMS_BASE_EDITING_URL}${process.env.DATOCMS_ENVIRONMENT ? `/environments/${process.env.DATOCMS_ENVIRONMENT}` : ''}`}
        environment={process.env.DATOCMS_ENVIRONMENT || undefined}
      />
    ) : (
      <ContentComponent {...resolvedProps} data={data} />
    );
  };
}
