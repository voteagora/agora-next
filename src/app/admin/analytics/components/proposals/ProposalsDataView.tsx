"use client";

import ProposalsBarChart from "./ProposalsBarChart";
import { getProposals } from "../../actions/getProposals";
import LoadingChart from "../LoadingChart";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Block } from "ethers";

const dayInSeconds = 60 * 60 * 24;

const ProposalsDataView = ({ latestBlock }: { latestBlock: Block }) => {
  const [selectedInterval, setSelectedInterval] = useState<1 | 7 | 30 | 365>(1);
  const interval = dayInSeconds * selectedInterval;
  const range = interval * 5;

  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ["proposals", range, interval],
    queryFn: () => getProposals({ range, interval }),
  });

  return (
    <>
      {isLoading ? (
        <LoadingChart type="bar" />
      ) : !proposalsData ? (
        <div>No data</div>
      ) : (
        <ProposalsBarChart
          data={proposalsData}
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

export default ProposalsDataView;
