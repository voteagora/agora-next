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
import { Tabs, TabsList, TabsTrigger } from "./InfoTabs";

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
  return (
    <div>
      <h3 className="text-2xl font-black text-black mt-10">Analytics</h3>
      <p className="text-base font-semibold text-black mb-4">Treasury</p>

      <div className="border border-gray-300 rounded-lg w-full">
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
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(59, 155, 244, 0.6)" />
                  <stop offset="100%" stop-color="#FFFFFF" />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                className="text-xs font-inter font-semibold text-gray-af"
                dataKey="date"
                textAnchor="middle"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickCount={7}
                interval={0}
                width={30}
                tickMargin={0}
                tickFormatter={(value) => `$${value}b`}
              />
              <Area
                type="linear"
                dataKey="value"
                stroke="#3B9BF4"
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex flex-row  justify-between mt-6">
            <div className="flex flex-row gap-1 justify-center items-center">
              <div className="w-4 h-[2px] bg-[#3B9BF4]"></div>
              <p className="text-xs font-semibold text-gray-4f">Total value</p>
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
      </div>
    </div>
  );
};

export default DaosTreasuryChart;
