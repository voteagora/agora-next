"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import Tenant from "@/lib/tenant/tenant";
import {
  formatNumber,
  formatNumberWithScientificNotation,
  isScientificNotation,
  formatFullDate,
} from "@/lib/utils";
import { PaginatedResult } from "@/app/lib/pagination";
import { DaoSlug } from "@prisma/client";
import { TENANT_NAMESPACES } from "@/lib/constants";

const { token, slug } = Tenant.current();

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
  const roundedValue = Math.round(value);
  const isSciNotation = isScientificNotation(roundedValue.toString());

  return formatNumber(
    isSciNotation
      ? formatNumberWithScientificNotation(roundedValue)
      : BigInt(roundedValue),
    token.decimals,
    roundedValue > 1_000_000 ? 2 : 4
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

const voteOrder = ["For", "Against", "Abstain"];

const CustomTooltip = ({ active, payload, label, quorum }: any) => {
  const { namespace } = Tenant.current();
  const forVotes = payload.find((p: any) => p.name === "For");
  const againstVotes = payload.find((p: any) => p.name === "Against");
  const abstainVotes = payload.find((p: any) => p.name === "Abstain");

  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort(
      (a, b) => voteOrder.indexOf(a.name) - voteOrder.indexOf(b.name)
    );

    let quorumVotes =
      BigInt(forVotes.value) +
      BigInt(abstainVotes.value) +
      BigInt(againstVotes.value);

    /**
     * ENS does not count against votes in the quorum calculation.
     */
    if (namespace === TENANT_NAMESPACES.ENS) {
      quorumVotes = quorumVotes - BigInt(againstVotes.value);
    }

    /**
     * Only FOR votes are counted towards quorum for Uniswap.
     */
    if (namespace === TENANT_NAMESPACES.UNISWAP) {
      quorumVotes = BigInt(forVotes.value);
    }

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="text-xs font-semibold mb-2">
          {formatFullDate(new Date(label))}
        </p>
        {sortedPayload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex justify-between items-center gap-4 text-xs"
          >
            <span style={{ color: entry.color }}>
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}:
            </span>
            <span className="font-mono">
              {formatNumber(
                BigInt(entry.value),
                token.decimals,
                entry.value > 1_000_000 ? 2 : 4
              )}
            </span>
          </div>
        ))}
        {!!quorum && (
          <div className="flex justify-between items-center gap-4 text-xs pt-2 border-t border-line border-dashed mt-2">
            <span style={{ color: "#333" }}>Quorum:</span>
            <div className="flex items-center gap-1">
              <span
                className={`font-mono ${
                  quorumVotes > quorum ? "text-primary" : "text-tertiary"
                }`}
              >
                {formatNumber(
                  BigInt(quorumVotes),
                  token.decimals,
                  quorumVotes > 1_000_000 ? 2 : 4
                )}
              </span>
              <span>/</span>
              <span className="font-mono">
                {formatNumber(
                  BigInt(quorum),
                  token.decimals,
                  quorum > 1_000_000 ? 2 : 4
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
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
  let stackIds = {
    for: "1",
    abstain: "1",
    against: "1",
  };

  /**
   * This is a temporary fix for ENS and UNI.
   * https://voteagora.atlassian.net/browse/ENG-903
   * ENS does not count against votes in the quorum calculation.
   * UNI does not count against or abstain votes in the quorum calculation.
   * This is a temporary fix stack for + abstain, but not against.
   * A future fix will read each tenant and stack depending on how the tenant counts quorum.
   */
  if (slug === DaoSlug.ENS) {
    stackIds.against = "2";
  } else if (slug === DaoSlug.UNI) {
    stackIds.against = "2";
    stackIds.abstain = "3";
  }

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
    <div className="relative">
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
            width={54}
            tickMargin={4}
            domain={[
              0,
              (dataMax: number) => {
                const quorumValue = proposal.quorum
                  ? +proposal.quorum.toString()
                  : 0;
                // Add 10% padding above the higher value between dataMax and quorum
                return Math.max(dataMax, quorumValue) * 1.1;
              },
            ]}
          />

          <Tooltip
            content={<CustomTooltip quorum={proposal.quorum} />}
            cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="step"
            dataKey="against"
            stackId={stackIds.against}
            stroke="#dc2626"
            fill="#fecaca"
            name="Against"
          />
          <Area
            type="step"
            dataKey="abstain"
            stackId={stackIds.abstain}
            stroke="#57534e"
            fill="#e7e5e4"
            name="Abstain"
          />
          <Area
            type="step"
            dataKey="for"
            stackId={stackIds.for}
            stroke="#16a34a"
            fill="#bbf7d0"
            name="For"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
