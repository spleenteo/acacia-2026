import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { faqPath } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { toNextMetadata } from 'react-datocms';
import type { Metadata } from 'next';
import {
  fetchFaqTree,
  rootNodes,
  childrenOfNode,
  nodeForPath,
  ancestorsOf,
  pathSlugsForNode,
  siblingsOf,
  hasChildren,
} from '@/lib/faq/faqTree';
import { FaqAnswerFragment } from '@/components/Faq/answerFragment';
import { TagFragment } from '@/lib/datocms/commonFragments';
import { type Crumb } from '@/components/Faq/FaqBreadcrumb';
import RealtimeWrapper from '@/lib/datocms/realtime/RealtimeWrapper';
import { getDraftRealtimeOptions } from '@/lib/datocms/realtime/getDraftRealtimeOptions';
import FaqIndexContent from './FaqIndexContent';
import FaqNodeContent, { type ChildMeta } from './FaqNodeContent';

type Params = { locale: string; slug?: string[] };

export const indexQuery = graphql(
  `
    query FaqIndexQuery($locale: SiteLocale!) {
      pageFaq(locale: $locale) {
        title(locale: $locale)
        subtitle(locale: $locale)
        intro(locale: $locale)
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
      }
    }
  `,
  [TagFragment],
);

export const nodeQuery = graphql(
  `
    query FaqNodeQuery($locale: SiteLocale!, $id: ItemId!) {
      faq(locale: $locale, filter: { id: { eq: $id } }) {
        id
        question(locale: $locale)
        answerStructured {
          ...FaqAnswer
        }
        _seoMetaTags(locale: $locale) {
          ...TagFragment
        }
        children {
          id
          question(locale: $locale)
          answerStructured {
            ...FaqAnswer
          }
        }
      }
    }
  `,
  [FaqAnswerFragment, TagFragment],
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
      variables: { locale: loc },
      includeDrafts: isEnabled,
    });
    return {
      ...toNextMetadata(data.pageFaq?._seoMetaTags ?? []),
      alternates: {
        canonical: faqPath(loc, []),
        languages: Object.fromEntries(locales.map((l) => [l, faqPath(l, [])])),
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
    alternates: { canonical: faqPath(loc, slug), languages },
  };
}

export default async function FaqPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const { isEnabled: includeDrafts } = await draftMode();

  // INDEX (/faq)
  if (!slug || slug.length === 0) {
    const [data, tree] = await Promise.all([
      executeQuery(indexQuery, { variables: { locale: loc }, includeDrafts }),
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
          variables={{ locale: loc }}
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

  const children = childrenOfNode(tree, node.id);
  const childOrder: ChildMeta[] = children.map((c) => ({
    id: c.id,
    isLeaf: !hasChildren(tree, c.id),
    href: faqPath(loc, pathSlugsForNode(tree, c.id)),
    question: c.question,
  }));
  const childrenAllLeaves = children.length > 0 && childOrder.every((c) => c.isLeaf);

  const crumbs: Crumb[] = [{ label: 'FAQ', href: faqPath(loc, []) }];
  for (const a of ancestorsOf(tree, node.id)) {
    crumbs.push({ label: a.question, href: faqPath(loc, pathSlugsForNode(tree, a.id)) });
  }

  const siblings = siblingsOf(tree, node.id).map((s) => ({
    id: s.id,
    question: s.question,
    href: faqPath(loc, pathSlugsForNode(tree, s.id)),
  }));

  // Map every faq node → its hierarchical URL, so inline links to FAQ records
  // (which need ancestry) resolve correctly inside the Structured Text renderer.
  const faqHrefById: Record<string, string> = Object.fromEntries(
    tree.nodes.map((n) => [n.id, faqPath(loc, pathSlugsForNode(tree, n.id))]),
  );

  const resolvedProps = {
    locale: loc,
    crumbs,
    childOrder,
    childrenAllLeaves,
    siblings,
    faqHrefById,
  };

  if (includeDrafts) {
    return (
      <RealtimeWrapper
        contentComponent={FaqNodeContent}
        resolvedProps={resolvedProps}
        query={nodeQuery}
        variables={variables}
        initialData={nodeData}
        {...getDraftRealtimeOptions()}
      />
    );
  }
  return <FaqNodeContent {...resolvedProps} data={nodeData} />;
}
