import React, { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import { humanizeNumber } from "@/lib/utils";

type ChartData = {
  proposalId: string;
  voter_count: string;
};

interface Props {
  getData: () => Promise<{ result: ChartData[] }>;
}

const ChartGovernanceAvgVotes = ({ getData }: Props) => {
  const { primary } = useTenantColorScheme();

  const shouldFetchData = useRef(true);
  const [data, setData] = useState<ChartData[] | undefined>();

  const getChartData = async () => {
    if (shouldFetchData.current) {
      shouldFetchData.current = false;
      const data = await getData();

      setData(data.result);
    }
  };

  useEffect(() => {
    if (shouldFetchData.current) {
      getChartData();
    }
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const max = Math.max(...data.map((d) => parseInt(d.voter_count)));

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ bottom: 24, top: 10, left: 0 }}>
          <XAxis
            axisLine={{ stroke: "#E0E0E0" }}
            className="text-xs font-medium text-gray-4f"
            dataKey="proposalId"
            padding={{ left: 5, right: 5 }}
            textAnchor="middle"
            tickLine={{ stroke: "#E0E0E0" }}
          />
          <YAxis
            axisLine={false}
            tickCount={7}
            className="text-xs font-medium text-gray-4f"
            dataKey="voter_count"
            domain={[0, max]}
            tickFormatter={(value) =>
              value > 0 ? `${humanizeNumber(value)}` : ""
            }
            tickLine={false}
            tickMargin={0}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="5 5" />
          <Bar dataKey="voter_count" fill={primary} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartGovernanceAvgVotes;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded shadow-lg">
        <div className="flex flex-row gap-1 justify-center items-center text-center">
          <p className="text-xs font-medium text-gray-4f ">
            Vote count
            <span className="font-bold pl-2">{`${humanizeNumber(payload[0].value)}`}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};
