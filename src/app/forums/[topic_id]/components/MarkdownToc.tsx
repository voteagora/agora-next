"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { buildTocTree, parseHeadings, type TocNode } from "./markdownHeadings";

/** Renders heading text with inline markdown (e.g. _italic_) without wrapping in a block <p>. */
function TocInlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ children }) => (
          <span className="underline text-inherit">{children}</span>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function TocItem({ node }: { node: TocNode }) {
  const hasChildren = node.children.length > 0;
  // Level >= 2 nodes with children start collapsed
  const [open, setOpen] = useState(node.level < 2);

  return (
    <li>
      <div className="flex items-start gap-1">
        <a
          href={`#${node.slug}`}
          className="flex-1 text-secondary hover:text-primary hover:underline text-sm [&_em]:italic [&_strong]:font-semibold"
        >
          <TocInlineMarkdown text={node.text} />
        </a>
        {hasChildren && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex-shrink-0 text-tertiary hover:text-primary"
            aria-label={open ? "Collapse section" : "Expand section"}
          >
            {open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
      {hasChildren && open && <TocList nodes={node.children} />}
    </li>
  );
}

function TocList({ nodes, root }: { nodes: TocNode[]; root?: boolean }) {
  return (
    <ul className={root ? "space-y-2" : "list-disc pl-4 space-y-2 mt-2"}>
      {nodes.map((node) => (
        <TocItem key={node.slug} node={node} />
      ))}
    </ul>
  );
}

export default function MarkdownToc({
  content,
  className = "hidden lg:block px-5 pt-4 pb-2 lg:px-6 lg:pt-5 lg:pb-3 border-b border-line",
}: {
  content: string;
  className?: string;
}) {
  const tree = useMemo(() => buildTocTree(parseHeadings(content)), [content]);
  if (tree.length === 0) return null;
  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-primary mb-3">
        Table of Contents
      </h2>
      <TocList nodes={tree} root />
    </div>
  );
}
