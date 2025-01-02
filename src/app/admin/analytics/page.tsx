import { getVotes } from "./actions/getVotes";
import VotesDataView from "./components/VotesDataView";

const AnalyticsPage = async () => {
  const votes = await getVotes();
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mt-6">Analytics</h1>
      <VotesDataView votes={votes} />
    </div>
  );
};

export default AnalyticsPage;
