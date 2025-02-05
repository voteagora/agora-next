"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";
import FilterListbox from "@/components/common/FilterListbox";

const FILTER_PARAM = "stakeholderFilter";
const DEFAULT_FILTER = "all";

export default function StakeholdersFilter() {
  const { ui } = Tenant.current();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const filterParam = searchParams?.get(FILTER_PARAM) || DEFAULT_FILTER;
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
    <FilterListbox
      value={filterParam}
      onChange={handleChange}
      options={stakeholderFilterOptions}
    />
  );
}
