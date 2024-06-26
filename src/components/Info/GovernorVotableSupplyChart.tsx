import React, { useEffect, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrequencyTabs from "../../app/info/components/ChartFrequencyTabs";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import type { MetricTimeSeriesValue } from "@/lib/types";
import { FREQUENCY_FILTERS } from "@/lib/constants";
import { formatNumber, scientificNotationToPrecision } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

interface GovernorVotableSupplyChartProps {
  getData: (
    metric: string,
    frequency: string
  ) => Promise<{ result: MetricTimeSeriesValue[] }>;
}

const GovernorVotableSupplyChart = ({
  getData,
}: GovernorVotableSupplyChartProps) => {
  const { primary, gradient } = useTenantColorScheme();
  const { token } = Tenant.current();

  const [filter, setFilter] = useState<FREQUENCY_FILTERS>(
    FREQUENCY_FILTERS.WEEK
  );
  const shouldFetchData = useRef(true);
  const [data, setData] = useState<MetricTimeSeriesValue[] | undefined>();

  const getChartData = async (frequency: string) => {
    if (shouldFetchData.current) {
      shouldFetchData.current = false;
      const result = await getData("total_votable_supply", frequency);
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
            dataKey="date"
            textAnchor="middle"
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
            className="text-xs font-medium text-gray-4f"
            minTickGap={12}
          />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            tickCount={7}
            width={100}
            tickFormatter={(value) => {
              return `${formatNumber(scientificNotationToPrecision(value.toString()), token.decimals)}`;
            }}
            className="text-xs font-medium text-gray-4f"
          />

          <Tooltip />
          <Area
            type="step"
            dataKey="value"
            stroke={primary}
            fill="url(#colorAllDelegates)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-row flex-wrap  sm:gap-0 gap-2 justify-between pl-10 sm:pl-14 mt-6">
        <div className="flex flex-row gap-1 justify-center items-center">
          <div
            style={{ backgroundColor: primary }}
            className="w-4 h-[2px]"
          ></div>
          <p className="text-xs font-semibold text-gray-4f">
            Total Votable Supply
          </p>
        </div>

        <ChartFrequencyTabs onChange={onFilterChange} />
      </div>
    </div>
  );
};

export default GovernorVotableSupplyChart;
