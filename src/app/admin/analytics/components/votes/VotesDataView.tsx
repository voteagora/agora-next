"use client";

import { Block } from "ethers";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getVotes } from "../../actions/getVotes";
import VotesBarChart from "./VotesBarChart";
import LoadingChart from "../LoadingChart";

const dayInSeconds = 60 * 60 * 24;

const VotesDataView = async ({ latestBlock }: { latestBlock: Block }) => {
  const [selectedRange, setSelectedRange] = useState<1 | 7 | 30 | 365>(1);
  const range = dayInSeconds * selectedRange;

  const { data: votesData, isLoading } = useQuery({
    queryKey: ["votes", range],
    queryFn: () => getVotes({ range }),
  });

  return (
    <>
      {isLoading ? (
        <LoadingChart type="bar" />
      ) : !votesData ? (
        <div>No data</div>
      ) : (
        <VotesBarChart data={votesData} latestBlock={latestBlock} />
      )}

      <div className="absolute bottom-4 right-4 rounded-xl border border-line p-2 flex flex-row gap-2">
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedRange === 365 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedRange(365)}
        >
          1Y
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedRange === 30 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedRange(30)}
        >
          1M
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedRange === 7 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedRange(7)}
        >
          1W
        </span>
        <span
          className={cn(
            "text-sm hover:bg-tertiary/5 rounded-full px-2 py-1 cursor-pointer",
            selectedRange === 1 && "bg-tertiary/5"
          )}
          onClick={() => setSelectedRange(1)}
        >
          1D
        </span>
      </div>
    </>
  );
};

export default VotesDataView;
