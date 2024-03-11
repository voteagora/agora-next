"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import CitizensFilter from "@/components/Delegates/DelegatesFilter/CitizensFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { useState, type ReactNode } from "react";

export default function DelegateTabs({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const [selectedTab, setSelectedTab] = useState(tabParam || "delegates");

  // NOTE: Using window.history.pushState instead of router.push since router.push is waiting for API calls to resolve
  // in order to push the url
  const handleTabChange = (value: string) => {
    if (value === "citizens") {
      setSelectedTab("citizens");
      window.history.pushState({ tab: value }, "", `/delegates?tab=${value}`);
    } else {
      setSelectedTab("delegates");
      window.history.pushState({ tab: value }, "", "/delegates");
    }
  };

  return (
    <Tabs
      className="max-w-full"
      defaultValue={tabParam || "delegates"}
      onValueChange={(value) => handleTabChange(value)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <TabsList>
          <TabsTrigger className="text-2xl" value="delegates">
            Delegates
          </TabsTrigger>
          <TabsTrigger className="text-2xl" value="citizens">
            Citizens
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit">
          <DelegatesSearch />
          {selectedTab === "citizens" ? (
            <CitizensFilter />
          ) : (
            <DelegatesFilter />
          )}
        </div>
      </div>
      {children}
    </Tabs>
  );
}
