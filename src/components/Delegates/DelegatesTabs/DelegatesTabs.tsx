"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import CitizensFilter from "@/components/Delegates/DelegatesFilter/CitizensFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { useState, type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import StakeholdersFilter from "@/app/delegates/components/StakeholdersFilter";
import IssuesFilter from "@/app/delegates/components/IssuesFilter";
import EndorsedFilter from "@/app/delegates/components/EndorsedFilter";
import DelegateeFilter from "@/app/delegates/components/DelegatorFilter";
import { LayoutGrid, AlignJustify } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

export default function DelegateTabs({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");

  const [value, setValue] = useState(tabParam || "delegates");

  const { layout, setLayout } = useLayout();

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

  const router = useRouter();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();

  const hasCitizens = ui.toggle("citizens")?.enabled;

  const handleTabChange = (value: string) => {
    setValue(value);
    router.push(
      value === "citizens"
        ? addSearchParam({ name: "tab", value, clean: true })
        : deleteSearchParam({ name: "tab", clean: true }),
      { scroll: false }
    );
  };

  return (
    <Tabs
      className="max-w-full"
      value={value}
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
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit">
          <DelegatesSearch />
          {hasMyDelegatesFilter && <DelegateeFilter />}
          {hasStakeholdersFilter && tabParam !== "citizens" && (
            <StakeholdersFilter />
          )}
          {hasIssuesFilter && tabParam !== "citizens" && <IssuesFilter />}
          {hasEndorsedFilter && tabParam !== "citizens" && <EndorsedFilter />}
          {tabParam === "citizens" ? <CitizensFilter /> : <DelegatesFilter />}
          {value === "delegates" && (
            <div className="flex items-center gap-2 bg-wash rounded-full px-4 py-2">
              <button onClick={() => setLayout("grid")}>
                <LayoutGrid
                  className={`h-6 w-6 ${layout === "grid" ? "text-secondary" : "text-secondary/30"}`}
                />
              </button>
              <button onClick={() => setLayout("list")}>
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
