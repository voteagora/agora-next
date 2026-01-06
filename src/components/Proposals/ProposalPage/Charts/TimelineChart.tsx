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
import { GOVERNOR_TYPE } from "@/lib/constants";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { ChartVote } from "@/lib/types";
import { getHumanBlockTime } from "@/lib/blockTimes";
import { Block } from "ethers";
import { useLatestBlock } from "@/hooks/useLatestBlock";
import { useEffect, useState } from "react";
import { ChartSkeleton } from "@/components/Proposals/ProposalPage/ProposalChart/ProposalChart";
import { isProposalCreatedBeforeUpgradeCheck } from "@/lib/proposalUtils";
const { token, ui, contracts } = Tenant.current();

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
  quorumTotal: number;
};

type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

export const TimelineChart = ({ votes, proposal }: Props) => {
  const { data: block } = useLatestBlock({ enabled: true });
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const isProposalCreatedBeforeUpgrade =
    isProposalCreatedBeforeUpgradeCheck(proposal);

  // Check if this is an archive proposal with ranges (pending state)
  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: { source?: string; defaultProposalTypeRanges?: any };
    }
  ).archiveMetadata;

  const defaultProposalTypeRanges =
    archiveMetadata?.source === "eas-oodao"
      ? (archiveMetadata.defaultProposalTypeRanges as
          | RangeProposalType
          | undefined)
      : null;

  // Calculate quorum values from ranges (assuming max votes per token is similar to standard)
  const minQuorumValue = defaultProposalTypeRanges
    ? (defaultProposalTypeRanges.min_quorum_pct / 10000) *
      Number(proposal.quorum || 0)
    : null;
  const maxQuorumValue = defaultProposalTypeRanges
    ? (defaultProposalTypeRanges.max_quorum_pct / 10000) *
      Number(proposal.quorum || 0)
    : null;

  const minQuorumPct = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_quorum_pct / 100
    : null;
  const maxQuorumPct = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_quorum_pct / 100
    : null;

  const governorType = contracts.governorType;
  let stackIds: { [key: string]: string } = {
    for: "1",
    abstain: "1",
    against: "1",
  };

  if (governorType === GOVERNOR_TYPE.ENS) {
    stackIds.against = "2";
  } else if (governorType === GOVERNOR_TYPE.BRAVO) {
    stackIds.against = "2";
    stackIds.abstain = "3";
  }

  useEffect(() => {
    if (block && !chartData) {
      const transformedData = transformVotesToChartData({
        votes: votes,
        block,
        proposalType: proposal.proposalType ?? undefined,
        governorType: contracts.governorType,
      });
      const lastPoint = transformedData[transformedData.length - 1];
      const safeLastPoint = lastPoint ?? {
        for: 0,
        against: 0,
        abstain: 0,
        total: 0,
        quorumTotal: 0,
      };

      setChartData([
        {
          timestamp: proposal.startTime,
          for: 0,
          against: 0,
          abstain: 0,
          total: 0,
          quorumTotal: 0,
        },
        ...transformedData,
        {
          timestamp: proposal.endTime,
          for: safeLastPoint.for ?? 0,
          abstain: safeLastPoint.abstain ?? 0,
          against: safeLastPoint.against ?? 0,
          total: safeLastPoint.total ?? 0,
          quorumTotal: safeLastPoint.quorumTotal ?? 0,
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
            tick={{ fill: rgbStringToHex(ui.customization?.tertiary) }}
            tickFormatter={(value, index) =>
              yTickFormatter(value, index, proposal.proposalType === "SNAPSHOT")
            }
            tickLine={false}
            axisLine={false}
            width={54}
            tickMargin={4}
            tickCount={6}
            interval={0}
            domain={[
              0,
              () => {
                const quorumValue = proposal.quorum
                  ? +proposal.quorum.toString()
                  : 0;
                const maxQuorumTotal = Math.max(
                  ...chartData.map((d) => d.quorumTotal ?? 0)
                );
                const maxValue = Math.max(maxQuorumTotal, quorumValue);

                if (maxValue <= 1) {
                  return 1;
                } else if (maxValue <= 10) {
                  return Math.ceil(maxValue);
                } else {
                  return maxValue * 1.1;
                }
              },
            ]}
            ticks={(() => {
              const quorumValue = proposal.quorum
                ? +proposal.quorum.toString()
                : 0;
              const maxValue = Math.max(
                Math.max(...chartData.map((d) => d.quorumTotal ?? 0)),
                quorumValue
              );

              if (maxValue <= 1) {
                return [0, 1];
              } else if (maxValue <= 10) {
                return Array.from({ length: maxValue + 1 }, (_, i) => i);
              } else {
                const step = Math.ceil(maxValue / 5);
                return Array.from({ length: 6 }, (_, i) => i * step);
              }
            })()}
          />
          {minQuorumValue !== null &&
          maxQuorumValue !== null &&
          minQuorumValue !== maxQuorumValue ? (
            <>
              {/* Min quorum line */}
              <ReferenceLine
                y={minQuorumValue}
                strokeWidth={1}
                strokeDasharray="3 3"
                stroke="#4F4F4F"
                strokeOpacity={0.6}
                label={{
                  position: "insideBottomLeft",
                  value: "MIN QUORUM",
                  className: "text-xs font-inter font-semibold",
                  fill: "#565656",
                }}
              />
              {/* Max quorum line */}
              <ReferenceLine
                y={maxQuorumValue}
                strokeWidth={1}
                strokeDasharray="3 3"
                stroke="#4F4F4F"
                strokeOpacity={0.6}
                label={{
                  position: "insideTopLeft",
                  value: "MAX QUORUM",
                  className: "text-xs font-inter font-semibold",
                  fill: "#565656",
                }}
              />
            </>
          ) : (
            !!proposal.quorum &&
            !isProposalCreatedBeforeUpgrade && (
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
            )
          )}

          <Tooltip
            content={
              <CustomTooltip
                quorum={isProposalCreatedBeforeUpgrade ? null : proposal.quorum}
                minQuorumPct={minQuorumPct}
                maxQuorumPct={maxQuorumPct}
                governorType={contracts.governorType}
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
            stackId={stackIds.abstain}
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
  proposalType,
  governorType,
}: {
  votes: ChartVote[];
  block: Block;
  proposalType?: string;
  governorType?: GOVERNOR_TYPE;
}) => {
  let forCount = 0;
  let abstain = 0;
  let against = 0;
  let timestamp = null;

  return votes.map((vote) => {
    forCount = vote.support === "1" ? forCount + Number(vote.weight) : forCount;
    abstain = vote.support === "2" ? abstain + Number(vote.weight) : abstain;
    against = vote.support === "0" ? against + Number(vote.weight) : against;
    if (proposalType === "SNAPSHOT") {
      timestamp = new Date(Number(vote.created) * 1000);
    } else {
      timestamp = getHumanBlockTime(vote.block_number, block);
    }

    let quorumTotal = forCount + abstain + against;
    if (governorType === GOVERNOR_TYPE.ENS) {
      quorumTotal = forCount + abstain;
    } else if (governorType === GOVERNOR_TYPE.BRAVO) {
      quorumTotal = forCount;
    }

    return {
      weight: Number(vote.weight),
      for: forCount,
      abstain: abstain,
      against: against,
      timestamp: timestamp,
      total: forCount + abstain + against,
      quorumTotal: quorumTotal,
      isSnapshot: proposalType === "SNAPSHOT",
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

const yTickFormatter = (value: any, _: number, isSnapshot = false) => {
  if (value <= 10) {
    return value.toString();
  }

  const roundedValue = Math.round(value);
  const isSciNotation = isScientificNotation(roundedValue.toString());
  const decimals = isSnapshot ? 0 : token.decimals;

  return formatNumber(
    isSciNotation
      ? formatNumberWithScientificNotation(roundedValue)
      : BigInt(roundedValue),
    decimals,
    2
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

const CustomTooltip = ({
  active,
  payload,
  label,
  quorum,
  minQuorumPct,
  maxQuorumPct,
  governorType,
}: any) => {
  const forVotes = payload.find((p: any) => p.name === "For");
  const againstVotes = payload.find((p: any) => p.name === "Against");
  const abstainVotes = payload.find((p: any) => p.name === "Abstain");
  const voteOrder = ["For", "Against", "Abstain"];
  const isSnapshot = payload[0]?.payload?.isSnapshot;

  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort(
      (a, b) => voteOrder.indexOf(a.name) - voteOrder.indexOf(b.name)
    );

    const integerForVotes = Math.round(Number(forVotes.value));
    const integerAgainstVotes = Math.round(Number(againstVotes.value));
    const integerAbstainVotes = Math.round(Number(abstainVotes.value));

    let quorumVotes =
      BigInt(integerForVotes) +
      BigInt(integerAbstainVotes) +
      BigInt(integerAgainstVotes);

    if (governorType === GOVERNOR_TYPE.ENS) {
      quorumVotes = quorumVotes - BigInt(integerAgainstVotes);
    }

    if (governorType === GOVERNOR_TYPE.BRAVO) {
      quorumVotes = BigInt(integerForVotes);
    }

    const hasQuorumRange =
      minQuorumPct !== null &&
      maxQuorumPct !== null &&
      minQuorumPct !== maxQuorumPct;

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
                BigInt(Math.round(Number(entry.value))),
                isSnapshot ? 0 : token.decimals,
                entry.value > 1_000_000 ? 2 : 4
              )}
            </span>
          </div>
        ))}
        {(!!quorum || hasQuorumRange) && (
          <div className="flex justify-between items-center gap-4 text-xs pt-2 border-t border-line border-dashed mt-2">
            <span className="text-secondary">Quorum:</span>
            {hasQuorumRange ? (
              <div className="flex items-center gap-1">
                <span className="font-mono text-primary">
                  {`${minQuorumPct}% – ${maxQuorumPct}%`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono ${
                    quorumVotes > quorum ? "text-primary" : "text-tertiary"
                  }`}
                >
                  {formatNumber(
                    BigInt(quorumVotes),
                    isSnapshot ? 0 : token.decimals,
                    quorumVotes > 1_000_000 ? 2 : 4
                  )}
                </span>
                <span className="text-primary">/</span>
                <span className="font-mono text-primary">
                  {formatNumber(
                    BigInt(quorum),
                    isSnapshot ? 0 : token.decimals,
                    quorum > 1_000_000 ? 2 : 4
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};
