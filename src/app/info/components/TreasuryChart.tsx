"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrequencyTabs from "./ChartFrequencyTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import { FREQUENCY_FILTERS } from "@/lib/constants";
import type { MetricTimeSeriesValue } from "@/lib/types";

interface TreasuryChartProps {
  getData: (frequency: string) => Promise<{ result: MetricTimeSeriesValue[] }>;
  initialData: MetricTimeSeriesValue[];
}

export const TreasuryChart = ({ getData, initialData }: TreasuryChartProps) => {
  const { primary, gradient } = useTenantColorScheme();

  const [filter, setFilter] = useState<FREQUENCY_FILTERS>(
    FREQUENCY_FILTERS.WEEK
  );
  const shouldFetchData = useRef(false);
  const [data, setData] = useState<MetricTimeSeriesValue[] | undefined>(
    initialData
  );

  const getChartData = async (frequency: string) => {
    if (shouldFetchData.current) {
      shouldFetchData.current = false;
      const result = await getData(frequency);
      setData(result.result);
    }
  };

  const onFilterChange = (value: FREQUENCY_FILTERS) => {
    shouldFetchData.current = true;
    setFilter(value);
  };

  useEffect(() => {
    if (filter && shouldFetchData.current) {
      getChartData(filter);
    }
  }, [filter]);

  return (
    <div>
      <h3 className="text-2xl font-black text-black mt-10">Treasury value</h3>
      <div className="border border-gray-300 rounded-lg w-full mt-4">
        <div className="border-b border-gray-300 p-6">
          <p className="text-base font-semibold text-black">Total Value</p>
          <p className="text-xs font-medium text-gray-4f">$70,800,012.23</p>
        </div>
        <div className="p-4 sm:p-8 pb-6 !w-full">
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
                textAnchor="middle"
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={{ stroke: "#E0E0E0" }}
                minTickGap={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickCount={7}
                interval={0}
                width={100}
                tickFormatter={(value) => `$${value}`}
                className="text-xs font-medium text-gray-4f"
              />
              <Tooltip />
              <Area
                type="linear"
                dataKey="balance_usd"
                stroke={primary}
                fill="url(#colorAllDelegates)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-end pl-10 sm:pl-14 mt-6">
            <ChartFrequencyTabs onChange={onFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
};
