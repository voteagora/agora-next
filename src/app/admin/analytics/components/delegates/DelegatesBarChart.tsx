"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { getHumanBlockTime, getSecondsPerBlock } from "@/lib/blockTimes";
import { Block } from "ethers";
import { formatAbbreviatedDate } from "@/lib/utils";

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  latestBlock,
  blocksPerInterval,
}: TooltipProps<ValueType, NameType> & {
  latestBlock: Block;
  blocksPerInterval: number;
}) => {
  if (active && payload && payload.length) {
    const matches = Number(payload[0].value);
    const misses = Number(payload[1].value);
    const totalDelegates = matches + misses;
    const percentage =
      totalDelegates > 0 ? ((matches / totalDelegates) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-bold">{`${formatAbbreviatedDate(getHumanBlockTime(label, latestBlock))} - ${formatAbbreviatedDate(getHumanBlockTime(label + blocksPerInterval, latestBlock))}`}</p>
        {payload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex justify-between items-center gap-4 text-xs"
          >
            <span style={{ color: entry.color }}>
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}:
            </span>
            <span className="font-mono">{entry.value.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between items-center gap-4 text-xs">
          <span style={{ color: "#333" }}>Percentage:</span>
          <span className="font-mono">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DelegatesBarChart({
  data,
  latestBlock,
  interval,
}: {
  data: {
    matches: number;
    misses: number;
    startBlock: number;
    endBlock: number;
  }[];
  latestBlock: Block;
  interval: number;
}) {
  const secondsPerBlock = getSecondsPerBlock();
  const blocksPerInterval = interval / secondsPerBlock;

  const emptyData = data.every(
    (dataInterval) => dataInterval.matches === 0 && dataInterval.misses === 0
  );

  if (emptyData) {
    return (
      <div className="w-full h-[370px] flex items-center justify-center bg-tertiary/5  text-secondary">
        No data for this range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="startBlock"
          tickFormatter={(block) => {
            return `${formatAbbreviatedDate(getHumanBlockTime(block, latestBlock))} - ${formatAbbreviatedDate(getHumanBlockTime(block + blocksPerInterval, latestBlock))}`;
          }}
          angle={-0}
          textAnchor="middle"
          height={100}
          tick={{
            fontSize: 12,
          }}
        />
        <YAxis />
        <Tooltip
          content={
            <CustomTooltip
              latestBlock={latestBlock}
              blocksPerInterval={blocksPerInterval}
            />
          }
        />
        <Legend formatter={(value) => value.replace(/_/g, " ")} />
        <Bar
          dataKey="matches"
          stackId="a"
          fill="#82ca9d"
          name="Delegates on Agora"
        />
        <Bar
          dataKey="misses"
          stackId="a"
          fill="#C95687"
          name="Delegates elsewhere"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
