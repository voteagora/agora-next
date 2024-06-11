"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./InfoTabs";

const data = [
  {
    name: "Nov '23",
    uv: 700,
  },
  {
    name: "Dec '23",
    uv: 1000,
  },
  {
    name: "Jan '24",
    uv: 800,
  },
  {
    name: " Feb '24",
    uv: 1700,
  },
  {
    name: "Mar '24",
    uv: 1400,
  },
  {
    name: "Apr '24",
    uv: 1700,
  },

  {
    name: "Mar '24",
    uv: 900,
  },
  {
    name: "Mar '24",
    uv: 600,
  },
  {
    name: "Apr '24",
    uv: 1800,
  },
];

const AvgDelegteChart = () => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          className="text-xs font-medium font-inter text-gray-4f"
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 4, 32, 0.60)" />
              <stop offset="100%" stopColor="#FFF" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Area
            type="step"
            dataKey="uv"
            stroke="#3B9BF4"
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex flex-row  justify-between mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div className="w-4 h-[2px] bg-[#FF0420]"></div>
          <p className="text-xs font-semibold text-gray-4f">
            Avg # of voters per proposal
          </p>
        </div>

        <div className="w-[274px] flex justify-between items-center p-1 rounded-full border bg-white shadow-sm">
          <Tabs defaultValue="24h">
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="1m">1m</TabsTrigger>
              <TabsTrigger value="3m">3m</TabsTrigger>
              <TabsTrigger value="1y">1y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AvgDelegteChart;
