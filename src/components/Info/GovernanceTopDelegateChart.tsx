"use client";
import React from "react";
import useTenantColorScheme from "@/hooks/useTenantColorScheme";

interface DataItem {
  name: string;
  value: number;
}

const data: DataItem[] = [
  { name: "Anti-capture commission", value: 11.17 },
  { name: "0xf1...c06b", value: 9.78 },
  { name: "0xef...71f1", value: 5.57 },
  { name: "l2beatcom.eth", value: 5.44 },
  { name: "lindajxie.eth", value: 4.74 },
  { name: "polynya.eth", value: 4.02 },
  { name: "lefteris.eth", value: 3.35 },
  { name: "olimpio.eth", value: 3.0 },
  { name: "gfxlabs.eth", value: 2.8 },
  { name: "0x16...d374", value: 2.67 },
  { name: "jackanorak.eth", value: 1.92 },
  { name: "OPSNXambassadors.eth", value: 1.92 },
  { name: "ceresstation.eth", value: 1.79 },
  { name: "ceresstation.eth", value: 1.79 },
];

const hightestValue = Math.max(...data.map((item) => item.value));

const GovernanceTopDelegateChart: React.FC = () => {
  const { primary } = useTenantColorScheme();

  const getDynamicColor = (value: number, maxValue: number): string => {
    const opacity = value / maxValue;
    return `rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, ${opacity})`;
  };

  return (
    <div>
      <div className="flex border border-black rounded-md overflow-hidden h-10 mt-4 sm:mt-12">
        {data.map((item, index) => (
          <div
            key={index}
            className={`h-full ${index < data.length - 1 ? "border-r" : ""} border-black`}
            style={{
              flex: item.value,
              backgroundColor: getDynamicColor(item.value, hightestValue),
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
                  {item.name}
                </h3>
                <p className="text-xs font-medium text-gray-4f">
                  {item.value.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovernanceTopDelegateChart;
