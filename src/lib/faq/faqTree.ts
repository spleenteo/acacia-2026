import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import type { Locale } from '@/i18n/config';
import { faqPath } from '@/i18n/paths';

/**
 * The FAQ section is a single tree of `faq` records (DatoCMS `tree: true`).
 * Roots are the lifecycle phases (PRIMA / DURANTE / DOPO); children nest freely.
 *
 * Rather than rely on fixed-depth GraphQL nesting, we fetch the whole tree FLAT
 * (id + localized slug + parent id) and reconstruct it in JS. This one structure
 * feeds: catch-all path resolution, breadcrumb, siblings, sitemap, staticParams.
 */
const faqStructureQuery = graphql(`
  query FaqStructure($locale: SiteLocale!) {
    allFaqs(locale: $locale, first: 500, orderBy: position_ASC) {
      id
      slug
      question
      position
      parent {
        id
      }
    }
  }
`);

export type FaqStructureNode = {
  id: string;
  slug: string;
  question: string;
  position: number;
  parentId: string | null;
};

export type FaqTree = {
  nodes: FaqStructureNode[];
  byId: Map<string, FaqStructureNode>;
  childrenOf: Map<string | null, FaqStructureNode[]>;
};

/**
 * Serializable nested tree handed to the docs-style side navigation
 * (`FaqSideNav`). Each node carries its localized question + resolved URL so the
 * client component can render the whole phase tree without re-querying.
 */
export type FaqNavNode = {
  id: string;
  question: string;
  href: string;
  children: FaqNavNode[];
};

/** Fetch the flat FAQ structure for a locale and reconstruct the tree. */
export async function fetchFaqTree(locale: Locale, includeDrafts: boolean): Promise<FaqTree> {
  const data = await executeQuery(faqStructureQuery, {
    variables: { locale: locale as Locale },
    includeDrafts,
  });

  const nodes: FaqStructureNode[] = (data.allFaqs ?? []).map((f) => ({
    id: f.id,
    // slug is a slug-type field → never carries stega, safe to use raw
    slug: f.slug ?? '',
    question: f.question ?? '',
    position: f.position ?? 0,
    parentId: f.parent?.id ?? null,
  }));

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const childrenOf = new Map<string | null, FaqStructureNode[]>();
  for (const n of nodes) {
    const key = n.parentId;
    const list = childrenOf.get(key) ?? [];
    list.push(n);
    childrenOf.set(key, list);
  }
  for (const list of childrenOf.values()) list.sort((a, b) => a.position - b.position);

  return { nodes, byId, childrenOf };
}

/** Root nodes (the lifecycle phases), ordered by position. */
export function rootNodes(tree: FaqTree): FaqStructureNode[] {
  return tree.childrenOf.get(null) ?? [];
}

export function childrenOfNode(tree: FaqTree, nodeId: string): FaqStructureNode[] {
  return tree.childrenOf.get(nodeId) ?? [];
}

/** Resolve a slug path (e.g. ['getting-ready','getting-here']) to a node, validating ancestry. */
export function nodeForPath(tree: FaqTree, slugs: string[]): FaqStructureNode | null {
  if (slugs.length === 0) return null;
  let parentId: string | null = null;
  let current: FaqStructureNode | null = null;
  for (const slug of slugs) {
    const candidates: FaqStructureNode[] = tree.childrenOf.get(parentId) ?? [];
    const match: FaqStructureNode | undefined = candidates.find((n) => n.slug === slug);
    if (!match) return null;
    current = match;
    parentId = match.id;
  }
  return current;
}

/** Ancestry from root → node (inclusive), for breadcrumb. */
export function ancestorsOf(tree: FaqTree, nodeId: string): FaqStructureNode[] {
  const chain: FaqStructureNode[] = [];
  let node = tree.byId.get(nodeId) ?? null;
  while (node) {
    chain.unshift(node);
    node = node.parentId ? (tree.byId.get(node.parentId) ?? null) : null;
  }
  return chain;
}

/** Slug chain for a node (root → node), used to build its URL. */
export function pathSlugsForNode(tree: FaqTree, nodeId: string): string[] {
  return ancestorsOf(tree, nodeId).map((n) => n.slug);
}

/**
 * Resolve the public (ancestry-aware) URL for a set of FAQ record ids. A single
 * FAQ record only knows its own slug, so any page that links to a FAQ (mood
 * related box, embedded `cta_faq` block) needs the tree to build the full path.
 * Fetches the tree once, and only when there's at least one id to resolve.
 */
export async function faqHrefMap(
  locale: Locale,
  includeDrafts: boolean,
  faqIds: string[],
): Promise<Record<string, string>> {
  const ids = Array.from(new Set(faqIds));
  if (ids.length === 0) return {};
  const tree = await fetchFaqTree(locale, includeDrafts);
  return Object.fromEntries(
    ids
      .filter((id) => tree.byId.has(id))
      .map((id) => [id, faqPath(locale, pathSlugsForNode(tree, id))]),
  );
}

/** Siblings of a node (same parent), excluding itself. */
export function siblingsOf(tree: FaqTree, nodeId: string): FaqStructureNode[] {
  const node = tree.byId.get(nodeId);
  if (!node) return [];
  return (tree.childrenOf.get(node.parentId) ?? []).filter((n) => n.id !== nodeId);
}

export function hasChildren(tree: FaqTree, nodeId: string): boolean {
  return (tree.childrenOf.get(nodeId)?.length ?? 0) > 0;
}
