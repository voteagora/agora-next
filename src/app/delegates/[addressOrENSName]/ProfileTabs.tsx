"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tenant from "@/lib/tenant/tenant";

const TAB_PARAM = "tab";

export function ProfileTabs({
  initialTab,
  children,
}: {
  initialTab: string;
  children: React.ReactNode;
}) {
  const { ui } = Tenant.current();
  const copy = ui.copy;
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
          {copy.delegates.profile.statementTab}
        </TabsTrigger>
        <TabsTrigger value="participation" variant="underlined">
          {copy.delegates.profile.participationTab}
        </TabsTrigger>
        <TabsTrigger value="delegations" variant="underlined">
          {copy.delegates.profile.delegationsTab}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
