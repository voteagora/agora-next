"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { delegatesFilterOptions } from "@/lib/constants";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";

export default function DelegatesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const orderByParam = searchParams?.get("orderBy");
  const { setIsDelegatesFiltering } = useAgoraContext();

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === delegatesFilterOptions.weightedRandom.value
        ? deleteSearchParam({ name: "orderBy" })
        : addSearchParam({ name: "orderBy", value }),
      { scroll: false }
    );
  };

  return (
    <Listbox
      as="div"
      value={orderByParam || delegatesFilterOptions.weightedRandom.value}
      onChange={(value) => handleChange(value)}
    >
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {delegatesFilterOptions[
              orderByParam as keyof typeof delegatesFilterOptions
            ]?.value || delegatesFilterOptions.weightedRandom.value}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.entries(delegatesFilterOptions).map(([key, option]) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
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
