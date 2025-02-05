"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import Tenant from "@/lib/tenant/tenant";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";
import FilterListbox from "@/components/common/FilterListbox";

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

  const config = toggle.config as UIEndorsedConfig;
  const filterParam =
    searchParams?.get(FILTER_PARAM) || config.defaultFilter.toString();

  const endorsedFilterOptions = {
    true: {
      value: config.showFilterLabel,
      sort: "true",
    },
    false: {
      value: config.hideFilterLabel,
      sort: "false",
    },
  };

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === config.defaultFilter.toString()
        ? deleteSearchParam({ name: FILTER_PARAM })
        : addSearchParam({ name: FILTER_PARAM, value }),
      { scroll: false }
    );
  };

  return (
    <FilterListbox
      value={filterParam}
      onChange={handleChange}
      options={endorsedFilterOptions}
    />
  );
}
