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
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

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
  const { primary, gradient } = useTenantColorScheme();
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
              <stop offset="0%" stopColor={gradient.startColor} />
              <stop offset="100%" stopColor={gradient.endcolor} />
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
            stroke={primary}
            fill="url(#colorAllDelegates)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-between pl-10 sm:pl-14 mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div
            style={{ backgroundColor: primary }}
            className="w-4 h-[2px]"
          ></div>
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
