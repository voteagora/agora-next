import React, { useEffect, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getTextWidth } from "@/lib/utils";
import ChartDataFilterTabs from "./ChartDataFilterTabs";

const data = [
  { name: "Nov '23", uv: 220, pv: 11 },
  { name: "Dec '23", uv: 80, pv: 14 },
  { name: "Jan '24", uv: 150, pv: 9 },
  { name: "Feb '24", uv: 60, pv: 18 },
  { name: "Mar '24", uv: 200, pv: 15 },
  { name: "Apr '24", uv: 170, pv: 18 },
  { name: "May '24", uv: 130, pv: 10 },
  { name: "Jun '24", uv: 100, pv: 7 },
  { name: "Jul '24", uv: 60, pv: 19 },
];

const GovernorVotableSupplyChart = () => {
  const yTicks = [0, 50, 100, 150, 200, 250, 280];
  const [yAxisWidth, setYAxisWidth] = useState(0);

  useEffect(() => {
    const maxTickWidth = Math.max(
      ...data.map((d) => getTextWidth(d.pv.toString()) || 0)
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
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
            className="text-xs font-medium text-gray-4f"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={yTicks}
            width={yAxisWidth}
            className="text-xs font-medium text-gray-4f"
          />

          <Area
            type="step"
            dataKey="uv"
            stroke="#FF0420"
            fill="url(#colorAllDelegates)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row justify-between pl-16 mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div className="w-4 h-[2px] bg-[#FF0420]"></div>
          <p className="text-xs font-semibold text-gray-4f">
            Total votable token supply
          </p>
        </div>

        <ChartDataFilterTabs />
      </div>
    </div>
  );
};

export default GovernorVotableSupplyChart;
