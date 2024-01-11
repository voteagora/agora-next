"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import DelegatesSearch from "@/components/Delegates/DelegatesSearch/DelegatesSearch";
import { type ReactNode } from "react";

export default function DelegateTabs({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");

  return (
    <Tabs
      className="max-w-full mt-16"
      defaultValue={tabParam || "delegates"}
      onValueChange={(value) => router.push(`/delegates?tab=${value}`)}
    >
      <div className="flex flex-col md:flex-row justify-between items-baseline gap-2">
        <TabsList>
          <TabsTrigger className="text-2xl" value="delegates">
            Delegates
          </TabsTrigger>
          <TabsTrigger className="text-2xl" value="citizens">
            Citizens
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full md:w-fit">
          <DelegatesSearch />
          <DelegatesFilter />
        </div>
      </div>
      {children}
    </Tabs>
  );
}
