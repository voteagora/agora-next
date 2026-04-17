"use client";

import { useMemo } from "react";
import { buildTocTree, parseHeadings, type TocNode } from "./markdownHeadings";

function TocList({ nodes }: { nodes: TocNode[] }) {
  return (
    <ul className="list-disc pl-4 space-y-1">
      {nodes.map((node) => (
        <li key={node.slug}>
          <a
            href={`#${node.slug}`}
            className="text-secondary hover:text-primary hover:underline text-sm"
          >
            {node.text}
          </a>
          {node.children.length > 0 && <TocList nodes={node.children} />}
        </li>
      ))}
    </ul>
  );
}

export default function MarkdownToc({
  content,
  className = "p-4 border-b border-line",
}: {
  content: string;
  className?: string;
}) {
  const tree = useMemo(() => buildTocTree(parseHeadings(content)), [content]);
  if (tree.length === 0) return null;
  return (
    <div className={className}>
      <h2 className="text-base font-semibold text-primary mb-2">
        Table of Contents
      </h2>
      <TocList nodes={tree} />
    </div>
  );
}
