"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  formatFullDate,
  formatNumber,
  formatNumberWithScientificNotation,
  isScientificNotation,
} from "@/lib/utils";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { ChartVote } from "@/lib/types";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { Block } from "ethers";
import { useLatestBlock } from "@/hooks/useLatestBlock";
import { useEffect, useState } from "react";
import { ChartSkeleton } from "@/components/Proposals/ProposalPage/ProposalChart/ProposalChart";
import { isProposalCreatedBeforeUpgradeCheck } from "@/lib/proposalUtils";
const { token, namespace, ui } = Tenant.current();

interface Props {
  proposal: Proposal;
  votes: ChartVote[];
}

type ChartData = {
  timestamp: Date | null;
  for: number;
  against: number;
  abstain: number;
  total: number;
};

export const TimelineChart = ({ votes, proposal }: Props) => {
  const { data: block } = useLatestBlock({ enabled: true });
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const isProposalCreatedBeforeUpgrade =
    isProposalCreatedBeforeUpgradeCheck(proposal);

  let stackIds: { [key: string]: string } = {
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
  if (namespace === TENANT_NAMESPACES.ENS) {
    stackIds.against = "2";
  } else if (namespace === TENANT_NAMESPACES.UNISWAP) {
    stackIds.against = "2";
    stackIds.abstain = "3";
  }

  useEffect(() => {
    if (block && !chartData) {
      const transformedData = transformVotesToChartData({
        votes: votes,
        block,
      });

      setChartData([
        {
          timestamp: proposal.startTime,
          for: 0,
          against: 0,
          abstain: 0,
          total: 0,
        },
        ...transformedData,
        {
          timestamp: proposal.endTime,
          for: transformedData[transformedData.length - 1]?.for,
          abstain: transformedData[transformedData.length - 1]?.abstain,
          against: transformedData[transformedData.length - 1]?.against,
          total: transformedData[transformedData.length - 1]?.total,
        },
      ]);
    }
  }, [block, chartData]);

  if (!chartData || !block) return <ChartSkeleton />;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={chartData}>
          <CartesianGrid
            vertical={false}
            strokeDasharray={"3 3"}
            stroke={rgbStringToHex(ui.customization?.tertiary)}
          />
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
            fill={rgbStringToHex(ui.customization?.tertiary)}
          />

          <YAxis
            className="text-xs font-inter font-semibold fill:text-primary/30 fill"
            tick={{
              fill: rgbStringToHex(ui.customization?.tertiary),
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
          {!!proposal.quorum && !isProposalCreatedBeforeUpgrade && (
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

          <Tooltip
            content={
              <CustomTooltip
                quorum={isProposalCreatedBeforeUpgrade ? null : proposal.quorum}
              />
            }
            cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="step"
            dataKey="against"
            stackId={stackIds.against}
            stroke={rgbStringToHex(ui.customization?.negative)}
            fill={rgbStringToHex(ui.customization?.negative)}
            name="Against"
          />
          <Area
            type="step"
            dataKey="abstain"
            stackId={1}
            stroke={rgbStringToHex(ui.customization?.tertiary)}
            fill={rgbStringToHex(ui.customization?.tertiary)}
            name="Abstain"
          />
          <Area
            type="step"
            dataKey="for"
            stackId={stackIds.for}
            stroke={rgbStringToHex(ui.customization?.positive)}
            fill={rgbStringToHex(ui.customization?.positive)}
            name="For"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Transforms an array of votes into chart data.
 */
const transformVotesToChartData = ({
  votes,
  block,
}: {
  votes: ChartVote[];
  block: Block;
}) => {
  let forCount = 0;
  let abstain = 0;
  let against = 0;

  return votes.map((vote) => {
    forCount = vote.support === "1" ? forCount + Number(vote.weight) : forCount;
    abstain = vote.support === "2" ? abstain + Number(vote.weight) : abstain;
    against = vote.support === "0" ? against + Number(vote.weight) : against;

    return {
      weight: Number(vote.weight),
      for: forCount,
      abstain: abstain,
      against: against,
      timestamp: getHumanBlockTime(vote.block_number, block),
      total: forCount + abstain + against,
    };
  });
};

const tickFormatter = (timeStr: string, index: number) => {
  if (!timeStr) return "";
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
  const { index, x, y, payload, tickFormatter, className } = props;
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

const CustomTooltip = ({ active, payload, label, quorum }: any) => {
  const forVotes = payload.find((p: any) => p.name === "For");
  const againstVotes = payload.find((p: any) => p.name === "Against");
  const abstainVotes = payload.find((p: any) => p.name === "Abstain");
  const voteOrder = ["For", "Against", "Abstain"];

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
      <div className="bg-neutral p-3 border border-line rounded-lg shadow-newDefault">
        <p className="text-xs font-semibold mb-2 text-primary">
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
            <span className="font-mono text-primary">
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
            <span className="text-secondary">Quorum:</span>
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
              <span className="text-primary">/</span>
              <span className="font-mono text-primary">
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
