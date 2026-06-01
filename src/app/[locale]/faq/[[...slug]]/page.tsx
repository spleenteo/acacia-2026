import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import { type Locale, locales } from '@/i18n/config';
import { faqPath } from '@/i18n/paths';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
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
import FaqStructuredText from '@/components/Faq/FaqStructuredText';
import FaqAccordion from '@/components/Faq/FaqAccordion';
import FaqBreadcrumb, { type Crumb } from '@/components/Faq/FaqBreadcrumb';
import FaqCard from '@/components/Faq/FaqCard';

type Params = { locale: string; slug?: string[] };

const indexQuery = graphql(`
  query FaqIndexQuery($locale: SiteLocale!) {
    pageFaq(locale: $locale) {
      title(locale: $locale)
      subtitle(locale: $locale)
      intro(locale: $locale)
    }
  }
`);

const nodeQuery = graphql(
  `
    query FaqNodeQuery($locale: SiteLocale!, $id: ItemId!) {
      faq(locale: $locale, filter: { id: { eq: $id } }) {
        id
        question(locale: $locale)
        answerStructured {
          ...FaqAnswer
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
  [FaqAnswerFragment],
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
    const title = data.pageFaq?.title ?? 'FAQ';
    return { title, alternates: { canonical: faqPath(loc, []) } };
  }

  const tree = await fetchFaqTree(loc, isEnabled);
  const node = nodeForPath(tree, slug);
  if (!node) return {};
  return { title: node.question, alternates: { canonical: faqPath(loc, slug) } };
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
    const page = data.pageFaq;
    const roots = rootNodes(tree);

    return (
      <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <p className="font-body text-label uppercase tracking-[0.22em] text-rust font-medium">
          FAQ
        </p>
        <h1 className="mt-3 font-heading text-h1 md:text-hero font-normal text-dark">
          {page?.title ?? 'FAQ'}
        </h1>
        {page?.subtitle && (
          <p className="mt-3 font-heading text-h3 font-normal text-muted italic">{page.subtitle}</p>
        )}
        {page?.intro && (
          <p className="mt-5 font-body text-body-lg text-body leading-relaxed whitespace-pre-line">
            {page.intro}
          </p>
        )}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {roots.map((r) => (
            <FaqCard key={r.id} title={r.question} href={faqPath(loc, [r.slug])} />
          ))}
        </div>
      </div>
    );
  }

  // NODE (/faq/...)
  const tree = await fetchFaqTree(loc, includeDrafts);
  const node = nodeForPath(tree, slug);
  if (!node) notFound();

  const nodeData = await executeQuery(nodeQuery, {
    variables: { locale: loc, id: node.id },
    includeDrafts,
  });
  const content = nodeData.faq;
  if (!content) notFound();

  const children = childrenOfNode(tree, node.id);
  const childContentById = new Map((content.children ?? []).map((c) => [c.id, c]));
  const siblings = siblingsOf(tree, node.id);

  // breadcrumb: FAQ index → ancestors → current
  const crumbs: Crumb[] = [{ label: 'FAQ', href: faqPath(loc, []) }];
  for (const a of ancestorsOf(tree, node.id)) {
    crumbs.push({ label: a.question, href: faqPath(loc, pathSlugsForNode(tree, a.id)) });
  }

  const childrenAllLeaves = children.length > 0 && children.every((c) => !hasChildren(tree, c.id));

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <FaqBreadcrumb crumbs={crumbs} />

      <h1 className="font-heading text-h1 font-normal text-dark leading-tight">
        {content.question}
      </h1>

      {/* intro / answer of this node */}
      <div className="mt-5">
        <FaqStructuredText data={content.answerStructured} />
      </div>

      {/* children: accordion (leaves) or cards (branches) */}
      {children.length > 0 && (
        <div className="mt-10">
          {childrenAllLeaves ? (
            <FaqAccordion
              items={children.map((c) => ({
                id: c.id,
                question: childContentById.get(c.id)?.question ?? c.question,
                answer: childContentById.get(c.id)?.answerStructured ?? null,
              }))}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {children.map((c) => (
                <FaqCard
                  key={c.id}
                  title={childContentById.get(c.id)?.question ?? c.question}
                  href={faqPath(loc, pathSlugsForNode(tree, c.id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* siblings: lateral navigation */}
      {siblings.length > 0 && (
        <div className="mt-14 border-t border-border pt-6">
          <p className="font-body text-label uppercase tracking-[0.18em] text-light font-medium">
            Vai a
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {siblings.map((s) => (
              <li key={s.id}>
                <Link
                  href={faqPath(loc, pathSlugsForNode(tree, s.id))}
                  className="font-body text-body-sm text-muted transition-colors hover:text-rust"
                >
                  {s.question}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
