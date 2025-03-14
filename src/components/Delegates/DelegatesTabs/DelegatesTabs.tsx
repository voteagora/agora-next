"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DelegatesSearch from "@/components/Delegates/DelegatesTabs/DelegatesSearch";
import { useTransition, type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import { LayoutGrid, AlignJustify } from "lucide-react";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

import DelegatesSortFilter from "@/components/Delegates/DelegatesFilter/DelegatesSortFilter";
import CitizensSortFilter from "@/components/Delegates/DelegatesFilter/CitizensSortFilter";
import { DelegatesFilter } from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import { MobileDelegatesFilter } from "@/components/Delegates/DelegatesFilter/MobileDelegatesFilter";

import { DelegatesFilterChips } from "@/components/Delegates/DelegatesTabs/DelegatesFilterChips";

export default function DelegatesTabs({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "delegates",
    shallow: false,
    startTransition,
  });
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "grid",
    shallow: true,
  });

  const { ui } = Tenant.current();

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
        <div className="flex flex-row self-end sm:justify-between gap-3 w-fit">
          <div className="flex items-center gap-2">
            <DelegatesSearch />
          </div>
          <div className="flex items-center gap-2 flex-row-reverse sm:flex-row">
            {tab === "citizens" ? (
              <CitizensSortFilter />
            ) : (
              <>
                <div className="items-center gap-2 hidden sm:flex">
                  <DelegatesSortFilter />
                  <DelegatesFilter />
                </div>
                <div className="block sm:hidden">
                  <MobileDelegatesFilter />
                </div>
              </>
            )}
            {tab !== "citizens" && (
              <div className="flex items-center gap-2 bg-wash rounded-sm sm:rounded-lg border border-line px-3 py-3 shrink-0">
                <button
                  onClick={() => {
                    setLayout("grid");
                  }}
                  className={layout === "grid" ? "hidden sm:block" : ""}
                  disabled={layout === "grid"}
                >
                  <LayoutGrid
                    className={`h-4 w-4 text-primary sm:${layout === "list" ? "text-primary" : "text-secondary/30"}`}
                  />
                </button>
                <button
                  onClick={() => {
                    setLayout("list");
                  }}
                  className={layout === "list" ? "hidden sm:block" : ""}
                  disabled={layout === "list"}
                >
                  <AlignJustify
                    className={`h-4 w-4 text-primary sm:${layout === "list" ? "text-primary" : "text-secondary/30"}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <DelegatesFilterChips />
      </div>
      <div className={cn(isPending && "animate-pulse")}>{children}</div>
    </Tabs>
  );
}
