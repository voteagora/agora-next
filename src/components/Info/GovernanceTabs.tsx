"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvgDelegteChart from "./AvgDelegteChart";

interface TabProps {
  value: string;
  title: string;
  description: string;
}

const TabTrigger: React.FC<TabProps> = ({ value, title, description }) => {
  return (
    <TabsTrigger
      value={value}
      className="flex flex-col opacity-100 !border-gray-300 first:rounded-tl-lg last:rounded-tr-lg  border-r bg-gray-fa data-[state=active]:bg-white p-8 pb-6 w-full last:border-0 "
    >
      <h3 className="text-base font-semibold text-black">{title}</h3>
      <p className="text-xs font-medium text-gray-4f">{description}</p>
    </TabsTrigger>
  );
};

const GovernanceTabs = () => {
  const tabs = [
    {
      value: "top-delegates",
      title: "Top delegates",
      description: "Top 10 by token holdings",
    },
    {
      value: "active-delegates",
      title: "Active delegates",
      description: "45.6%",
    },
    {
      value: "avg-voters",
      title: "Avg voters / proposal",
      description: "67.5 voters",
    },
    {
      value: "delegates-needed",
      title: "Delegates needed",
      description: "4 to reach quorum",
    },
    {
      value: "total-votable-supply",
      title: "Total votable supply",
      description: "2.24M tokens",
    },
  ];

  return (
    <Tabs defaultValue="top-delegates" className="my-10">
      <TabsList className="flex flex-row !gap-0 rounded-none rounded-t-lg border !border-gray-300 h-fit">
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.value}
            value={tab.value}
            title={tab.title}
            description={tab.description}
          />
        ))}
      </TabsList>

      <TabsContent
        className="mt-0 border border-t-0 border-gray-300 rounded-b-lg p-8 pb-6  w-full"
        value="top-delegates"
      >
        <AvgDelegteChart />
      </TabsContent>
      <TabsContent
        value="delegate-needed"
        className="mt-0 border border-t-0 border-gray-300 rounded-b-lg p-8 pb-6  w-full"
      ></TabsContent>
    </Tabs>
  );
};

export default GovernanceTabs;
