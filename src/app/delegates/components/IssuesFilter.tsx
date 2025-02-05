"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";
import FilterListbox from "@/components/common/FilterListbox";

const FILTER_PARAM = "issueFilter";
const DEFAULT_FILTER = "all";

export default function IssuesFilter() {
  const { ui } = Tenant.current();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const filterParam = searchParams?.get(FILTER_PARAM) || DEFAULT_FILTER;
  const { setIsDelegatesFiltering } = useAgoraContext();

  const hasIssues = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );
  if (!hasIssues) return null;

  const issuesFilterOptions: any = {
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
    <FilterListbox
      value={filterParam}
      onChange={handleChange}
      options={issuesFilterOptions}
    />
  );
}
