"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartGovernanceAvgVotes from "@/app/info/components/ChartGovernanceAvgVotes";
import ChartGovernanceRequiredDelegates from "@/app/info/components/ChartGovernanceRequiredDelegates";
import ChartGovernanceVotableSupply from "@/app/info/components/ChartGovernanceVotableSupply";
import ChartGovernanceTopDelegates from "@/app/info/components/ChartGovernanceTopDelegates";
import ChartGovernanceActiveDelegates from "@/app/info/components/ChartGovernanceActiveDelegates";

interface TabProps {
  value: string;
  title: string;
}

const TabTrigger: React.FC<TabProps> = ({ value, title }) => {
  return (
    <TabsTrigger
      value={value}
      className="flex flex-col last:col-span-2  last:sm:col-span-1  opacity-100 border !border-gray-300 border-t-0 border-l-0 first:rounded-tl-lg last:rounded-tr-lg  bg-gray-fa data-[state=active]:bg-white p-4 sm:p-8 w-full"
    >
      <h3 className="text-sm sm:text-base font-semibold text-black">{title}</h3>
    </TabsTrigger>
  );
};

interface GovernanceChartsProps {
  getMetrics: (metric: string, frequency: string) => Promise<any>;
  getVotes: () => Promise<any>;
  getDelegates: () => Promise<any>;
}

const GovernanceCharts = ({
  getMetrics,
  getVotes,
  getDelegates,
}: GovernanceChartsProps) => {
  const tabs = [
    {
      value: "top-delegates",
      title: "Top Delegates",
    },
    {
      value: "active-delegates",
      title: "Active Delegates",
    },
    {
      value: "avg-voters",
      title: "Proposal Voters",
    },
    {
      value: "delegates-needed",
      title: "Delegates needed",
    },
    {
      value: "total-votable-supply",
      title: "Total votable supply",
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-2xl font-black text-black">Governance</h3>
      <Tabs className="mt-4 border rounded-lg" defaultValue="top-delegates">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 !gap-0 w-full h-fit">
          {tabs.map((tab) => (
            <TabTrigger key={tab.value} value={tab.value} title={tab.title} />
          ))}
        </TabsList>

        <TabsContent className="p-4 sm:p-8 pb-6 !w-full" value="top-delegates">
          <ChartGovernanceTopDelegates getData={getDelegates} />
        </TabsContent>
        <TabsContent
          value="active-delegates"
          className="w-full px-4 sm:px-8 py-3"
        >
          <ChartGovernanceActiveDelegates getData={getMetrics} />
        </TabsContent>
        <TabsContent value="avg-voters" className="!w-fullp-4 sm:p-8 pb-6">
          <ChartGovernanceAvgVotes getData={getVotes} />
        </TabsContent>
        <TabsContent
          value="delegates-needed"
          className="!w-full px-4 sm:px-8 py-3"
        >
          <ChartGovernanceRequiredDelegates getData={getMetrics} />
        </TabsContent>
        <TabsContent
          value="total-votable-supply"
          className="w-full px-4 sm:px-8 py-3"
        >
          <ChartGovernanceVotableSupply getData={getMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernanceCharts;
