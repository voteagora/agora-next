import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
} from "recharts";
import GovernanceChartTooltip from "./GovernanceChartTooltip";
import ChartDataFilterTabs from "./ChartDataFilterTabs";
import { getTextWidth } from "@/lib/utils";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

interface DataPoint {
  name: string;
  allDelegates: number;
  topDelegates: number;
}

const data: DataPoint[] = [
  { name: "Nov '23", allDelegates: 70, topDelegates: 60 },
  { name: "Dec '23", allDelegates: 60, topDelegates: 50 },
  { name: "Jan '24", allDelegates: 56, topDelegates: 100 },
  { name: "Feb '24", allDelegates: 35, topDelegates: 90 },
  { name: "Mar '24", allDelegates: 80, topDelegates: 45 },
  { name: "Apr '24", allDelegates: 23, topDelegates: 32 },
  { name: "May '24", allDelegates: 80, topDelegates: 90 },
  { name: "Jun '24", allDelegates: 120, topDelegates: 80 },
  { name: "May '24", allDelegates: 40, topDelegates: 30 },
  { name: "Jun '24", allDelegates: 20, topDelegates: 10 },
];

const GovernanceActiveDelegateChart: React.FC = () => {
  const [yAxisWidth, setYAxisWidth] = useState(0);

  const { primary } = useTenantColorScheme();

  useEffect(() => {
    const maxTickWidth = Math.max(
      ...data.map((d) => getTextWidth(d.allDelegates.toString()) || 0)
    );
    setYAxisWidth(maxTickWidth + 20); // Add some padding
  }, []);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          className="text-xs font-medium font-inter text-gray-4f"
        >
          <defs>
            <linearGradient id="colorAllDelegates" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 4, 32, 0.60)" />
              <stop offset="100%" stopColor="#FFF" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            textAnchor="left"
            className="text-xs font-medium text-gray-4f"
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
          />
          <YAxis
            className="text-xs font-medium text-gray-4f"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            width={yAxisWidth}
            tickCount={7}
          />
          <Tooltip
            content={<GovernanceChartTooltip />}
            cursor={{ stroke: "red", strokeWidth: 2, strokeDasharray: "7 7" }}
          />

          <Area
            type="linear"
            dataKey="allDelegates"
            stroke={primary}
            fill="url(#colorAllDelegates)"
            name="All delegates"
          />
          <Line
            type="linear"
            dataKey="topDelegates"
            stroke={primary}
            strokeDasharray="5 5"
            name=">100k tokens"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row justify-between mt-6 pl-16">
        <div className="flex flex-row gap-[14px]">
          <div className="flex flex-row gap-1 justify-center items-center">
            <div className={`w-4 h-[2px] bg-[${primary}]`}></div>
            <p className="text-xs font-semibold text-gray-4f">All delegates</p>
          </div>
          <div className="flex flex-row gap-1 justify-center items-center">
            <div
              className={`w-4 h-[8px] border-b border-dashed border-[${primary}`}
            />
            <p className="text-xs font-semibold text-gray-4f">100k tokens</p>
          </div>
        </div>

        <ChartDataFilterTabs />
      </div>
    </div>
  );
};

export default GovernanceActiveDelegateChart;
