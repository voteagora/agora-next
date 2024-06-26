import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import ChartDataFilterTabs from "../../app/info/components/ChartDataFilterTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

const data = [
  { name: "Prop 154...", value: 14 },
  { name: "Prop 712...", value: 8 },
  { name: "Prop 231...", value: 14 },
  { name: "Prop 541...", value: 11 },
  { name: "Prop 785...", value: 14 },
  { name: "Prop 124...", value: 13 },
  { name: "Prop 142...", value: 14 },
  { name: "Prop 235...", value: 12 },
  { name: "Prop 654...", value: 13 },
  { name: "Prop 100...", value: 13 },
  { name: "Prop 123...", value: 13 },
];

const AverageVoterProposalChart = () => {
  const { primary } = useTenantColorScheme();

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ bottom: 24, top: 10, left: 0 }}>
          <XAxis
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
            dataKey="name"
            stroke="#000"
            tick={{
              textAnchor: "end",
              fontSize: 10,
              fontFamily: "Arial",
              fill: "#666",
              //@ts-ignore
              angle: -45,
            }}
            className="text-xs font-medium text-gray-4f"
            interval={0}
            height={60}
            padding={{ left: 5, right: 5 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickCount={7}
            interval={0}
            width={30}
            tickMargin={0}
            tickFormatter={(value) => `${value}`}
            className="text-xs font-medium text-gray-4f"
          />
          <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="5 5" />
          <Bar dataKey="value" fill={primary} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-row justify-end">
        <ChartDataFilterTabs />
      </div>
    </div>
  );
};

export default AverageVoterProposalChart;
