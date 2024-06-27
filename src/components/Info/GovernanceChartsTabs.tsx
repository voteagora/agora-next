"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AverageVoterProposalChart from "./AverageVoterProposalChart";
import GovernorDelegatesNeededChart from "./GovernorDelegatesNeededChart";
import GovernorVotableSupplyChart from "./GovernorVotableSupplyChart";
import GovernanceTopDelegateChart from "./GovernanceTopDelegateChart";
import GovernanceActiveDelegateChart from "./GovernanceActiveDelegateChart";

interface TabProps {
  value: string;
  title: string;
  description: string;
}

const TabTrigger: React.FC<TabProps> = ({ value, title, description }) => {
  return (
    <TabsTrigger
      value={value}
      className="flex flex-col last:col-span-2  last:sm:col-span-1  opacity-100 border !border-gray-300 border-t-0 border-l-0 first:rounded-tl-lg last:rounded-tr-lg  bg-gray-fa data-[state=active]:bg-white p-4 sm:p-8 w-full"
    >
      <h3 className="text-sm sm:text-base font-semibold text-black">{title}</h3>
      <p className="text-xs font-medium text-gray-4f">{description}</p>
    </TabsTrigger>
  );
};

interface GovernanceChartsTabsProps {
  getData: (metric: string, frequency: string) => Promise<any>;
}

const GovernanceChartsTabs = ({ getData }: GovernanceChartsTabsProps) => {
  const tabs = [
    {
      value: "top-delegates",
      title: "Top delegates",
      description: "",
    },
    {
      value: "active-delegates",
      title: "Active delegates",
      description: "",
    },
    {
      value: "avg-voters",
      title: "Avg voters / proposal",
      description: "",
    },
    {
      value: "delegates-needed",
      title: "Delegates needed",
      description: "",
    },
    {
      value: "total-votable-supply",
      title: "Total votable supply",
      description: "",
    },
  ];

  return (
    <div className="my-10 ">
      <h3 className="text-2xl font-black text-black">Governance</h3>
      <Tabs className="mt-4 border rounded-lg" defaultValue="top-delegates">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 !gap-0 w-full h-fit">
          {tabs.map((tab) => (
            <TabTrigger
              key={tab.value}
              value={tab.value}
              title={tab.title}
              description={tab.description}
            />
          ))}
        </TabsList>

        <TabsContent className="p-4 sm:p-8 pb-6 !w-full" value="top-delegates">
          <GovernanceTopDelegateChart />
        </TabsContent>
        <TabsContent
          value="active-delegates"
          className="w-full px-4 sm:px-8 py-3"
        >
          <GovernanceActiveDelegateChart getData={getData} />
        </TabsContent>
        <TabsContent value="avg-voters" className="!w-fullp-4 sm:p-8 pb-6">
          <AverageVoterProposalChart />
        </TabsContent>
        <TabsContent
          value="delegates-needed"
          className="!w-full px-4 sm:px-8 py-3"
        >
          <GovernorDelegatesNeededChart getData={getData} />
        </TabsContent>
        <TabsContent
          value="total-votable-supply"
          className="w-full px-4 sm:px-8 py-3"
        >
          <GovernorVotableSupplyChart getData={getData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernanceChartsTabs;
