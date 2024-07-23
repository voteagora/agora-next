"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import ENSName from "@/components/shared/ENSName";
/**
 * Transforms an array of votes into chart data suitable for a treemap.
 */
const transformVotesToTreeMapData = (votes: Vote[]) => {
  const data = {
    name: "votes",
    children: votes
      .map((vote) => ({
        address: vote.address,
        support: vote.support,
        value: +vote.weight,
      }))
      .sort((a, b) => b.support.localeCompare(a.support)),
  };

  return data;
};

export default function VotingTimelineChart({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: {
    meta: {
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
    };
    votes: Vote[];
  };
}) {
  return <Chart proposal={proposal} votes={proposalVotes.votes} />;
}

const Chart = ({ proposal, votes }: { proposal: Proposal; votes: Vote[] }) => {
  const chartData = transformVotesToTreeMapData(votes);
  console.log(votes);
  console.log(chartData);

  return (
    <ResponsiveContainer width="100%" height={230}>
      <Treemap
        data={chartData.children}
        dataKey="value"
        nameKey="name"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomContent />}
        isAnimationActive={false} // Disable animation on load
      >
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
      </Treemap>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({ payload }: any) => {
  if (payload && payload.length) {
    return (
      <div className="bg-stone-700 text-neutral p-1 text-xs rounded">
        <ENSName address={payload[0].payload.address} />
      </div>
    );
  }
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        padding: "5px",
        borderRadius: "3px",
      }}
    >
      No address
    </div>
  );
};

const CustomContent = (props: any) => {
  const { x, y, width, height, support, address, value } = props;
  const fillColor =
    support === "AGAINST"
      ? "#FA2D28"
      : support === "FOR"
        ? "#23BF6B"
        : "#959595"; // Red for AGAINST, Green for FOR, Grey for ABSTAIN

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: fillColor, stroke: "#fff" }}
      ></rect>
      {width * height > 1600 && (
        <foreignObject x={x} y={y} width={width} height={height}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "white",
              fontSize: "x-small",
            }}
          >
            {address && <ENSName address={address} />}
          </div>
        </foreignObject>
      )}
    </g>
  );
};
