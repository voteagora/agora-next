import AnalyticsContainer from "./components/AnalyticsContainer";
import VotesDataView from "./components/votes/VotesDataView";
import DelegationsDataView from "./components/delegates/DelegationsDataView";
import ProposalsDataView from "./components/proposals/ProposalsDataView";
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

const AnalyticsPage = async () => {
  const { contracts } = Tenant.current();
  const latestBlock = await contracts.token.provider.getBlock("latest");

  return (
    <div>
      <h1 className="text-2xl font-black text-primary mt-6">Analytics</h1>
      <AnalyticsContainer
        votesComponent={<VotesDataView latestBlock={latestBlock as Block} />}
        delegatesComponent={
          <DelegationsDataView latestBlock={latestBlock as Block} />
        }
        proposalsComponent={
          <ProposalsDataView latestBlock={latestBlock as Block} />
        }
      />
    </div>
  );
};

export default AnalyticsPage;
