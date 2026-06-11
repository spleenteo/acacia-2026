'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { FaqNavNode } from '@/lib/faq/faqTree';
import { wonkyClip } from '@/lib/wonkyClip';

/** Stable numeric seed from a record id, so each marker keeps the same tilt. */
const seed = (id: string) => [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

type Props = {
  navTree: FaqNavNode[];
  activeId: string;
  /** Ids from root → current node, so the active branch starts expanded. */
  ancestorIds: string[];
  locale: Locale;
};

/**
 * Docs-style contextual navigation for FAQ node pages. Renders the full phase
 * tree (roots → leaves) with the active branch expanded and the current node
 * highlighted; every node is a link to its own page. Branches collapse/expand
 * client-side. On mobile it folds behind a single toggle so it never dominates
 * the article.
 */
export default function FaqSideNav({ navTree, activeId, ancestorIds, locale }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ancestorIds));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const label = locale === 'it' ? 'Tutte le domande' : 'All questions';

  return (
    <nav aria-label="FAQ" className="font-body">
      {/* Mobile disclosure */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between rounded-card border border-border px-4 py-3 lg:hidden"
      >
        <span className="text-label font-medium uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
        <span
          aria-hidden
          className={`text-h4 leading-none text-primary transition-transform duration-300 ${
            mobileOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      <div className={`${mobileOpen ? 'block' : 'hidden'} mt-4 lg:mt-0 lg:block`}>
        <ul className="space-y-1.5">
          {navTree.map((root) => (
            <Branch
              key={root.id}
              node={root}
              isRoot
              activeId={activeId}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Branch({
  node,
  isRoot,
  activeId,
  expanded,
  toggle,
}: {
  node: FaqNavNode;
  isRoot: boolean;
  activeId: string;
  expanded: Set<string>;
  toggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const isActive = node.id === activeId;

  return (
    <li>
      <div className="flex items-center gap-1">
        <Link
          href={node.href}
          aria-current={isActive ? 'page' : undefined}
          className={[
            'relative min-w-0 flex-1 py-1.5 transition-colors',
            isRoot
              ? 'text-label font-medium uppercase tracking-[0.18em] text-dark hover:text-primary'
              : isActive
                ? 'text-body-sm font-medium text-primary'
                : 'text-body-sm text-muted hover:text-primary',
          ].join(' ')}
        >
          {/* Active node — the house "wonky" marker: a gently skewed pale
              rectangle behind the title, same shape language used elsewhere. */}
          {isActive && (
            <span
              aria-hidden
              style={{ clipPath: wonkyClip(seed(node.id)) }}
              className="absolute -inset-x-2 inset-y-0 -z-10 bg-primary-pale"
            />
          )}
          <span className="relative">{node.question}</span>
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            className={`shrink-0 px-2 text-h4 leading-none text-primary transition-transform duration-300 ${
              isOpen ? 'rotate-45' : ''
            }`}
          >
            +
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="mt-1 ml-1.5 space-y-0.5 border-l border-border pl-3">
          {node.children.map((child) => (
            <Branch
              key={child.id}
              node={child}
              isRoot={false}
              activeId={activeId}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
