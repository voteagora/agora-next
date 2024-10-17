"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";

const FILTER_PARAM = "endorsedFilter";

export default function EndorsedFilter() {
  const { ui } = Tenant.current();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();

  const toggle = ui.toggle("delegates/endorsed-filter");
  const hasEndorsedFilter = Boolean(
    toggle?.enabled && toggle?.config !== undefined
  );

  if (!hasEndorsedFilter || !toggle) {
    return null;
  }

  const filterParam =
    searchParams?.get(FILTER_PARAM) ||
    (toggle.config as UIEndorsedConfig).defaultFilter.toString();

  const endorsedFilterOptions: Record<string, { value: string; sort: string }> =
    {
      true: {
        value: (toggle.config as UIEndorsedConfig).showFilterLabel,
        sort: "true",
      },
      false: {
        value: (toggle.config as UIEndorsedConfig).hideFilterLabel,
        sort: "false",
      },
    };

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === (toggle.config as UIEndorsedConfig).defaultFilter.toString()
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
          <Listbox.Button className="w-full sm:w-[200px] bg-wash text-base font-medium border border-line rounded-full py-2 px-4 flex items-center justify-between">
            <span>
              {endorsedFilterOptions[filterParam]?.value ||
                endorsedFilterOptions.true.value}
            </span>
            <ChevronDown className="h-4 w-4 ml-[6px] text-secondary/30" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-wash border border-[#ebebeb] p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.keys(endorsedFilterOptions).map((key) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ selected }) => (
                  <li
                    className={`cursor-pointer text-base py-2 px-3 rounded-xl font-medium hover:text-primary hover:bg-tertiary/20 ${
                      selected
                        ? "text-primary bg-tertiary/20"
                        : "text-secondary border-transparent"
                    }`}
                  >
                    {endorsedFilterOptions[key].value}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  );
}
