"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ChartVote } from "@/lib/types";
import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { Plus, Minus, RotateCcw } from "lucide-react";

// TreeMap constants
const CHART_DIMENSIONS = {
  width: 720,
  height: 250,
  padding: 3,
  maxVotes: 100,
} as const;

const ZOOM_CONFIG = {
  min: 0.5,
  max: 100,
  step: 3,
} as const;

interface TreeNode
  extends d3.HierarchyRectangularNode<{
    address?: string;
    support?: string;
    value?: number;
    children?: Array<{ address: string; support: string; value: number }>;
  }> {}

const transformVotesToTreeData = (votes: ChartVote[]) => {
  const sortedVotes = votes
    .filter((vote) => Number(vote.weight) > 0)
    .sort((a, b) => Number(b.weight) - Number(a.weight))
    .slice(0, CHART_DIMENSIONS.maxVotes);

  return {
    children: sortedVotes.map((vote) => ({
      address: vote.voter,
      support: vote.support,
      value: Math.max(Number(vote.weight), 0.000001),
    })),
  };
};

const TreeMapNode = memo(
  ({ node, transform }: { node: TreeNode; transform: d3.ZoomTransform }) => {
    const router = useRouter();
    const { ui } = Tenant.current();

    const width = node.x1 - node.x0;
    const height = node.y1 - node.y0;
    const isTextVisible = width * transform.k > 15 && height * transform.k > 8;

    const fillColor = useMemo(
      () =>
        node.data.support === "1"
          ? rgbStringToHex(ui.customization?.positive)
          : node.data.support === "0"
            ? rgbStringToHex(ui.customization?.negative)
            : rgbStringToHex(ui.customization?.tertiary),
      [node.data.support, ui.customization]
    );

    const fontSize = useMemo(
      () => Math.min(width / 8, height / 1.5, Math.sqrt(width * height) / 6),
      [width, height]
    );

    return (
      <g
        transform={`translate(${node.x0},${node.y0})`}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/delegates/${node.data.address}`);
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
            transition: "fill 0.15s ease-out",
          }}
        />
        <foreignObject
          x={0}
          y={0}
          width={width}
          height={height}
          style={{
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center text-white font-medium"
            style={{
              fontSize: `${isTextVisible ? fontSize : Math.min(fontSize * 1.5, height / 2)}px`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "none",
              padding: `${height * 0.1}px 2px`,
              lineHeight: "1",
              display: "flex",
              alignItems: "center",
              minHeight: "100%",
            }}
          >
            <ENSName address={node.data.address || ""} truncate />
          </div>
        </foreignObject>
      </g>
    );
  }
);

TreeMapNode.displayName = "TreeMapNode";

const ZoomButton = memo(
  ({
    onClick,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    icon: typeof Plus | typeof Minus | typeof RotateCcw;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className="p-1 bg-neutral hover:bg-wash rounded-md border border-line"
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  )
);

ZoomButton.displayName = "ZoomButton";

export default function TreeMapChart({
  proposal,
  votes,
}: {
  proposal: Proposal;
  votes: ChartVote[];
}) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [transform, setTransform] = useState(() =>
    d3.zoomIdentity.translate(0, 0).scale(1)
  );
  const [hasMoreVotes, setHasMoreVotes] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultTransformRef = useRef<d3.ZoomTransform | null>(null);

  const createZoom = useMemo(
    () =>
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([ZOOM_CONFIG.min, ZOOM_CONFIG.max])
        .on("zoom", (event) => setTransform(event.transform)),
    []
  );

  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([ZOOM_CONFIG.min, ZOOM_CONFIG.max])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .transition()
      .duration(300)
      .call((t) => zoom.scaleTo(t as any, transform.k + factor));
  };

  const handleReset = () => {
    if (!svgRef.current || !defaultTransformRef.current) return;
    d3.select<SVGSVGElement, unknown>(svgRef.current)
      .transition()
      .duration(300)
      .call(createZoom.transform, defaultTransformRef.current);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !votes.length) return;

    setHasMoreVotes(votes.length > CHART_DIMENSIONS.maxVotes);

    const treeData = transformVotesToTreeData(votes);

    const treemap = d3
      .treemap<typeof treeData>()
      .size([CHART_DIMENSIONS.width - 20, CHART_DIMENSIONS.height - 20])
      .paddingOuter(10)
      .paddingInner(3)
      .round(true);

    const root = d3
      .hierarchy(treeData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treeNodes = treemap(root).leaves() as unknown as TreeNode[];
    setNodes(treeNodes);

    const defaultTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    defaultTransformRef.current = defaultTransform;
    setTransform(defaultTransform);

    const zoom = d3
      .zoom<SVGSVGElement, undefined>()
      .scaleExtent([ZOOM_CONFIG.min, ZOOM_CONFIG.max])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, undefined>(svg)
      .call(zoom as any)
      .call((selection) => zoom.transform(selection, defaultTransform));

    return () => {
      zoom.on("zoom", null);
    };
  }, [votes]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative h-[230px]">
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <ZoomButton
            onClick={() => handleZoom(ZOOM_CONFIG.step)}
            icon={Plus}
            label="Zoom in"
          />
          <ZoomButton
            onClick={() => handleZoom(-ZOOM_CONFIG.step)}
            icon={Minus}
            label="Zoom out"
          />
          <ZoomButton
            onClick={handleReset}
            icon={RotateCcw}
            label="Reset zoom"
          />
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_DIMENSIONS.width} ${CHART_DIMENSIONS.height}`}
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
      {hasMoreVotes && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Highlighting the most impactful votes
        </div>
      )}
    </div>
  );
}
