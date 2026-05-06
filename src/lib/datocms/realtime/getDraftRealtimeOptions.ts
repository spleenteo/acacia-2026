import 'server-only';

/**
 * Default options for `<RealtimeWrapper>` in draft mode. Applied via spread in
 * every page.tsx that subscribes to real-time updates, so `contentLink`,
 * `baseEditingUrl`, `environment`, `token`, and the `excludeInvalid` /
 * `includeDrafts` flags stay in one place.
 *
 * Server-only because it reads `DATOCMS_DRAFT_CONTENT_CDA_TOKEN` and
 * `DATOCMS_BASE_EDITING_URL` from the server environment. The values are then
 * passed to the client component as props.
 */
export function getDraftRealtimeOptions() {
  const environment = process.env.DATOCMS_ENVIRONMENT || undefined;

  return {
    token: process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!,
    includeDrafts: true,
    excludeInvalid: true,
    contentLink: 'v1' as const,
    baseEditingUrl: `${process.env.DATOCMS_BASE_EDITING_URL}${
      environment ? `/environments/${environment}` : ''
    }`,
    environment,
  };
}
