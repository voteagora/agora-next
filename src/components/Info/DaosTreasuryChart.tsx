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
import ChartDataFilterTabs from "./ChartDataFilterTabs";
import { getTextWidth } from "@/lib/utils";
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

const DaosTreasuryChart = () => {
  const [yAxisWidth, setYAxisWidth] = useState(0);

  const { primary, gradient } = useTenantColorScheme();

  useEffect(() => {
    const maxTickWidth = Math.max(
      ...data.map((d) => getTextWidth(d.value.toString()) || 0)
    );
    setYAxisWidth(maxTickWidth + 20); // Add some padding
  }, []);

  return (
    <div>
      <h3 className="text-2xl font-black text-black mt-10">Treasury value</h3>
      <div className="border border-gray-300 rounded-lg w-full mt-4">
        <div className="border-b border-gray-300 p-6">
          <p className="text-base font-semibold text-black">Total Value</p>
          <p className="text-xs font-medium text-gray-4f">$70,800,012.23</p>
        </div>
        <div className="w-full p-8 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              className="text-xs font-medium font-inter text-gray-4f"
            >
              <defs>
                <linearGradient
                  id="colorAllDelegates"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
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

          <div className="flex flex-row  justify-between mt-6 sm:pl-10">
            <div className="flex flex-row gap-1 justify-center items-center">
              <div className={`w-4 h-[2px] bg-[${primary}]`}></div>
              <p className="text-xs font-semibold text-gray-4f">Total value</p>
            </div>
            <ChartDataFilterTabs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaosTreasuryChart;
