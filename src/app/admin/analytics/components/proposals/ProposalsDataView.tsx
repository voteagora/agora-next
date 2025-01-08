import ProposalsBarChart from "./ProposalsBarChart";
import { getProposals } from "../../actions/getProposals";

const ProposalsDataView = async () => {
  const proposals = await getProposals();

  return <ProposalsBarChart data={proposals} />;
};

export default ProposalsDataView;
