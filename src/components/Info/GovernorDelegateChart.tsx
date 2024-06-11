"use client";
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import PortalTrafficeTabs from "./PortalTrafficeTabs";

// Sample data
const data = [
  { name: "Nov '23", allDelegates: 20, topDelegates: 10 },
  { name: "Dec '23", allDelegates: 30, topDelegates: 15 },
  { name: "Jan '24", allDelegates: 44, topDelegates: 25 },
  { name: "Feb '24", allDelegates: 38, topDelegates: 30 },
  { name: "Mar '24", allDelegates: 50, topDelegates: 35 },
  { name: "Apr '24", allDelegates: 40, topDelegates: 25 },
  { name: "May '24", allDelegates: 35, topDelegates: 20 },
  { name: "Jun '24", allDelegates: 30, topDelegates: 15 },
];

const CustomTooltip = ({ payload, label, active }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-2 rounded shadow-lg">
        <p>{label}</p>
        <p className="text-red-600">{`All delegates: ${payload[0].value}%`}</p>
        {/* <p className="text-red-400">{`>100k tokens: ${payload[1].value}%`}</p> */}
      </div>
    );
  }
  return null;
};

const MyAreaChart = () => {
  <>
    <PortalTrafficeTabs />
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
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
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="linear"
          dataKey="allDelegates"
          stroke="#FF0420"
          fill="url(#colorAllDelegates)"
          name="All delegates"
        />
        <Line
          type="linear"
          dataKey="topDelegates"
          stroke="#FF0420"
          strokeDasharray="5 5"
          name=">100k tokens"
        />
      </AreaChart>
    </ResponsiveContainer>
  </>;
};

export default MyAreaChart;
