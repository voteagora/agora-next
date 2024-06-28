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

type ChartData = {
  proposalId: string;
  voter_count: string;
};

interface AverageVoterProposalChartProps {
  getData: () => Promise<{ result: ChartData[] }>;
}

const AverageVoterProposalChart = ({
                                     getData,
                                   }: AverageVoterProposalChartProps) => {
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
            dataKey="proposalId"
            textAnchor="middle"
            minTickGap={12}
            axisLine={{ stroke: "#E0E0E0" }}
            tickLine={{ stroke: "#E0E0E0" }}
            padding={{ left: 5, right: 5 }}
            className="text-xs font-medium text-gray-4f"
          />
          <Tooltip />
          <YAxis
            domain={[0, max]}
            dataKey="voter_count"
            tickLine={false}
            axisLine={false}
            tickCount={7}
            interval={0}
            width={100}
            tickMargin={0}
            tickFormatter={(value) => (value > 0 ? `${value}` : "")}
            className="text-xs font-medium text-gray-4f"
          />
          <CartesianGrid vertical={false} stroke="#ccc" strokeDasharray="5 5" />
          <Bar dataKey="votes" fill={primary} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AverageVoterProposalChart;
