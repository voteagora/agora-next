"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Nov '23",
    uv: 900,
  },
  {
    name: "Dec '23",
    uv: 600,
  },
  {
    name: "Jan '24",
    uv: 1100,
  },
  {
    name: " Feb '24",
    uv: 700,
  },
  {
    name: "Mar '24",
    uv: 1500,
  },
  {
    name: "Apr '24",
    uv: 1700,
  },
  {
    name: " Feb '24",
    uv: 1200,
  },
  {
    name: "Mar '24",
    uv: 900,
  },
  {
    name: "Apr '24",
    uv: 400,
  },
];
const DaosTreasuryChart = () => {
  return (
    <div>
      <h3 className="text-2xl font-black text-black mt-10">Analytics</h3>
      <p className="text-base font-semibold text-black mb-4">Treasury</p>

      <div className="border border-gray-300 rounded-lg p-4 pb-2 w-full font-inter">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
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
              type="linear"
              dataKey="uv"
              stroke="#FF0420"
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DaosTreasuryChart;
