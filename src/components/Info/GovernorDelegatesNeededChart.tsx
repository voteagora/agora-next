"use client";
import React, { useEffect, useState } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { getTextWidth } from "@/lib/utils";
import ChartDataFilterTabs from "./ChartDataFilterTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

const data = [
  { name: "Nov '23", uv: 220, pv: 250 },
  { name: "Dec '23", uv: 80, pv: 220 },
  { name: "Jan '24", uv: 150, pv: 170 },
  { name: "Feb '24", uv: 60, pv: 200 },
  { name: "Mar '24", uv: 200, pv: 230 },
  { name: "Apr '24", uv: 170, pv: 200 },
  { name: "May '24", uv: 130, pv: 190 },
  { name: "Jun '24", uv: 100, pv: 160 },
  { name: "Jul '24", uv: 60, pv: 90 },
];

const yTicks = [0, 50, 100, 150, 200, 250, 280];

const GovernorDelegatesNeededChart = () => {
  const [yAxisWidth, setYAxisWidth] = useState(0);
  const { primary, gradient } = useTenantColorScheme();
  const primaryColorClass = `bg-[${primary}]`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-4 rounded shadow-lg">
          <p className="text-xs font-medium text-gray-4f">{`${label}`}</p>
          <div className="flex flex-row gap-1 justify-center items-center text-center mt-4">
            <div className={`w-4 h-[2px] ${primaryColorClass}`}></div>
            <p className="text-xs font-medium text-gray-4f ">
              To reach quorum{" "}
              <span className="font-bold pl-3">{payload[0].value}</span>
            </p>
          </div>
          <div className="flex flex-row gap-1 justify-center items-center mt-2">
            <div className={`w-4 h-[2px] ${primaryColorClass}`}></div>
            <p className="text-xs font-medium text-gray-4f">
              To reach 50%{" "}
              <span className="font-bold pl-6">{payload[1].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const maxTickWidth = Math.max(
      ...data.map((d) => getTextWidth(d.pv.toString()) || 0)
    );
    setYAxisWidth(maxTickWidth + 20);
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="step"
            dataKey="uv"
            stroke="primary"
            fill="url(#colorAllDelegates)"
          />
          <Line
            type="step"
            dataKey="pv"
            stroke={primary}
            strokeDasharray="3 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row justify-between pl-16 mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div className="w-4 h-[2px] bg-[#FF0420]"></div>
          <p className="text-xs font-semibold text-gray-4f">
            Avg # of voters per proposal
          </p>
        </div>

        <ChartDataFilterTabs />
      </div>
    </div>
  );
};

export default GovernorDelegatesNeededChart;
