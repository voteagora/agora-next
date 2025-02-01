"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ENSName from "@/components/shared/ENSName";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { ChartVote } from "@/lib/types";

interface Props {
  proposal: Proposal;
  votes: ChartVote[];
}

export default function VotingTimelineChart({ proposal, votes }: Props) {
  const chartData = transformData(votes);

  return (
    <ResponsiveContainer width="100%" height={230}>
      <Treemap
        data={chartData.children}
        dataKey="value"
        nameKey="name"
        content={<CustomContent />}
        isAnimationActive={false}
      >
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
      </Treemap>
    </ResponsiveContainer>
  );
}

const CustomTooltip = ({ payload }: any) => {
  if (payload && payload.length) {
    return (
      <div className="bg-neutral text-primary text-xs rounded border border-line px-3 py-2">
        <ENSName address={payload[0].payload.address} />
      </div>
    );
  }
  return (
    <div className="bg-wash text-primary p-1 text-xs rounded border border-line">
      No address
    </div>
  );
};

const CustomContent = (props: any) => {
  const { x, y, width, height, support, address } = props;
  const { ui } = Tenant.current();

  const fillColor =
    support === "0"
      ? rgbStringToHex(ui.customization?.negative)
      : support === "1"
        ? rgbStringToHex(ui.customization?.positive)
        : rgbStringToHex(ui.customization?.tertiary);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: rgbStringToHex(ui.customization?.neutral),
        }}
      ></rect>
      {width * height > 1600 && (
        <foreignObject x={x} y={y} width={width} height={height}>
          <div
            className={"text-neutral text-xs items-center justify-center"}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {address && <ENSName address={address} />}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

/**
 * Transforms an array of votes into chart data suitable for a treemap.
 */
const transformData = (votes: ChartVote[]) => {
  return {
    name: "votes",
    children: votes
      .map((vote) => ({
        address: vote.voter,
        support: vote.support,
        value: +Number(vote.weight),
      }))
      .sort((a, b) => b.support.localeCompare(a.support)),
  };
};
