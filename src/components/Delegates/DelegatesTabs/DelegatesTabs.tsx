"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import CitizensFilter from "@/components/Delegates/DelegatesFilter/CitizensFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import StakeholdersFilter from "@/app/delegates/components/StakeholdersFilter";
import IssuesFilter from "@/app/delegates/components/IssuesFilter";
import EndorsedFilter from "@/app/delegates/components/EndorsedFilter";
import DelegateeFilter from "@/app/delegates/components/DelegatorFilter";
import { LayoutGrid, AlignJustify } from "lucide-react";
import { useQueryState } from "nuqs";

export default function DelegateTabs({ children }: { children: ReactNode }) {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "delegates",
  });
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "grid",
  });

  const { ui } = Tenant.current();

  const hasIssuesFilter = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );
  const hasStakeholdersFilter = Boolean(
    ui.governanceStakeholders && ui.governanceStakeholders.length > 0
  );
  const hasEndorsedFilter = Boolean(
    ui.toggle("delegates/endorsed-filter")?.enabled
  );

  const hasMyDelegatesFilter = Boolean(
    ui.toggle("delegates/my-delegates-filter")?.enabled
  );

  const hasCitizens = ui.toggle("citizens")?.enabled;

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  return (
    <Tabs
      className="max-w-full"
      value={tab}
      onValueChange={(value) => handleTabChange(value)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <TabsList>
          <TabsTrigger className="text-2xl" value="delegates">
            Delegates
          </TabsTrigger>
          {hasCitizens && (
            <TabsTrigger className="text-2xl" value="citizens">
              Citizens
            </TabsTrigger>
          )}
        </TabsList>
        <div className="flex flex-col sm:flex-row justify-between gap-3 w-full sm:w-fit overflow-x-auto">
          <DelegatesSearch />
          {hasMyDelegatesFilter && <DelegateeFilter />}
          {hasStakeholdersFilter && tab !== "citizens" && (
            <StakeholdersFilter />
          )}
          {hasIssuesFilter && tab !== "citizens" && <IssuesFilter />}
          {hasEndorsedFilter && tab !== "citizens" && <EndorsedFilter />}
          {tab === "citizens" ? <CitizensFilter /> : <DelegatesFilter />}
          {tab !== "citizens" && (
            <div className="flex items-center gap-2 bg-wash rounded-full px-4 py-2 shrink-0">
              <button
                onClick={() => {
                  setLayout("grid", { shallow: true });
                }}
                disabled={layout === "grid"}
              >
                <LayoutGrid
                  className={`h-6 w-6 ${layout === "grid" ? "text-secondary" : "text-secondary/30"}`}
                />
              </button>
              <button
                onClick={() => {
                  setLayout("list", { shallow: true });
                }}
                disabled={layout === "list"}
              >
                <AlignJustify
                  className={`h-6 w-6 ${layout === "list" ? "text-primary" : "text-secondary/30"}`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </Tabs>
  );
}
