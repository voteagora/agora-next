"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";

const FILTER_PARAM = "endorsedFilter";
const DEFAULT_FILTER = "true";

export default function EndorsedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const filterParam = searchParams?.get(FILTER_PARAM) || "true";
  const { setIsDelegatesFiltering } = useAgoraContext();

  let endorsedFilterOptions: any = {
    true: {
      value: "Endorsed Delegates",
      sort: "true",
    },
    false: {
      value: "All Delegates",
      sort: "false",
    },
  };

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
      value={filterParam || endorsedFilterOptions.false.value}
      onChange={(value) => handleChange(value)}
    >
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-fit bg-wash text-base font-medium border-none rounded-full py-2 px-4 flex items-center">
            {endorsedFilterOptions[filterParam]?.value ||
              endorsedFilterOptions.true.value}
            <ChevronDown className="h-4 w-4 ml-[2px] opacity-30 hover:opacity-100" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-wash border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.keys(endorsedFilterOptions).map((key) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ selected }) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 border rounded-xl font-medium ${
                        selected
                          ? "text-primary bg-white border-line"
                          : "text-secondary border-transparent"
                      }`}
                    >
                      {endorsedFilterOptions[key].value}
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
