import ProposalsBarChart from "./ProposalsBarChart";
import { getProposals } from "../../actions/getProposals";

const ProposalsDataView = async () => {
  const proposals = await getProposals();

  return (
    <>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">
          Proposal creation
        </h2>
      </div>
      <div className="mt-6 w-full h-[400px]">
        <ProposalsBarChart data={proposals} />
      </div>
    </>
  );
};

export default ProposalsDataView;
