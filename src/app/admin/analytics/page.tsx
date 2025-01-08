import AnalyticsContainer from "./components/AnalyticsContainer";
import VotesDataView from "./components/votes/VotesDataView";
import DelegationsDataView from "./components/delegates/DelegationsDataView";
import ProposalsDataView from "./components/proposals/ProposalsDataView";
import { Suspense } from "react";
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

const LoadingChart = ({
  chartName = "Loading chart",
  type = "bar",
}: {
  chartName?: string;
  type?: "bar" | "pie";
}) => {
  const numOfCols = type === "bar" ? 8 : 1;
  return (
    <>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">{chartName}</h2>
      </div>
      <div className="mt-6 w-full h-[400px]">
        <div className="grid grid-cols-8 gap-4 h-full">
          {[...Array(numOfCols)].map((i) => (
            <div
              key={i}
              className="w-full bg-gray-200 rounded block place-self-end animate-pulse"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const AnalyticsPage = async () => {
  const { contracts } = Tenant.current();
  const latestBlock = await contracts.token.provider.getBlock("latest");
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mt-6">
        Agora analytics dashboard
      </h1>
      <AnalyticsContainer
        votesComponent={
          <Suspense
            fallback={
              <LoadingChart type="bar" chartName="Voter participation" />
            }
          >
            <VotesDataView />
          </Suspense>
        }
        delegatesComponent={
          <Suspense
            fallback={
              <LoadingChart type="bar" chartName="Delegation participation" />
            }
          >
            <DelegationsDataView latestBlock={latestBlock as Block} />
          </Suspense>
        }
        proposalsComponent={
          <Suspense
            fallback={<LoadingChart type="bar" chartName="Proposal creation" />}
          >
            <ProposalsDataView />
          </Suspense>
        }
      />
    </div>
  );
};

export default AnalyticsPage;
