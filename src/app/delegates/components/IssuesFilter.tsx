"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";

const FILTER_PARAM = "issueFilter";
const DEFAULT_FILTER = "all";

export default function IssuesFilter() {
  const { ui } = Tenant.current();

  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const filterParam = searchParams?.get(FILTER_PARAM) || "all";
  const { setIsDelegatesFiltering } = useAgoraContext();

  const hasIssues = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );
  if (!hasIssues) return null;

  let issuesFilterOptions: any = {
    [DEFAULT_FILTER]: {
      value: "All Issues",
      sort: DEFAULT_FILTER,
    },
  };

  // Map values to sort options
  ui.governanceIssues!.forEach((item) => {
    issuesFilterOptions[item.key] = {
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
      value={filterParam || issuesFilterOptions.all.value}
      onChange={(value) => handleChange(value)}
    >
      {() => (
        <>
          <Listbox.Button className="w-full sm:w-[200px] bg-wash text-base font-medium border border-line rounded-full py-2 px-4 flex items-center justify-between">
            <span>
              {issuesFilterOptions[filterParam]?.value ||
                issuesFilterOptions.all.value}
            </span>
            <ChevronDown className="h-4 w-4 ml-[6px] text-secondary/30" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {Object.keys(issuesFilterOptions).map((key) => (
              <Listbox.Option key={key} value={key} as={Fragment}>
                {({ selected }) => {
                  return (
                    <li
                      className={`cursor-pointer text-base py-2 px-3 rounded-xl font-medium hover:text-primary hover:bg-tertiary/20 ${
                        selected
                          ? "text-primary bg-tertiary/20"
                          : "text-secondary border-transparent"
                      }`}
                    >
                      {issuesFilterOptions[key].value}
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
