"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import CitizensFilter from "@/components/Delegates/DelegatesFilter/CitizensFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useRouter } from "next/navigation";

export default function DelegateTabs({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const tabParam = searchParams?.get("tab");
  const { ui } = Tenant.current();

  const hasCitizens = ui.toggle("citizens")?.enabled;

  const handleTabChange = (value: string) => {
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
      defaultValue={tabParam || "delegates"}
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
          {tabParam === "citizens" ? <CitizensFilter /> : <DelegatesFilter />}
        </div>
      </div>
      {children}
    </Tabs>
  );
}
