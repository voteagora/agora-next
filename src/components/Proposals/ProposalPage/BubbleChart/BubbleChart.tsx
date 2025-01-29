import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { PaginatedResult } from "@/app/lib/pagination";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { Plus, Minus } from "lucide-react";
import ENSName from "@/components/shared/ENSName";

interface BubbleNode extends d3.SimulationNodeDatum {
  address: string;
  support: string;
  value: number;
  r: number;
}

const transformVotesToBubbleData = (votes: Vote[]): BubbleNode[] => {
  const maxWeight = Math.max(...votes.map((v) => +v.weight));
  return votes
    .sort((a, b) => +b.weight - +a.weight)
    .map((vote) => ({
      address: vote.address,
      support: vote.support,
      value: +vote.weight,
      r: Math.sqrt(+vote.weight / maxWeight) * 40,
    }));
};

const BubbleNode = memo(
  ({ node, transform }: { node: BubbleNode; transform: d3.ZoomTransform }) => {
    const router = useRouter();
    const { ui } = Tenant.current();

    const fillColor = useMemo(
      () =>
        node.support === "FOR"
          ? rgbStringToHex(ui.customization?.positive)
          : node.support === "AGAINST"
            ? rgbStringToHex(ui.customization?.negative)
            : rgbStringToHex(ui.customization?.tertiary),
      [node.support, ui.customization]
    );

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/delegates/${node.address}`);
    };

    return (
      <g
        transform={`translate(${node.x},${node.y})`}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <circle
          r={node.r}
          style={{
            fill: fillColor,
            transition: "fill 0.15s ease-out",
          }}
        />
        <foreignObject
          x={-node.r}
          y={-node.r}
          width={node.r * 2}
          height={node.r * 2}
          style={{
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-center w-full h-full text-white"
            style={{
              fontSize: `${Math.min(node.r / 3.5, (node.r * 2) / 10)}px`,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <ENSName address={node.address} truncate />
          </div>
        </foreignObject>
      </g>
    );
  }
);

BubbleNode.displayName = "BubbleNode";

export default function BubbleChart({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: PaginatedResult<Vote[]>;
}) {
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
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
    if (!svg) return;

    const width = 720;
    const height = 230;

    const bubbleData = transformVotesToBubbleData(proposalVotes.data);
    const pack = d3
      .pack<BubbleNode>()
      .size([width - 20, height - 20])
      .padding(3);

    const root = d3
      .hierarchy<BubbleNode>({ children: bubbleData } as any)
      .sum((d) => ("value" in d ? Number(d.value) : 0));

    const packedData = pack(root)
      .leaves()
      .map((d) => ({
        ...d.data,
        x: d.x,
        y: d.y,
        r: d.r,
      })) as BubbleNode[];

    const bounds = {
      minX: d3.min(packedData, (d) => (d.x ?? 0) - (d.r ?? 0)) || 0,
      maxX: d3.max(packedData, (d) => (d.x ?? 0) + (d.r ?? 0)) || width,
      minY: d3.min(packedData, (d) => (d.y ?? 0) - (d.r ?? 0)) || 0,
      maxY: d3.max(packedData, (d) => (d.y ?? 0) + (d.r ?? 0)) || height,
    };

    const dx = bounds.maxX - bounds.minX;
    const dy = bounds.maxY - bounds.minY;
    const scale = 1.5 / Math.max(dx / width, dy / height);
    const translateX = (width - scale * (bounds.minX + bounds.maxX)) / 2;
    const translateY = (height - scale * (bounds.minY + bounds.maxY)) / 2;

    setNodes(packedData);

    const zoom = d3
      .zoom<SVGSVGElement, undefined>()
      .scaleExtent([0.5, 100])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, undefined>(svg)
      .call(zoom as any)
      .call((selection) =>
        zoom.transform(
          selection,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        )
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
            <BubbleNode key={node.address} node={node} transform={transform} />
          ))}
        </g>
      </svg>
    </div>
  );
}
