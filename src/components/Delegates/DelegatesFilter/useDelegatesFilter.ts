import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import Tenant from "@/lib/tenant/tenant";
import { useAgoraContext } from "@/contexts/AgoraContext";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";

export const useDelegatesFilter = () => {
  const { ui } = Tenant.current();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();

  // UI config
  const hasIssues = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );

  const hasStakeholders = Boolean(
    ui.governanceStakeholders && ui.governanceStakeholders.length > 0
  );

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  const hasEndorsedFilter = Boolean(
    endorsedToggle?.enabled && endorsedToggle?.config !== undefined
  );

  const endorsedToggleConfig = endorsedToggle?.config as UIEndorsedConfig;

  // Get filters from URL
  const endorsed = searchParams?.get(ENDORSED_FILTER_PARAM) === "true";

  const hasStatement = searchParams?.get(HAS_STATEMENT_FILTER_PARAM) === "true";
  const hasMyDelegates =
    searchParams?.get(MY_DELEGATES_FILTER_PARAM) === "true";

  // Set active filters based on URL params
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const filters: string[] = [];
    if (endorsed) filters.push(ENDORSED_FILTER_PARAM);
    if (hasStatement) filters.push(HAS_STATEMENT_FILTER_PARAM);
    if (hasMyDelegates) filters.push(MY_DELEGATES_FILTER_PARAM);
    setActiveFilters(filters);
  }, [endorsed, hasStatement, hasMyDelegates]);

  // Get issue categories from URL
  const issuesParam = searchParams?.get(ISSUES_FILTER_PARAM);
  const issuesFromUrl = useMemo(
    () => (issuesParam ? issuesParam.split(",") : []),
    [issuesParam]
  );

  // Get stakeholders from URL
  const stakeholdersParam = searchParams?.get(STAKEHOLDERS_FILTER_PARAM);
  const stakeholdersFromUrl = useMemo(
    () => (stakeholdersParam ? stakeholdersParam.split(",") : []),
    [stakeholdersParam]
  );

  // Filter handlers
  const removeDelegateFilters = () => {
    const url = deleteSearchParam({
      names: [
        ENDORSED_FILTER_PARAM,
        MY_DELEGATES_FILTER_PARAM,
        HAS_STATEMENT_FILTER_PARAM,
      ],
    });
    router.push(url, { scroll: false });
  };

  const toggleFilter = (filter: string) => {
    setIsDelegatesFiltering(true);
    if (filter === "all") {
      removeDelegateFilters();
    } else if (activeFilters.includes(filter)) {
      router.push(deleteSearchParam({ name: filter }), { scroll: false });
    } else {
      router.push(addSearchParam({ name: filter, value: "true" }), {
        scroll: false,
      });
    }
  };

  const resetFilters = () => {
    setIsDelegatesFiltering(true);

    const filterParams = [
      ENDORSED_FILTER_PARAM,
      HAS_STATEMENT_FILTER_PARAM,
      ISSUES_FILTER_PARAM,
      STAKEHOLDERS_FILTER_PARAM,
      MY_DELEGATES_FILTER_PARAM,
    ];

    const url = deleteSearchParam({
      names: filterParams,
    });

    router.push(url, { scroll: false });
  };

  return {
    activeFilters,
    hasIssues,
    hasStakeholders,
    issuesFromUrl,
    stakeholdersFromUrl,
    hasEndorsedFilter,
    endorsedToggleConfig,
    toggleFilter,
    resetFilters,
  };
};
