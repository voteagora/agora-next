"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { proposalsFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProposalsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get("filter");
  const [selected, setSelected] = useState(filterParam || proposalsFilterOptions.recent.filter);

  // TODO: -> this router.push is super slow but window.history.pushState does not revalidate the query and the
  // problem using revalidatePath is that it erases searchParams, another idea to optimize this filter is to prefetch
  // the data, also use hooks useAddSearchParam and useDeleteSearchParam

  const isRecentFilter = selected === proposalsFilterOptions.recent.filter;

  useEffect(() => {
    const handleChanges = (value: string) => {
      isRecentFilter ? router.push("/") : router.push(`/?filter=${value}`);
    };

    handleChanges(selected);
  }, [router, selected]);


  return (
    <Listbox as="div" value={selected} onChange={setSelected}>
      {() => (
        <>
          <Listbox.Button
            className="w-full md:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {isRecentFilter ? proposalsFilterOptions.recent.value : proposalsFilterOptions.cancelled.value}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options
            className="mt-3 absolute bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1">
            {Object.entries(proposalsFilterOptions).map(([key, option]) => (
              <Listbox.Option key={key} value={option.filter} as={Fragment}>
                {({ selected }) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        selected
                          ? "text-black bg-white border-[#ebebeb]"
                          : "text-[#66676b] border-transparent"
                      }`}
                    >
                      {option.value}
                    </li>
                  );
                }}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  );
}
