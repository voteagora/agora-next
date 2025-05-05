"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_PARAM = "tab";

export function ProfileTabs({
  initialTab,
  children,
}: {
  initialTab: string;
  children: React.ReactNode;
}) {
  const [activeTab, setTab] = useQueryState(TAB_PARAM, {
    defaultValue: initialTab,
    history: "push",
    shallow: true,
  });

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setTab(value)}
      className="w-full"
    >
      <TabsList className="mb-8">
        <TabsTrigger value="statement" variant="underlined">
          Statement
        </TabsTrigger>
        <TabsTrigger value="participation" variant="underlined">
          Participation
        </TabsTrigger>
        <TabsTrigger value="delegations" variant="underlined">
          Delegations
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
