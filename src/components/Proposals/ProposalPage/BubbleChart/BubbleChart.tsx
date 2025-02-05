import { useEffect, useRef, useState, useMemo, memo } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ChartVote } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { Plus, Minus, RotateCcw } from "lucide-react";
import ENSName from "@/components/shared/ENSName";

//Bubble contransts
const CHART_DIMENSIONS = {
  width: 720,
  height: 250,
  padding: 3,
  maxVotes: 50,
} as const;

const BUBBLE_PADDING = 10;

const ZOOM_CONFIG = {
  min: 0.5,
  max: 100,
  step: 3,
} as const;

interface BubbleNode extends d3.SimulationNodeDatum {
  address: string;
  support: "0" | "1" | "2";
  value: number;
  r: number;
}

const SCALING_EXPONENT = 0.4;
const transformVotesToBubbleData = (votes: ChartVote[]): BubbleNode[] => {
  const sortedVotes = votes
    .slice()
    .sort((a, b) => Number(b.weight) - Number(a.weight))
    .slice(0, CHART_DIMENSIONS.maxVotes);
  const maxWeight = Math.max(...sortedVotes.map((v) => Number(v.weight)));
  return sortedVotes.map((vote) => ({
    address: vote.voter,
    support: vote.support as "0" | "1" | "2",
    value: Number(vote.weight),
    r: Math.pow(Number(vote.weight) / maxWeight, SCALING_EXPONENT) * 40,
  }));
};

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

const BubbleNode = memo(
  ({ node, transform }: { node: BubbleNode; transform: d3.ZoomTransform }) => {
    const router = useRouter();
    const { ui } = Tenant.current();

    const fillColor = useMemo(() => {
      const colorMap = {
        "1": ui.customization?.positive,
        "0": ui.customization?.negative,
        "2": ui.customization?.tertiary,
      };
      return rgbStringToHex(colorMap[node.support]);
    }, [node.support, ui.customization]);

    const fontSize = Math.min(node.r / 3.5, (node.r * 2) / 10);

    return (
      <g
        transform={`translate(${node.x},${node.y})`}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/delegates/${node.address}`);
        }}
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
              fontSize: `${fontSize}px`,
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
  votes,
}: {
  proposal: Proposal;
  votes: ChartVote[];
}) {
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
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
    if (!svg) return;

    setHasMoreVotes(votes.length > CHART_DIMENSIONS.maxVotes);

    const bubbleData = transformVotesToBubbleData(votes);
    const pack = d3
      .pack<BubbleNode>()
      .size([CHART_DIMENSIONS.width - 20, CHART_DIMENSIONS.height - 20])
      .padding(BUBBLE_PADDING);

    const root = d3
      .hierarchy<BubbleNode>({ children: bubbleData } as any)
      .sum((d) => d.value ?? 0);

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
      maxX:
        d3.max(packedData, (d) => (d.x ?? 0) + (d.r ?? 0)) ||
        CHART_DIMENSIONS.width,
      minY: d3.min(packedData, (d) => (d.y ?? 0) - (d.r ?? 0)) || 0,
      maxY:
        d3.max(packedData, (d) => (d.y ?? 0) + (d.r ?? 0)) ||
        CHART_DIMENSIONS.height,
    };

    const dx = bounds.maxX - bounds.minX;
    const dy = bounds.maxY - bounds.minY;
    const scale =
      1.5 / Math.max(dx / CHART_DIMENSIONS.width, dy / CHART_DIMENSIONS.height);
    const translateX =
      (CHART_DIMENSIONS.width - scale * (bounds.minX + bounds.maxX)) / 2;
    const translateY =
      (CHART_DIMENSIONS.height - scale * (bounds.minY + bounds.maxY)) / 2;

    const defaultTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale);
    defaultTransformRef.current = defaultTransform;
    setTransform(defaultTransform);
    setNodes(packedData);

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
  }, [votes, createZoom]);

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
              <BubbleNode
                key={node.address}
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
