"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import Tenant from "@/lib/tenant/tenant";
import {
  formatNumber,
  formatNumberWithScientificNotation,
  isScientificNotation,
} from "@/lib/utils";
import { PaginatedResult } from "@/app/lib/pagination";

const { token } = Tenant.current();

/**
 * Transforms an array of votes into chart data.
 */
const transformVotesToChartData = (votes: Vote[]) => {
  let forCount = 0;
  let abstain = 0;
  let against = 0;

  return votes.map((voter) => {
    forCount = voter.support === "FOR" ? forCount + +voter.weight : forCount;
    abstain = voter.support === "ABSTAIN" ? abstain + +voter.weight : abstain;
    against = voter.support === "AGAINST" ? against + +voter.weight : against;

    return {
      ...voter,
      for: forCount,
      abstain: abstain,
      against: against,
      total: forCount + abstain + against,
    };
  });
};

const tickFormatter = (timeStr: string, index: number) => {
  const date = new Date(timeStr);
  const formattedDate = format(date, "MM/dd h:mm a");

  const metaText = index === 0 ? "(vote begins)" : "(vote end)";
  return `${formattedDate} ${metaText}`;
};

const yTickFormatter = (value: any) => {
  const isSciNotation = isScientificNotation(value);
  return formatNumber(
    isSciNotation ? formatNumberWithScientificNotation(value) : BigInt(value),
    token.decimals,
    4
  );
};

const customizedXTick = (props: any) => {
  const { index, x, y, fill, payload, tickFormatter, className } = props;
  return (
    <g transform={`translate(${index === 0 ? x : x + 15},${y})`}>
      <text x={0} y={0} dy={10} fill="#AFAFAF" className={className}>
        <tspan textAnchor={"middle"} x="0">
          {tickFormatter(payload.value, index)}
        </tspan>
      </text>
    </g>
  );
};

export default function VotingTimelineChart({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: PaginatedResult<Vote[]>;
}) {
  return <Chart proposal={proposal} votes={proposalVotes.data} />;
}

const Chart = ({ proposal, votes }: { proposal: Proposal; votes: Vote[] }) => {
  /**
   * Sorts the voting data based on the timestamp in ascending order.
   */
  const sortedChartData = votes?.sort(
    (a, b) =>
      new Date(a?.timestamp || "").getTime() -
      new Date(b?.timestamp || "").getTime()
  );

  const chartData = transformVotesToChartData(sortedChartData);

  const modifiedChartData = [
    {
      timestamp: proposal.startTime,
      for: 0,
      against: 0,
      abstain: 0,
      total: 0,
    },
    ...chartData,
    {
      timestamp: proposal.endTime,
      for: chartData[chartData.length - 1]?.for,
      abstain: chartData[chartData.length - 1]?.abstain,
      against: chartData[chartData.length - 1]?.against,
      total: chartData[chartData.length - 1]?.total,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={modifiedChartData}>
        <CartesianGrid vertical={false} strokeDasharray={"3 3"} />
        <XAxis
          dataKey="timestamp"
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          ticks={[
            (proposal.startTime as unknown as string) || "",
            (proposal.endTime as unknown as string) || "",
          ]}
          tickFormatter={tickFormatter}
          tick={customizedXTick}
          className="text-xs font-inter font-semibold text-primary/30"
          fill={"#AFAFAF"}
        />

        <YAxis
          className="text-xs font-inter font-semibold fill:text-primary/30 fill"
          tick={{
            fill: "#AFAFAF",
          }}
          tickFormatter={yTickFormatter}
          tickLine={false}
          axisLine={false}
          tickCount={6}
          interval={0}
          width={36}
          tickMargin={0}
        />

        <Area
          type="step"
          dataKey="against"
          stackId="1"
          stroke="#dc2626"
          fill="#fecaca"
        />
        <Area
          type="step"
          dataKey="abstain"
          stackId="1"
          stroke="#57534e"
          fill="#e7e5e4"
        />
        <Area
          type="step"
          dataKey="for"
          stackId="1"
          stroke="#16a34a"
          fill="#bbf7d0"
        />

        {!!proposal.quorum && (
          <ReferenceLine
            y={+proposal.quorum.toString()}
            strokeWidth={1}
            strokeDasharray="3 3"
            stroke="#4F4F4F"
            label={{
              position: "insideBottomLeft",
              value: "QUORUM",
              className: "text-xs font-inter font-semibold",
              fill: "#565656",
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};
