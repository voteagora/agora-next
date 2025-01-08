import { getVotes } from "../../actions/getVotes";
import VotesBarChart from "./VotesBarChart";

const VotesDataView = async () => {
  const votes = await getVotes();

  return <VotesBarChart data={votes} />;
};

export default VotesDataView;
