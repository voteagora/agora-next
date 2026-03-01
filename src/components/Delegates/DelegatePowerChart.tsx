"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatNumber } from "@/lib/utils";

interface DelegatePowerChartProps {
  delegates: any[];
}

export default function DelegatePowerChart({ delegates }: DelegatePowerChartProps) {
  // Process the top 10 delegates
  const chartData = useMemo(() => {
    if (!delegates || delegates.length === 0) return [];
    
    // Create a copy and sort by voting power descending just to be safe
    const sorted = [...delegates].sort(
      (a, b) => Number(b.votingPower?.total || 0) - Number(a.votingPower?.total || 0)
    );
    
    // Take the top 10
    return sorted.slice(0, 10).map((d) => ({
      name: d.account?.ensName || d.address?.substring(0, 6) + "..." + d.address?.substring(d.address.length - 4),
      votingPower: Number(d.votingPower?.total || 0),
      rawAddress: d.address,
    }));
  }, [delegates]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full bg-tertiary/5 border border-tertiary/10 rounded-xl p-6 mb-8 mt-4 shadow-sm backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-primary">Delegation Power Distribution</h2>
        <p className="text-secondary text-sm">Top 10 Delegates by Voting Power</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barCategoryGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-tertiary)" opacity={0.3} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatNumber(value as unknown as string, 0, 0, false, true)}
              stroke="var(--text-secondary)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              stroke="var(--text-secondary)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-neutral bg-opacity-90 backdrop-blur-md border border-tertiary/20 p-3 rounded-lg shadow-xl">
                      <p className="text-primary font-medium mb-1">{payload[0].payload.name}</p>
                      <p className="text-secondary text-sm">
                        Power: <span className="font-bold text-primary">{formatNumber(payload[0].value?.toString() || "0", 0)}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="votingPower" 
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // Use a gradient-like approach with CSS variables or fallback to generic colors
                  fill={`hsl(var(--next-primary, 220), ${80 - index * 4}%, ${60 + index * 2}%)`} 
                  className="hover:brightness-110 transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
