"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";

const FILTER_PARAM = "delegateeFilter";
const DEFAULT_FILTER = "all_delegates";

export default function DelegateeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { address } = useAccount();

  const filterParam = searchParams?.get(FILTER_PARAM) || DEFAULT_FILTER;
  const delegateeFilterOptions: { value: string; sort: string }[] = [
    {
      value: "All delegates",
      sort: "all_delegates",
    },
    {
      value: "My delegates",
      sort: "my_delegates",
    },
  ];

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === DEFAULT_FILTER
        ? deleteSearchParam({ name: FILTER_PARAM })
        : addSearchParam({ name: FILTER_PARAM, value: address || "" }),
      { scroll: false }
    );
  };

  if (!address) return null;

  return (
    <Listbox
      as="div"
      value={filterParam}
      onChange={(value) => handleChange(value)}
    >
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-[200px] bg-wash text-base font-medium border border-line rounded-full py-2 px-4 flex items-center justify-between">
            <span>
              {filterParam === DEFAULT_FILTER
                ? "All delegates"
                : "My delegates"}
            </span>
            <ChevronDown className="h-4 w-4 ml-[6px] text-secondary/30" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-wash border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {delegateeFilterOptions.map((key) => (
              <Listbox.Option key={key.sort} value={key.sort} as={Fragment}>
                {(selected) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 rounded-xl font-medium hover:text-primary hover:bg-tertiary/20 ${
                        (key.sort === DEFAULT_FILTER &&
                          filterParam === DEFAULT_FILTER) ||
                        (key.sort === "my_delegates" &&
                          filterParam !== DEFAULT_FILTER)
                          ? "text-primary bg-tertiary/20"
                          : "text-secondary border-transparent"
                      }`}
                    >
                      {key.value}
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
