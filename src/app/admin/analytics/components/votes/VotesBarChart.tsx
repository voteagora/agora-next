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

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const votesOnAgora = Number(payload[0].value);
    const votesElsewhere = Number(payload[1].value);
    const totalVotes = votesOnAgora + votesElsewhere;
    const percentage = ((votesOnAgora / totalVotes) * 100).toFixed(1);

    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-bold">{label}</p>
        <p>{`Votes on Agora: ${votesOnAgora}`}</p>
        <p>{`Votes elsewhere: ${votesElsewhere}`}</p>
        <p className="mt-2">{`Percentage on Agora: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

export default function VotesBarChart({ data }: { data: any }) {
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
            return `${name.slice(1)}`;
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
