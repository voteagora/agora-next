"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";

const FILTER_PARAM = "stakeholderFilter";
const DEFAULT_FILTER = "all";

export default function StakeholdersFilter() {
  const { ui } = Tenant.current();

  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const filterParam = searchParams?.get(FILTER_PARAM) || "all";
  const { setIsDelegatesFiltering } = useAgoraContext();

  const hasStakeholders = Boolean(
    ui.governanceStakeholders && ui.governanceStakeholders.length > 0
  );

  if (!hasStakeholders) return null;

  let stakeholderFilterOptions: any = {
    [DEFAULT_FILTER]: {
      value: "All Stakeholders",
      sort: DEFAULT_FILTER,
    },
  };

  // Map values to sort options
  ui.governanceStakeholders!.forEach((item) => {
    stakeholderFilterOptions[item.key] = {
      value: item.title,
      sort: item.key,
    };
  });

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === DEFAULT_FILTER
        ? deleteSearchParam({ name: FILTER_PARAM })
        : addSearchParam({ name: FILTER_PARAM, value }),
      { scroll: false }
    );
  };

  return (
    <Listbox
      as="div"
      value={filterParam || stakeholderFilterOptions.all.value}
      onChange={(value) => handleChange(value)}
    >
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-[#F7F7F7] text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {stakeholderFilterOptions[filterParam]?.value ||
              stakeholderFilterOptions.all.value}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-[#F7F7F7] border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.keys(stakeholderFilterOptions).map((key) => (
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
                      {stakeholderFilterOptions[key].value}
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
