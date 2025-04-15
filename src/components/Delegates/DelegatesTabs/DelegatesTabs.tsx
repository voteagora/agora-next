"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DelegatesSearch from "@/components/Delegates/DelegatesTabs/DelegatesSearch";
import { useState, useTransition, type ReactNode } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

import DelegatesSortFilter from "@/components/Delegates/DelegatesFilter/DelegatesSortFilter";
import CitizensSortFilter from "@/components/Delegates/DelegatesFilter/CitizensSortFilter";
import { DelegatesFilter } from "@/components/Delegates/DelegatesFilter/DelegatesFilter";

import { DelegatesFilterChips } from "@/components/Delegates/DelegatesTabs/DelegatesFilterChips";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { GridLayoutIcon } from "@/icons/GridLayoutIcon";
import { ListViewIcon } from "@/icons/ListViewIcon";

export default function DelegatesTabs({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "delegates",
    shallow: false,
    startTransition,
  });
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "grid",
    shallow: false,
  });

  const { ui } = Tenant.current();

  const hasCitizens = ui.toggle("citizens")?.enabled;

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const toggleExpandMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev);
  };

  return (
    <Tabs
      className="max-w-full"
      value={tab}
      onValueChange={(value) => handleTabChange(value)}
    >
      <div className="flex flex-row justify-between items-baseline gap-2 mt-3 sm:mt-0">
        <TabsList>
          <TabsTrigger className="" value="delegates">
            Delegates
          </TabsTrigger>
          {hasCitizens && (
            <TabsTrigger className="" value="citizens">
              Citizens
            </TabsTrigger>
          )}
        </TabsList>
        <div className="flex flex-row self-end sm:justify-between gap-2 w-fit">
          <DelegatesSearch className="hidden sm:block" />
          <div
            className={cn(isMobileSearchOpen ? "hidden" : "block sm:hidden")}
          >
            <button
              onClick={() => toggleExpandMobileSearch()}
              className="flex items-center justify-center p-3 rounded-sm sm:rounded-lg bg-wash border border-line"
              aria-label="Open search"
            >
              <MagnifyingGlassIcon className="text-primary w-4 h-4" />
            </button>
          </div>
          {tab === "citizens" ? (
            <CitizensSortFilter />
          ) : (
            <>
              <div className="items-center gap-2 hidden sm:flex">
                <DelegatesSortFilter />
                <DelegatesFilter />
              </div>
              <div className="block sm:hidden">
                {/* <MobileDelegatesFilter /> */}
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
                <GridLayoutIcon
                  className={
                    layout === "grid"
                      ? "h-4 w-4 fill-primary"
                      : "h-4 w-4 sm:fill-secondary/30 fill-primary"
                  }
                />
              </button>
              <button
                onClick={() => {
                  setLayout("list");
                }}
                className={layout === "list" ? "hidden sm:block" : ""}
                disabled={layout === "list"}
              >
                <ListViewIcon
                  className={
                    layout === "list"
                      ? "h-4 w-4 fill-primary"
                      : "h-4 w-4 sm:fill-secondary/30 fill-primary"
                  }
                />
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        {isMobileSearchOpen && (
          <DelegatesSearch
            className="block sm:hidden mt-2.5"
            closeButton
            onClose={toggleExpandMobileSearch}
          />
        )}
      </div>
      <div>
        <DelegatesFilterChips />
      </div>
      <div className={cn(isPending && "animate-pulse")}>{children}</div>
    </Tabs>
  );
}
