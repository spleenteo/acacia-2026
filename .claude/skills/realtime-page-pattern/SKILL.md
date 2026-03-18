# Realtime Page Pattern

Pattern for creating or modifying pages with DatoCMS real-time draft preview in this project.

Use this skill when creating a new page, adding a query to an existing page, or modifying the realtime draft preview setup.

---

## The Pattern

Each page needs exactly **2 files**:

| File           | Role                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| `page.tsx`     | Server component: query, data fetching, metadata, static params, draft/published switch |
| `*Content.tsx` | Presentational component: receives resolved props + data, renders JSX                   |

Plus one **shared** component: `src/lib/datocms/realtime/RealtimeWrapper.tsx` (already exists, never duplicate).

---

## page.tsx Template

```tsx
import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale } from '@/i18n/config';
import { draftMode } from 'next/headers';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import PageContent, { type PageProps } from './PageContent';
// Import fragments from components as needed
// import { SomeFragment } from '@/components/SomeComponent';

// ── Meta query (for generateMetadata) ──
const metaQuery = graphql(
  `
    query PageMetaQuery($locale: SiteLocale!) {
      record(locale: $locale) {
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { isEnabled } = await draftMode();
  const data = await executeQuery(metaQuery, {
    variables: { locale: locale as Locale },
    includeDrafts: isEnabled,
  });
  return {
    ...toNextMetadata(data.record?._seoMetaTags ?? []),
    alternates: {
      canonical: `/${locale}/path`,
      languages: { en: '/en/path', it: '/it/path' },
    },
  };
}

// ── Main query (export for Content component type) ──
export const query = graphql(
  `
    query PageQuery($locale: SiteLocale!) {
      # ... fields
    }
  `,
  [
    /* fragments */
  ],
);

// ── Optional: generateStaticParams ──
// export async function generateStaticParams() { ... }

// ── Page component ──
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isEnabled: isDraftModeEnabled } = await draftMode();

  const variables = { locale: locale as Locale };
  const data = await executeQuery(query, {
    variables,
    includeDrafts: isDraftModeEnabled,
  });

  const resolvedProps: PageProps = { locale: locale as Locale };

  if (isDraftModeEnabled) {
    return (
      <RealtimeWrapper
        contentComponent={PageContent}
        resolvedProps={resolvedProps}
        token={process.env.DATOCMS_DRAFT_CONTENT_CDA_TOKEN!}
        query={query}
        variables={variables}
        initialData={data}
        includeDrafts={isDraftModeEnabled}
        excludeInvalid={true}
        contentLink="v1"
        baseEditingUrl={`${process.env.DATOCMS_BASE_EDITING_URL}${process.env.DATOCMS_ENVIRONMENT ? `/environments/${process.env.DATOCMS_ENVIRONMENT}` : ''}`}
        environment={process.env.DATOCMS_ENVIRONMENT || undefined}
      />
    );
  }

  return <PageContent {...resolvedProps} data={data} />;
}
```

---

## \*Content.tsx Template

```tsx
import type { ResultOf } from 'gql.tada';
import type { query } from './page';

export type PageProps = {
  locale: Locale;
  // Add extra resolved props here (e.g., secondary query results)
};

type PageData = ResultOf<typeof query>;

export default function PageContent({ locale, data }: PageProps & { data: PageData }) {
  // Destructure and render
  return <>{/* JSX */}</>;
}
```

---

## Rules

1. **Query is always inline in page.tsx** and exported as `export const query` so the Content component can import the type
2. **Content component never uses `'use client'`** — it's a regular component that works in both server and client contexts
3. **Content component imports the query type** via `import type { query } from './page'` and uses `ResultOf<typeof query>` for data typing
4. **RealtimeWrapper is never duplicated** — always import from `@/lib/datocms/realtime/RealtimeWrapper`
5. **RealtimeWrapper props are always the same** — token, query, variables, initialData, includeDrafts, excludeInvalid, contentLink, baseEditingUrl, environment
6. **Only the main query gets real-time updates** — secondary queries (reviews, similar items, etc.) are fetched server-side and passed via `resolvedProps`
7. **Detail pages with `notFound()`** — call `notFound()` between data fetch and render, before the draft mode check

## Detail Page with Multiple Queries

For pages that need secondary data (reviews, related items), fetch them in page.tsx and pass via resolvedProps:

```tsx
// In page.tsx
const mainData = await executeQuery(mainQuery, { variables, includeDrafts });
const secondaryData = await executeQuery(secondaryQuery, { variables: {...}, includeDrafts });

const resolvedProps: DetailProps = {
  locale,
  secondaryItems: secondaryData.items,
};

// Main query goes to RealtimeWrapper, secondary data goes in resolvedProps
if (isDraftModeEnabled) {
  return (
    <RealtimeWrapper
      contentComponent={DetailContent}
      resolvedProps={resolvedProps}
      query={mainQuery}   // only main query is subscribed
      initialData={mainData}
      // ...other props
    />
  );
}
```

## Schema Changes Workflow

When DatoCMS schema changes (fields added/removed/renamed):

1. `npm run generate-schema` — regenerate GraphQL schema from CDA
2. `npx gql.tada generate output` — regenerate TypeScript types
3. Find and fix broken queries in page.tsx files
4. `npx next build` — verify everything compiles
