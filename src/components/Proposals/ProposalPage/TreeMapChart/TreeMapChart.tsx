"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import ENSName from "@/components/shared/ENSName";
import { PaginatedResult } from "@/app/lib/pagination";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { useEnsName } from "wagmi";
import { Plus, Minus } from "lucide-react";

interface TreeNode
  extends d3.HierarchyRectangularNode<{
    address?: string;
    support?: string;
    value?: number;
    children?: Array<{ address: string; support: string; value: number }>;
  }> {}

const TreeMapNode = memo(
  ({ node, transform }: { node: TreeNode; transform: d3.ZoomTransform }) => {
    const router = useRouter();
    const { data: ensName } = useEnsName({
      address: node.data.address as `0x${string}`,
      chainId: 1,
    });
    const { ui } = Tenant.current();

    const width = node.x1 - node.x0;
    const height = node.y1 - node.y0;
    const displayText =
      ensName ||
      (node.data.address
        ? `${node.data.address.slice(0, 6)}...${node.data.address.slice(-4)}`
        : "Unknown");

    const fillColor = useMemo(
      () =>
        node.data.support === "FOR"
          ? rgbStringToHex(ui.customization?.positive)
          : node.data.support === "AGAINST"
            ? rgbStringToHex(ui.customization?.negative)
            : rgbStringToHex(ui.customization?.tertiary),
      [node.data.support, ui.customization]
    );

    const fontSize = Math.min(
      (Math.sqrt(width * height) / displayText.length) * 0.8 * transform.k,
      height * 0.8,
      (width * 0.9) / (displayText.length * 0.6)
    );

    const isTextVisible = width * transform.k > 20 && height * transform.k > 10;

    return (
      <g
        transform={`translate(${node.x0},${node.y0})`}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/delegates/${ensName || node.data.address}`);
        }}
        style={{ cursor: "pointer" }}
      >
        <rect
          width={width}
          height={height}
          style={{
            fill: fillColor,
            stroke: rgbStringToHex(ui.customization?.neutral),
            strokeWidth: 1 / transform.k,
          }}
        />
        {isTextVisible && (
          <text
            x={width / 2}
            y={height / 2}
            dy=".3em"
            fontSize={fontSize}
            fill="white"
            style={{
              textAnchor: "middle",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              fontWeight: "500",
              userSelect: "none",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {displayText}
          </text>
        )}
      </g>
    );
  }
);

TreeMapNode.displayName = "TreeMapNode";

export default function TreeMapChart({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: PaginatedResult<Vote[]>;
}) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [transform, setTransform] = useState(() =>
    d3.zoomIdentity.translate(0, 0).scale(1)
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 100])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .transition()
      .duration(300)
      .call((t) => zoom.scaleTo(t as any, transform.k + factor));
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !proposalVotes.data.length) return;

    const width = 720;
    const height = 230;

    const treeData = {
      children: proposalVotes.data
        .filter((vote) => +vote.weight > 0)
        .sort((a, b) => +b.weight - +a.weight)
        .map((vote) => ({
          address: vote.address,
          support: vote.support,
          value: Math.max(+vote.weight, 0.000001),
        })),
    };

    const treemap = d3
      .treemap<typeof treeData>()
      .size([width, height])
      .paddingOuter(3)
      .paddingInner(1)
      .round(true);

    const root = d3
      .hierarchy(treeData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treeNodes = treemap(root).leaves() as unknown as TreeNode[];
    setNodes(treeNodes);

    const zoom = d3
      .zoom<SVGSVGElement, undefined>()
      .scaleExtent([0.5, 100])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, undefined>(svg)
      .call(zoom as any)
      .call((selection) =>
        zoom.transform(selection, d3.zoomIdentity.translate(0, 0).scale(1))
      );

    return () => {
      zoom.on("zoom", null);
    };
  }, [proposalVotes.data]);

  return (
    <div className="relative w-full h-[230px]" ref={containerRef}>
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <button
          onClick={() => handleZoom(2.5)}
          className="p-1 bg-neutral hover:bg-wash rounded-md border border-line"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => handleZoom(-2.5)}
          className="p-1 bg-neutral hover:bg-wash rounded-md border border-line"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 720 230"
        style={{ width: "100%", height: "100%" }}
      >
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
        >
          {nodes.map((node) => (
            <TreeMapNode
              key={node.data.address}
              node={node}
              transform={transform}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
