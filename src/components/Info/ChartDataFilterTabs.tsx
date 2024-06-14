import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const ChartDataFilterTabs = () => {
  return (
    <Tabs defaultValue="24h">
      <TabsList className="w-fit gap-2 px-1 rounded-full border bg-white shadow-sm text-xs p-1">
        <TabsTrigger className="h-full" variant="gray" value="24h">
          24h
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value="7d">
          7d
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value="1m">
          1m
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value="3m">
          3m
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value="1y">
          1y
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ChartDataFilterTabs;
