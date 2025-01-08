import DelegatesBarChart from "./DelegatesBarChart";
import { getDelegates } from "../../actions/getDelegates";
import { Block } from "ethers";

const DelegationsDataView = async ({ latestBlock }: { latestBlock: Block }) => {
  const delegates = await getDelegates({
    range: 60 * 60 * 24 * 7 * 5,
    interval: 60 * 60 * 24 * 7,
  });

  return (
    <>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">
          Delegation participation
        </h2>
      </div>
      <div className="mt-6 w-full h-[600px]">
        <DelegatesBarChart data={delegates} latestBlock={latestBlock} />
      </div>
    </>
  );
};

export default DelegationsDataView;
