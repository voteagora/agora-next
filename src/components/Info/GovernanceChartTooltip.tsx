import React from "react";
import { TooltipProps } from "recharts";
import useColorPicker from "./useColorPicker";

interface CustomTooltipPayload {
  color: string;
  dataKey: string;
  name: string;
  value: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: CustomTooltipPayload[];
  label?: string;
  active?: boolean;
}

const GovernanceChartTooltip: React.FC<CustomTooltipProps> = ({
  payload,
  label,
  active,
}) => {
  const { primary } = useColorPicker();

  if (active && payload && payload.length) {
    const allDelegates = payload.find(
      (item) => item.dataKey === "allDelegates"
    );
    const topDelegates = payload.find(
      (item) => item.dataKey === "topDelegates"
    );

    return (
      <div className="bg-white border border-gray-200 p-4 rounded shadow-lg">
        <p className="text-xs font-medium text-gray-4f">{label}</p>
        <div className="flex flex-row gap-1 justify-between items-center mt-4">
          <div className={`w-4 border border-b-1 border-[${primary}]`} />

          {allDelegates && (
            <p className="text-xs font-medium text-gray-4f">
              All delegates{" "}
              <span className="ml-4 font-bold">{`${allDelegates.value}%`}</span>
            </p>
          )}
        </div>
        <div className="flex flex-row gap-1 justify-between items-center mt-2">
          <div
            className={`w-4 border border-b-1 border-dashed border-[${primary}]`}
          />
          {topDelegates && (
            <p className="text-xs font-medium text-gray-4f">
              {`>100k tokens `}
              <span className="ml-4 font-bold">{`${topDelegates.value}%`}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default GovernanceChartTooltip;
