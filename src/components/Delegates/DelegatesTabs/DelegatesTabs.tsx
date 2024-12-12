"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import CitizensFilter from "@/components/Delegates/DelegatesFilter/CitizensFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import StakeholdersFilter from "@/app/delegates/components/StakeholdersFilter";
import IssuesFilter from "@/app/delegates/components/IssuesFilter";
import EndorsedFilter from "@/app/delegates/components/EndorsedFilter";
import DelegateeFilter from "@/app/delegates/components/DelegatorFilter";
import { cn } from "@/lib/utils";

export default function DelegateTabs({ children }: { children: ReactNode }) {
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
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const tabParam = searchParams?.get("tab");

  const hasCitizens = ui.toggle("citizens")?.enabled;

  const handleTabChange = (value: string) => {
    router.push(
      value === "citizens"
        ? addSearchParam({ name: "tab", value, clean: true })
        : deleteSearchParam({ name: "tab", clean: true }),
      { scroll: false }
    );
  };

  console.log(tabParam);

  return (
    <Tabs
      className="max-w-full"
      defaultValue={tabParam || "delegates"}
      onValueChange={(value) => handleTabChange(value)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <TabsList>
          <TabsTrigger
            variant={
              tabParam === "delegates" || tabParam === null
                ? "newActive"
                : "newInactive"
            }
            value="delegates"
          >
            Delegates
          </TabsTrigger>
          {hasCitizens && (
            <TabsTrigger
              variant={tabParam === "citizens" ? "newActive" : "newInactive"}
              value="citizens"
            >
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
        </div>
      </div>
      {children}
    </Tabs>
  );
}
