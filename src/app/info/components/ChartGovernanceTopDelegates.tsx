"use client";
import React, { useEffect, useRef, useState } from "react";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";
import HumanAddress from "@/components/shared/HumanAddress";

type ChartData = {
  address: string;
  weight: string;
};

interface Props {
  getData: () => Promise<{ result: ChartData[] }>;
}

const ChartGovernanceTopDelegates = ({ getData }: Props) => {
  const { primary } = useTenantColorScheme();

  const getDynamicColor = (value: number, maxValue: number): string => {
    const opacity = value / maxValue;
    return `rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, ${opacity})`;
  };

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

  const max = Math.max(...data.map((item) => Number(item.weight)));

  return (
    <div>
      <div className="flex border border-black rounded-md overflow-hidden h-10 mt-4 sm:mt-12">
        {data.map((item, index) => (
          <div
            key={index}
            className={`h-full ${index < data.length - 1 ? "border-r" : ""} border-black`}
            style={{
              flex: item.weight,
              backgroundColor: getDynamicColor(Number(item.weight), max),
            }}
          ></div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 justify-start items-start pt-2">
        {data.map((item, index) => (
          <div className="pt-4" key={index}>
            <div className="flex flex-row gap-2">
              <div
                className="w-2 h-2 mt-1"
                style={{ backgroundColor: primary }}
              />
              <div className="flex flex-col">
                <h3 className="text-xs font-semibold text-gray-4f">
                  <HumanAddress address={item.address} />
                </h3>
                <p className="text-xs font-medium text-gray-4f">
                  {Number(item.weight).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartGovernanceTopDelegates;
