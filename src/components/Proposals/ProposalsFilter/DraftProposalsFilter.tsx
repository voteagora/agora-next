"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { draftProposalsFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam } from "@/hooks/useAddSearchParam";

export default function DraftProposalsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const filterParam = searchParams?.get("filter");
  const [selected, setSelected] = useState(
    filterParam || draftProposalsFilterOptions.myDrafts.filter
  );

  const isMyDraftsFilter =
    selected === draftProposalsFilterOptions.myDrafts.filter;

  useEffect(() => {
    const handleChanges = (value: string) => {
      isMyDraftsFilter
        ? addSearchParam({ name: "filter", value: "", clean: true })
        : addSearchParam({ name: "filter", value });
    };

    handleChanges(selected);
  }, [router, selected, isMyDraftsFilter]);

  return (
    <div className="relative">
      <Listbox value={selected} onChange={setSelected}>
        <Listbox.Button className="w-full sm:w-fit bg-wash text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
          {selected === draftProposalsFilterOptions.myDrafts.filter
            ? draftProposalsFilterOptions.myDrafts.value
            : draftProposalsFilterOptions.allDrafts.value}
          <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
          {Object.values(draftProposalsFilterOptions).map((option) => (
            <Listbox.Option key={option.filter} value={option.filter}>
              {({ selected }) => (
                <div
                  className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                    selected
                      ? "text-primary bg-neutral border-line"
                      : "text-tertiary border-transparent"
                  }`}
                >
                  {option.value}
                </div>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}
