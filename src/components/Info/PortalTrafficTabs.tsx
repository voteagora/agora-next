"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalTrafficVisitorsChart from "./PortalTrafficVisitorsChart";

interface TabProps {
  value: string;
  title: string;
  description: string;
}

const TabTrigger: React.FC<TabProps> = ({ value, title, description }) => {
  return (
    <TabsTrigger
      value={value}
      className="flex flex-col opacity-100 border !border-gray-300 border-t-0 border-l-0 first:rounded-tl-lg last:rounded-tr-lg  bg-gray-fa data-[state=active]:bg-white p-4 sm:p-8 w-full"
    >
      <h3 className="text-sm sm:text-base font-semibold text-black">{title}</h3>
      <p className="text-xs font-medium text-gray-4f">{description}</p>
    </TabsTrigger>
  );
};

const PortalTrafficTabs = () => {
  const tabs = [
    {
      value: "unique-visitors",
      title: "Unique Visitors",
      description: "12,400 last 30 days",
    },
    {
      value: "page-views",
      title: "Pageviews",
      description: "2,600 last 30 days",
    },
    {
      value: "bounce-rate",
      title: "Bounce Rate",
      description: "67.5 voters",
    },
    {
      value: "avg-session-duration",
      title: "Avg Session Duration",
      description: "2.24M OP",
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-2xl font-black text-black">Portal Traffic</h3>
      <Tabs defaultValue="unique-visitors" className="mt-4 border rounded-lg">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 !gap-0 w-full h-fit">
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
          className="p-4 sm:p-8 pb-6 !w-full"
          value="unique-visitors"
        >
          <PortalTrafficVisitorsChart />
        </TabsContent>
        <TabsContent value="page-views" className="w-full px-4 sm:px-8 py-3">
          {/* <GovernanceDelegateChart /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortalTrafficTabs;
