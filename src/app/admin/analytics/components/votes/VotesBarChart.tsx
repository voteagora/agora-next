"use client";

import { Block } from "ethers";
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
import { truncateString } from "@/app/lib/utils/text";

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-bold">{truncateString(label, 50)}</p>
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
      </div>
    );
  }
  return null;
};

export default function VotesBarChart({
  data,
  latestBlock,
}: {
  data: any;
  latestBlock: Block;
}) {
  if (data.length === 0) {
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
          tickFormatter={(name) => {
            const maxLength = 20;
            const truncatedName = name.slice(1); // gets rid of "hashtag" # that starts all props
            return truncatedName.length > maxLength
              ? `${truncatedName.slice(0, maxLength)}...`
              : truncatedName;
          }}
          dataKey="name"
          angle={-15}
          textAnchor="end"
          height={100}
          tick={{
            fontSize: 12,
          }}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value) => value.replace(/_/g, " ")} />
        <Bar
          dataKey="votes_on_agora"
          stackId="a"
          fill="#82ca9d"
          name="Votes on Agora"
        />
        <Bar
          dataKey="votes_elsewhere"
          stackId="a"
          fill="#C95687"
          name="Votes elsewhere"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
