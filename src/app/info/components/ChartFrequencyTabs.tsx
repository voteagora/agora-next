import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FREQUENCY_FILTERS } from "@/lib/constants";

interface ChartDataFilterTabsProps {
  onChange: (frequency: FREQUENCY_FILTERS) => void;
}

const ChartFrequencyTabs = ({ onChange }: ChartDataFilterTabsProps) => {
  return (
    <Tabs
      defaultValue={FREQUENCY_FILTERS.WEEK}
      onValueChange={(value) => onChange(value as FREQUENCY_FILTERS)}
    >
      <TabsList className="w-fit gap-2 px-1 rounded-full border bg-white shadow-sm text-xs p-1">
        <TabsTrigger
          className="h-full"
          variant="gray"
          value={FREQUENCY_FILTERS.DAY}
        >
          {FREQUENCY_FILTERS.DAY}
        </TabsTrigger>
        <TabsTrigger
          className="h-full"
          variant="gray"
          value={FREQUENCY_FILTERS.WEEK}
        >
          {FREQUENCY_FILTERS.WEEK}
        </TabsTrigger>
        <TabsTrigger
          className="h-full"
          variant="gray"
          value={FREQUENCY_FILTERS.MONTH}
        >
          {FREQUENCY_FILTERS.MONTH}
        </TabsTrigger>
        <TabsTrigger
          className="h-full"
          variant="gray"
          value={FREQUENCY_FILTERS.QUARTER}
        >
          {FREQUENCY_FILTERS.QUARTER}
        </TabsTrigger>
        <TabsTrigger
          className="h-full"
          variant="gray"
          value={FREQUENCY_FILTERS.YEAR}
        >
          {FREQUENCY_FILTERS.YEAR}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ChartFrequencyTabs;
