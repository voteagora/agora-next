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
import ChartTabs from "./ChartTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import { FREQUENCY_FILTERS } from "@/lib/constants";
import type { MetricTimeSeriesValue } from "@/lib/types";
import { humanizeNumber, humanizeNumberContact } from "@/lib/utils";

interface Props {
  getData: (frequency: string) => Promise<{ result: MetricTimeSeriesValue[] }>;
  initialData: MetricTimeSeriesValue[];
}

export const ChartTreasury = ({ getData, initialData }: Props) => {
  const { primary, gradient } = useTenantColorScheme();

  const [filter, setFilter] = useState<FREQUENCY_FILTERS>(
    FREQUENCY_FILTERS.YEAR
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

  if (!data) {
    return <div>Loading...</div>;
  }

  const max = Math.max(...data.map((d) => parseInt(d.value)));

  return (
    <div>
      <h3 className="text-2xl font-black text-black mt-10">Treasury value</h3>
      <div className="border border-gray-300 rounded-lg w-full mt-4">
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
                axisLine={{ stroke: "#E0E0E0" }}
                className="text-xs font-medium text-gray-4f"
                dataKey="date"
                minTickGap={30}
                textAnchor="middle"
                tickLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis
                axisLine={false}
                className="text-xs font-medium text-gray-4f"
                dataKey="value"
                domain={[0, max]}
                interval={"preserveStartEnd"}
                tickFormatter={(value) =>
                  value > 0 ? `$${humanizeNumberContact(value, 3)}` : ""
                }
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="linear"
                dataKey="value"
                stroke={primary}
                fill="url(#colorAllDelegates)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-end pl-10 sm:pl-14 mt-6">
            <ChartTabs onChange={onFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded shadow-lg">
        <p className="text-xs font-medium text-gray-4f">{`${label}`}</p>
        <div className="flex flex-row gap-1 justify-center items-center text-center mt-4">
          <p className="text-xs font-medium text-gray-4f ">
            Treasury value
            <span className="font-bold pl-2">{`$${humanizeNumber(payload[0].value)}`}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
