import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useQueryState,
  parseAsBoolean,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";
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
import { useAccount } from "wagmi";

export const useDelegatesFilter = () => {
  const { ui } = Tenant.current();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  // Setup nuqs query parameters
  const [endorsed, setEndorsed] = useQueryState(
    ENDORSED_FILTER_PARAM,
    parseAsBoolean.withDefault(false)
  );

  const [hasStatement, setHasStatement] = useQueryState(
    HAS_STATEMENT_FILTER_PARAM,
    parseAsBoolean.withDefault(false)
  );

  const [myDelegatesAddress, setMyDelegatesAddress] = useQueryState(
    MY_DELEGATES_FILTER_PARAM,
    parseAsString.withDefault("")
  );

  const [issuesParam, setIssuesParam] = useQueryState(
    ISSUES_FILTER_PARAM,
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const [stakeholdersParam, setStakeholdersParam] = useQueryState(
    STAKEHOLDERS_FILTER_PARAM,
    parseAsArrayOf(parseAsString).withDefault([])
  );

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

  // Derived state
  const hasMyDelegates = myDelegatesAddress !== "";

  // Set active filters based on URL params
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const filters: string[] = [];
    if (endorsed) filters.push(ENDORSED_FILTER_PARAM);
    if (hasStatement) filters.push(HAS_STATEMENT_FILTER_PARAM);
    if (hasMyDelegates) filters.push(MY_DELEGATES_FILTER_PARAM);
    setActiveFilters(filters);
  }, [endorsed, hasStatement, hasMyDelegates]);

  // Filter handlers
  const removeDelegateFilters = async () => {
    setIsDelegatesFiltering(true);
    await Promise.all([
      setEndorsed(false, { scroll: false }),
      setHasStatement(false, { scroll: false }),
      setMyDelegatesAddress(null, { scroll: false }),
    ]);
  };

  const toggleFilterToUrl = async (filter: string) => {
    setIsDelegatesFiltering(true);

    if (filter === "all") {
      await removeDelegateFilters();
    } else if (activeFilters.includes(filter)) {
      // Remove the filter
      switch (filter) {
        case ENDORSED_FILTER_PARAM:
          await setEndorsed(false, { scroll: false });
          break;
        case HAS_STATEMENT_FILTER_PARAM:
          await setHasStatement(false, { scroll: false });
          break;
        case MY_DELEGATES_FILTER_PARAM:
          await setMyDelegatesAddress(null, { scroll: false });
          break;
      }
    } else {
      // Add the filter
      switch (filter) {
        case ENDORSED_FILTER_PARAM:
          await setEndorsed(true, { scroll: false });
          break;
        case HAS_STATEMENT_FILTER_PARAM:
          await setHasStatement(true, { scroll: false });
          break;
        case MY_DELEGATES_FILTER_PARAM:
          if (connectedAddress) {
            await setMyDelegatesAddress(connectedAddress.toLowerCase(), {
              scroll: false,
            });
          }
          break;
      }
    }
  };

  const applyFiltersToUrl = async (
    filters: Record<string, string | boolean>
  ) => {
    setIsDelegatesFiltering(true);

    const updates = [];

    if (ENDORSED_FILTER_PARAM in filters) {
      updates.push(
        setEndorsed(!!filters[ENDORSED_FILTER_PARAM], { scroll: false })
      );
    }

    if (HAS_STATEMENT_FILTER_PARAM in filters) {
      updates.push(
        setHasStatement(!!filters[HAS_STATEMENT_FILTER_PARAM], {
          scroll: false,
        })
      );
    }

    if (MY_DELEGATES_FILTER_PARAM in filters) {
      const value = filters[MY_DELEGATES_FILTER_PARAM];
      updates.push(
        setMyDelegatesAddress(value ? String(value) : null, { scroll: false })
      );
    }

    if (ISSUES_FILTER_PARAM in filters) {
      const value = filters[ISSUES_FILTER_PARAM];
      if (typeof value === "string") {
        updates.push(
          setIssuesParam(value ? value.split(",") : [], { scroll: false })
        );
      }
    }

    if (STAKEHOLDERS_FILTER_PARAM in filters) {
      const value = filters[STAKEHOLDERS_FILTER_PARAM];
      if (typeof value === "string") {
        updates.push(
          setStakeholdersParam(value ? value.split(",") : [], { scroll: false })
        );
      }
    }

    await Promise.all(updates);
  };

  const resetAllFiltersToUrl = async () => {
    setIsDelegatesFiltering(true);

    await Promise.all([
      setEndorsed(false, { scroll: false }),
      setHasStatement(false, { scroll: false }),
      setMyDelegatesAddress(null, { scroll: false }),
      setIssuesParam([], { scroll: false }),
      setStakeholdersParam([], { scroll: false }),
    ]);
  };

  const addFilterToUrl = async (filter: string, value: string) => {
    setIsDelegatesFiltering(true);

    switch (filter) {
      case ISSUES_FILTER_PARAM:
        await setIssuesParam((prev) => [...(prev || []), value], {
          scroll: false,
        });
        break;
      case STAKEHOLDERS_FILTER_PARAM:
        await setStakeholdersParam((prev) => [...(prev || []), value], {
          scroll: false,
        });
        break;
    }
  };

  const removeFilterToUrl = async (filter: string) => {
    setIsDelegatesFiltering(true);

    switch (filter) {
      case ISSUES_FILTER_PARAM:
        await setIssuesParam([], { scroll: false });
        break;
      case STAKEHOLDERS_FILTER_PARAM:
        await setStakeholdersParam([], { scroll: false });
        break;
    }
  };

  return {
    activeFilters,
    hasIssues,
    hasStakeholders,
    issuesFromUrl: issuesParam ?? [],
    stakeholdersFromUrl: stakeholdersParam ?? [],
    hasEndorsedFilter,
    hasMyDelegates,
    endorsedToggleConfig,
    toggleFilterToUrl,
    resetAllFiltersToUrl,
    applyFiltersToUrl,
    addFilterToUrl,
    removeFilterToUrl,
  };
};
