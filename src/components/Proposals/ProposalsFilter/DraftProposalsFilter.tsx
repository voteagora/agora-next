"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { draftProposalsFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam } from "@/hooks/useAddSearchParam";

const getFilterOptionValue = (filter: string) => {
  const filterOption = Object.values(draftProposalsFilterOptions).find(
    (option) => option.filter === filter
  );

  return filterOption?.value || draftProposalsFilterOptions.allDrafts.value;
};

export default function DraftProposalsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const filterParam = searchParams?.get("filter");
  const [selected, setSelected] = useState(
    filterParam || draftProposalsFilterOptions.allDrafts.filter
  );
  const isAllDraftsFilter =
    selected === draftProposalsFilterOptions.allDrafts.filter;

  useEffect(() => {
    const handleChanges = (value: string) => {
      router.push(addSearchParam({ name: "filter", value }), { scroll: false });
    };

    handleChanges(selected);
  }, [router, selected, isAllDraftsFilter]);

  return (
    <div className="relative w-full sm:w-fit">
      <Listbox value={selected} onChange={setSelected}>
        <Listbox.Button className="w-full sm:w-fit bg-wash text-base font-medium border-none rounded-full py-2 px-4 flex items-center justify-between">
          <span>{getFilterOptionValue(selected)}</span>
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