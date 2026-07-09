import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { faqPath, indexPageSlug, xDefault } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { toNextMetadata } from 'react-datocms/seo';
import type { Metadata } from 'next';
import {
  fetchFaqTree,
  rootNodes,
  childrenOfNode,
  nodeForPath,
  ancestorsOf,
  pathSlugsForNode,
  hasChildren,
  type FaqNavNode,
} from '@/lib/faq/faqTree';
import { FaqShortAnswerFragment, FaqLongAnswerFragment } from '@/components/Faq/answerFragment';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { IndexPageHeroFragment } from '@/components/EditorialHero/indexPageFragment';
import { type Crumb } from '@/components/Faq/FaqBreadcrumb';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import { SetAlternateLocalePaths } from '@/components/LocaleSwitcher/AlternateLocaleContext';
import FaqIndexContent from './FaqIndexContent';
import FaqNodeContent from './FaqNodeContent';

type Params = { locale: string; slug?: string[] };

export const indexQuery = graphql(
  `
    query FaqIndexQuery($locale: SiteLocale!, $slug: String!) {
      page: indexPage(locale: $locale, filter: { slug: { eq: $slug } }) {
        ...IndexPageHeroFragment
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment, IndexPageHeroFragment],
);

export const nodeQuery = graphql(
  `
    query FaqNodeQuery($locale: SiteLocale!, $id: ItemId!) {
      faq(locale: $locale, filter: { id: { eq: $id } }) {
        id
        question(locale: $locale)
        shortAnswer {
          ...FaqShortAnswer
        }
        longAnswer {
          ...FaqLongAnswer
        }
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [FaqShortAnswerFragment, FaqLongAnswerFragment, TagFragment],
);

export async function generateStaticParams() {
  const params: Params[] = [];
  for (const locale of locales) {
    const tree = await fetchFaqTree(locale, false);
    params.push({ locale, slug: [] });
    for (const node of tree.nodes) {
      params.push({ locale, slug: pathSlugsForNode(tree, node.id) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const { isEnabled } = await draftMode();
  const loc = locale as Locale;

  if (!slug || slug.length === 0) {
    const data = await executeQuery(indexQuery, {
      variables: { locale: loc, slug: indexPageSlug('/faq', loc) },
      includeDrafts: isEnabled,
    });
    const languages = Object.fromEntries(locales.map((l) => [l, faqPath(l, [])]));
    return {
      ...toNextMetadata(data.page?._seoMetaTags ?? []),
      alternates: {
        canonical: faqPath(loc, []),
        languages: { ...languages, ...xDefault(languages) },
      },
    };
  }

  const tree = await fetchFaqTree(loc, isEnabled);
  const node = nodeForPath(tree, slug);
  if (!node) return {};

  const data = await executeQuery(nodeQuery, {
    variables: { locale: loc, id: node.id },
    includeDrafts: isEnabled,
  });

  // Same record exists across locales with different slug chains → per-locale URLs.
  const languages: Record<string, string> = {};
  for (const l of locales) {
    const t = l === loc ? tree : await fetchFaqTree(l, isEnabled);
    if (t.byId.has(node.id)) languages[l] = faqPath(l, pathSlugsForNode(t, node.id));
  }

  return {
    ...toNextMetadata(data.faq?._seoMetaTags ?? []),
    alternates: {
      canonical: faqPath(loc, slug),
      languages: { ...languages, ...xDefault(languages) },
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const { isEnabled: includeDrafts } = await draftMode();

  // INDEX (/faq)
  if (!slug || slug.length === 0) {
    const [data, tree] = await Promise.all([
      executeQuery(indexQuery, {
        variables: { locale: loc, slug: indexPageSlug('/faq', loc) },
        includeDrafts,
      }),
      fetchFaqTree(loc, includeDrafts),
    ]);
    const roots = rootNodes(tree).map((r) => ({
      id: r.id,
      question: r.question,
      href: faqPath(loc, [r.slug]),
    }));

    if (includeDrafts) {
      return (
        <RealtimeWrapper
          contentComponent={FaqIndexContent}
          resolvedProps={{ roots }}
          query={indexQuery}
          variables={{ locale: loc, slug: indexPageSlug('/faq', loc) }}
          initialData={data}
          {...getDraftRealtimeOptions()}
        />
      );
    }
    return <FaqIndexContent roots={roots} data={data} />;
  }

  // NODE (/faq/...)
  const tree = await fetchFaqTree(loc, includeDrafts);
  const node = nodeForPath(tree, slug);
  if (!node) notFound();

  const variables = { locale: loc, id: node.id };
  const nodeData = await executeQuery(nodeQuery, { variables, includeDrafts });
  if (!nodeData.faq) notFound();

  const crumbs: Crumb[] = [{ label: 'FAQ', href: faqPath(loc, []) }];
  for (const a of ancestorsOf(tree, node.id)) {
    crumbs.push({ label: a.question, href: faqPath(loc, pathSlugsForNode(tree, a.id)) });
  }

  // Full FAQ tree (roots → leaves) for the docs-style side navigation.
  const buildNav = (nodeId: string): FaqNavNode => {
    const n = tree.byId.get(nodeId)!;
    return {
      id: n.id,
      question: n.question,
      href: faqPath(loc, pathSlugsForNode(tree, n.id)),
      children: childrenOfNode(tree, n.id).map((c) => buildNav(c.id)),
    };
  };
  const navTree = rootNodes(tree).map((r) => buildNav(r.id));
  const ancestorIds = ancestorsOf(tree, node.id).map((a) => a.id);

  // Map every faq node → its hierarchical URL, so inline links to FAQ records
  // (which need ancestry) resolve correctly inside the Structured Text renderer.
  const faqHrefById: Record<string, string> = Object.fromEntries(
    tree.nodes.map((n) => [n.id, faqPath(loc, pathSlugsForNode(tree, n.id))]),
  );

  const resolvedProps = {
    locale: loc,
    selfHref: faqPath(loc, slug),
    crumbs,
    navTree,
    activeId: node.id,
    ancestorIds,
    isLeaf: !hasChildren(tree, node.id),
    faqHrefById,
  };

  // Same-page URLs per locale for the language switcher. FAQ slug chains are
  // localized, so resolve each node by its stable ID in the other locale's tree;
  // fall back to the FAQ index where the node has no translation.
  const altPaths: Record<string, string> = {};
  for (const l of locales) {
    const t = l === loc ? tree : await fetchFaqTree(l, includeDrafts);
    altPaths[l] = t.byId.has(node.id) ? faqPath(l, pathSlugsForNode(t, node.id)) : faqPath(l, []);
  }

  return (
    <>
      <SetAlternateLocalePaths paths={altPaths} />
      {includeDrafts ? (
        <RealtimeWrapper
          contentComponent={FaqNodeContent}
          resolvedProps={resolvedProps}
          query={nodeQuery}
          variables={variables}
          initialData={nodeData}
          {...getDraftRealtimeOptions()}
        />
      ) : (
        <FaqNodeContent {...resolvedProps} data={nodeData} />
      )}
    </>
  );
}
