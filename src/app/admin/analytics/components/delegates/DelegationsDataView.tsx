"use client";

import DelegatesBarChart from "./DelegatesBarChart";
import { getDelegates } from "../../actions/getDelegates";
import { Block } from "ethers";
import { useQuery } from "@tanstack/react-query";
import LoadingChart from "../LoadingChart";

const DelegationsDataView = ({ latestBlock }: { latestBlock: Block }) => {
  const interval = 60 * 60 * 24 * 7;
  const range = interval * 5;

  const { data: delegateData, isLoading } = useQuery({
    queryKey: ["delegates", range, interval],
    queryFn: () => getDelegates({ range, interval }),
  });

  if (isLoading) return <LoadingChart type="bar" />;
  if (!delegateData) return <div>No data</div>;

  return (
    <>
      <DelegatesBarChart
        data={delegateData}
        latestBlock={latestBlock}
        interval={interval}
      />
      <div className="absolute bottom-4 right-4 rounded-xl border border-line p-2 flex flex-row gap-2">
        <span>1Y</span>
        <span>1M</span>
        <span>1W</span>
        <span>1D</span>
      </div>
    </>
  );
};

export default DelegationsDataView;
