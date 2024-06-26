"use client";
import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import ChartDataFilterTabs from "../../app/info/components/ChartDataFilterTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

const data = [
  {
    date: "Nov '23",
    value: 1200,
  },
  {
    date: "Dec '23",
    value: 900,
  },
  {
    date: "Jan '24",
    value: 1500,
  },
  {
    date: " Feb '24",
    value: 1000,
  },
  {
    date: "Mar '24",
    value: 1700,
  },
  {
    date: "Apr '24",
    value: 1300,
  },
  {
    date: " Feb '24",
    value: 2000,
  },
  {
    date: "Mar '24",
    value: 1300,
  },
  {
    date: "Apr '24",
    value: 1900,
  },
  {
    date: " Feb '24",
    value: 1300,
  },
  {
    date: "Mar '24",
    value: 900,
  },
  {
    date: "Apr '24",
    value: 700,
  },
];

const getTextWidth = (text: string, font = "14px inter") => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return 0;
};

const PortalTrafficVisitorsChart = () => {
  const [yAxisWidth, setYAxisWidth] = useState(0);
  const { primary, gradient } = useTenantColorScheme();

  useEffect(() => {
    const maxTickWidth = Math.max(
      ...data.map((d) => getTextWidth(d.value.toString()) || 0)
    );
    setYAxisWidth(maxTickWidth + 20); // Add some padding
  }, []);
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
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
            className="text-xs font-medium text-gray-4f"
            dataKey="date"
            textAnchor="left"
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickCount={7}
            interval={0}
            width={yAxisWidth}
            tickFormatter={(value) => `$${value}b`}
            className="text-xs font-medium text-gray-4f"
          />
          <Area
            type="linear"
            dataKey="value"
            stroke={primary}
            fill="url(#colorAllDelegates)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-between pl-10 sm:pl-14 mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div className="w-4 h-[2px] bg-[#FF0420]"></div>
          <p className="text-xs font-semibold text-gray-4f">All visitors</p>
        </div>

        <ChartDataFilterTabs />
      </div>
    </div>
  );
};

export default PortalTrafficVisitorsChart;
