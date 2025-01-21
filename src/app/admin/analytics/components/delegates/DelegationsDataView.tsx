"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Block } from "ethers";
import { useState } from "react";
import { getDelegates } from "../../actions/getDelegates";
import LoadingChart from "../LoadingChart";
import DelegatesBarChart from "./DelegatesBarChart";

const dayInSeconds = 60 * 60 * 24;

const DelegationsDataView = ({ latestBlock }: { latestBlock: Block }) => {
  const [selectedInterval, setSelectedInterval] = useState<1 | 7 | 30 | 365>(1);
  const interval = dayInSeconds * selectedInterval;
  const numOfIntervals = 5;

  const { data: delegateData, isLoading } = useQuery({
    queryKey: ["delegates", interval, numOfIntervals],
    queryFn: () => getDelegates({ interval, numOfIntervals }),
  });

  return (
    <>
      {isLoading ? (
        <LoadingChart type="bar" />
      ) : !delegateData ? (
        <div>No data</div>
      ) : (
        <DelegatesBarChart
          data={delegateData}
          latestBlock={latestBlock}
          interval={interval}
        />
      )}
      <div className="absolute bottom-4 right-4 rounded-xl border border-line p-2 flex flex-row gap-2">
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedInterval === 365 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedInterval(365)}
        >
          1Y
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedInterval === 30 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedInterval(30)}
        >
          1M
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedInterval === 7 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedInterval(7)}
        >
          1W
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedInterval === 1 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedInterval(1)}
        >
          1D
        </span>
      </div>
    </>
  );
};

export default DelegationsDataView;
