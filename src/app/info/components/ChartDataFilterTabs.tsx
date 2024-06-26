import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

enum FREQUENCY {
  DAY = "24h",
  WEEK = "7d",
  MONTH = "1m",
  QUARTER = "3m",
  YEAR = "1y",
}

interface ChartDataFilterTabsProps {
  onChange: (frequency: string) => void;
}

const ChartDataFilterTabs = ({ onChange }: ChartDataFilterTabsProps) => {
  return (
    <Tabs defaultValue={FREQUENCY.DAY} onValueChange={(value) => onChange(value)}>
      <TabsList className="w-fit gap-2 px-1 rounded-full border bg-white shadow-sm text-xs p-1">
        <TabsTrigger className="h-full" variant="gray" value={FREQUENCY.DAY}>
          {FREQUENCY.DAY}
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value={FREQUENCY.WEEK}>
          {FREQUENCY.WEEK}
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value={FREQUENCY.MONTH}>
          {FREQUENCY.MONTH}
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value={FREQUENCY.QUARTER}>
          {FREQUENCY.QUARTER}
        </TabsTrigger>
        <TabsTrigger className="h-full" variant="gray" value={FREQUENCY.DAY}>
          {FREQUENCY.YEAR}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ChartDataFilterTabs;
