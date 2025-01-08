import { getVotes } from "../../actions/getVotes";
import VotesBarChart from "./VotesBarChart";

const VotesDataView = async () => {
  const votes = await getVotes();

  return (
    <>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">
          Voter participation
        </h2>
      </div>
      <div className="mt-6 w-full h-[400px]">
        <VotesBarChart data={votes} />
      </div>
    </>
  );
};

export default VotesDataView;
