import React, { useEffect, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTabs from "./ChartTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import type { MetricTimeSeriesValue } from "@/lib/types";
import { FREQUENCY_FILTERS } from "@/lib/constants";

interface Props {
  getData: (
    metric: string,
    frequency: string
  ) => Promise<{ result: MetricTimeSeriesValue[] }>;
}

type ChartData = {
  active: string;
  large: string;
  date: string;
};

const ChartGovernanceActiveDelegates = ({ getData }: Props) => {
  const { primary } = useTenantColorScheme();

  const [filter, setFilter] = useState<FREQUENCY_FILTERS>(
    FREQUENCY_FILTERS.YEAR
  );
  const shouldFetchData = useRef(true);
  const [data, setData] = useState<ChartData[] | undefined>();

  const getChartData = async (frequency: string) => {
    if (shouldFetchData.current) {
      shouldFetchData.current = false;

      const active = await getData("fraction_of_active_delegates", frequency);
      const large = await getData(
        "fraction_of_large_active_delegates",
        frequency
      );

      // Combine majority and quorum data into a single index-based array
      const combined = active.result.map((item, index) => {
        return {
          active: item.value,
          large: large.result[index].value,
          date: item.date,
        };
      });
      setData(combined);
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

  const max = Math.max(...data.map((d) => parseInt(d.large)));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
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
            dataKey="large"
            domain={[0, max]}
            interval={"preserveStartEnd"}
            tickFormatter={(value) => (value > 0 ? `${value.toFixed(0)}%` : "")}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="linear"
            dataKey="active"
            stroke={primary}
            fill="url(#colorAllDelegates)"
            name="All delegates"
          />
          <Line
            type="linear"
            dataKey="large"
            stroke={primary}
            strokeDasharray="3 3"
            name=">100k tokens"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-between pl-10 sm:pl-14 mt-6">
        <div className="flex flex-row gap-[14px]">
          <div className="flex flex-row gap-1 justify-center items-center">
            <div
              style={{ backgroundColor: primary }}
              className="w-4 h-[2px]"
            ></div>
            <p className="text-xs font-semibold text-gray-4f">All Delegates</p>
          </div>
          <div className="flex flex-row gap-1 justify-center items-center">
            <div
              style={{ borderColor: primary }}
              className="w-4 border border-b-1 border-dashed"
            />
            <p className="text-xs font-semibold text-gray-4f">
              Delegates with over 100K tokens
            </p>
          </div>
        </div>

        <ChartTabs onChange={onFilterChange} />
      </div>
    </div>
  );
};

export default ChartGovernanceActiveDelegates;

const CustomTooltip = ({ active, payload, label }: any) => {
  const { primary } = useTenantColorScheme();

  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded shadow-lg">
        <p className="text-xs font-medium text-gray-4f">{`${label}`}</p>
        <div className="flex flex-row gap-1 justify-center items-center text-center mt-4">
          <div
            style={{ backgroundColor: primary }}
            className="w-4 h-[2px]"
          ></div>
          <p className="text-xs font-medium text-gray-4f ">
            All Delegates
            <span className="font-bold pl-3">
              {Number(payload[0].value).toFixed(2)}%
            </span>
          </p>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center mt-2">
          <div
            style={{ borderColor: primary }}
            className="w-4 border border-b-1 border-dashed"
          />
          <p className="text-xs font-medium text-gray-4f">
            Whales
            <span className="font-bold pl-6">
              {Number(payload[1].value).toFixed(2)}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
