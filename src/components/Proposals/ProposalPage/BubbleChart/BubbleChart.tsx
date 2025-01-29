import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { PaginatedResult } from "@/app/lib/pagination";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { useEnsName } from "wagmi";
import { Plus, Minus } from "lucide-react";

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
    const { data: ensName } = useEnsName({
      address: node.address as `0x${string}`,
      chainId: 1,
    });
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

    const displayText =
      ensName || `${node.address.slice(0, 6)}...${node.address.slice(-4)}`;

    const diameter = node.r * 2;
    const baseFontSize = Math.min(
      (diameter / displayText.length) * 1.2,
      node.r / 2
    );

    const fontSize = Math.min(
      baseFontSize * Math.min(1, transform.k * 0.3),
      diameter / (displayText.length * 0.8)
    );

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/delegates/${ensName || node.address}`);
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
        <text
          dy=".3em"
          fontSize={fontSize}
          fill="white"
          style={{
            textAnchor: "middle",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontWeight: "500",
            userSelect: "none",
          }}
        >
          {displayText}
        </text>
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
    d3.zoomIdentity.translate(360, 115).scale(1.5)
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined>>();
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

    const zoom = d3
      .zoom<SVGSVGElement, undefined>()
      .scaleExtent([0.5, 100])
      .on("zoom", (event) => setTransform(event.transform));

    d3.select<SVGSVGElement, undefined>(svg)
      .call(zoom as any)
      .call((selection) =>
        zoom.transform(
          selection,
          d3.zoomIdentity.translate(360, 115).scale(1.5)
        )
      );

    const simulation = d3
      .forceSimulation<BubbleNode>(bubbleData)
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .force("center", d3.forceCenter(360, 115))
      .force(
        "collision",
        d3
          .forceCollide<BubbleNode>()
          .radius((d) => (d.r || 0) + 2)
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(5))
      .on("tick", () => {
        bubbleData.forEach((node) => {
          node.x = Math.max(node.r!, Math.min(width - node.r!, node.x!));
          node.y = Math.max(node.r!, Math.min(height - node.r!, node.y!));
        });
        setNodes([...bubbleData]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
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
