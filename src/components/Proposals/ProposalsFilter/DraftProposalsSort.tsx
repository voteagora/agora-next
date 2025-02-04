"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { draftProposalsSortOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam } from "@/hooks/useAddSearchParam";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

const getSortOptionValue = (sort: string) => {
  const sortOption = Object.values(draftProposalsSortOptions).find(
    (option) => option.sort === sort
  );

  return sortOption?.value || draftProposalsSortOptions.newest.value;
};

export default function DraftProposalsSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const sortParam = searchParams?.get("sort");
  const [selected, setSelected] = useState(
    sortParam || draftProposalsSortOptions.newest.sort
  );
  const [sortOptions, setSortOptions] = useState<
    Record<string, { value: string; sort: string }>
  >(draftProposalsSortOptions);

  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");
  const proposalLifecycleConfig = plmToggle?.config as PLMConfig;
  const tenantSupportsVotes = proposalLifecycleConfig?.votes;

  useEffect(() => {
    if (!tenantSupportsVotes) {
      let updatedSortOptions: { [key: string]: any } = {
        ...draftProposalsSortOptions,
      };
      delete updatedSortOptions.mostVotes;
      delete updatedSortOptions.leastVotes;
      setSortOptions(updatedSortOptions);
    }
  }, [tenantSupportsVotes]);

  useEffect(() => {
    const handleChanges = (value: string) => {
      router.push(addSearchParam({ name: "sort", value }), { scroll: false });
    };

    handleChanges(selected);
  }, [router, selected]);

  return (
    <div className="relative w-full sm:w-fit">
      <Listbox value={selected} onChange={setSelected}>
        <Listbox.Button className="w-full sm:w-fit bg-wash text-primary font-medium border-none rounded-full py-2 px-4 flex items-center justify-between">
          <span>{getSortOptionValue(selected)}</span>
          <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
        </Listbox.Button>
        <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-10 w-max">
          {Object.values(sortOptions).map((option) => (
            <Listbox.Option key={option.sort} value={option.sort}>
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
