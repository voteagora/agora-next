import { useState, useEffect, useMemo, useCallback } from "react";
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
  MY_DELEGATES_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";
import { useAccount } from "wagmi";

const emptyArray: string[] = [];
const nuqsOptions = {
  scroll: false,
  shallow: false,
};

export const useDelegatesFilter = () => {
  const { ui } = Tenant.current();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  // Setup nuqs query parameters using direct parsers
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
    parseAsArrayOf(parseAsString).withDefault(emptyArray)
  );

  const [stakeholdersParam, setStakeholdersParam] = useQueryState(
    STAKEHOLDERS_FILTER_PARAM,
    parseAsArrayOf(parseAsString).withDefault(emptyArray)
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
  const activeFilters = useMemo(() => {
    const filters: string[] = [];
    if (endorsed) filters.push(ENDORSED_FILTER_PARAM);
    if (hasStatement) filters.push(HAS_STATEMENT_FILTER_PARAM);
    if (hasMyDelegates) filters.push(MY_DELEGATES_FILTER_PARAM);
    return filters;
  }, [endorsed, hasStatement, hasMyDelegates]);

  const toggleFilterToUrl = async (filter: string) => {
    setIsDelegatesFiltering(true);

    if (filter === "all") {
      return resetAllFiltersToUrl();
    } else if (activeFilters.includes(filter)) {
      // Remove the filter
      switch (filter) {
        case ENDORSED_FILTER_PARAM:
          return setEndorsed(false, nuqsOptions);
        case HAS_STATEMENT_FILTER_PARAM:
          return setHasStatement(false, nuqsOptions);
        case MY_DELEGATES_FILTER_PARAM:
          return setMyDelegatesAddress(null, nuqsOptions);
      }
    } else {
      // Add the filter
      switch (filter) {
        case ENDORSED_FILTER_PARAM:
          return setEndorsed(true, nuqsOptions);
        case HAS_STATEMENT_FILTER_PARAM:
          return setHasStatement(true, nuqsOptions);
        case MY_DELEGATES_FILTER_PARAM:
          if (connectedAddress) {
            return setMyDelegatesAddress(
              connectedAddress.toLowerCase(),
              nuqsOptions
            );
          }
          break;
      }
    }

    // Return a resolved promise if no action was taken
    return Promise.resolve(new URLSearchParams());
  };

  const applyFiltersToUrl = useCallback(
    async (filters: Record<string, string | boolean>) => {
      setIsDelegatesFiltering(true);

      const updates = [];

      if (ENDORSED_FILTER_PARAM in filters) {
        updates.push(
          setEndorsed(!!filters[ENDORSED_FILTER_PARAM], nuqsOptions)
        );
      }

      if (HAS_STATEMENT_FILTER_PARAM in filters) {
        updates.push(
          setHasStatement(!!filters[HAS_STATEMENT_FILTER_PARAM], nuqsOptions)
        );
      }

      if (MY_DELEGATES_FILTER_PARAM in filters) {
        const value = filters[MY_DELEGATES_FILTER_PARAM];
        updates.push(
          setMyDelegatesAddress(value ? String(value) : null, nuqsOptions)
        );
      }

      if (ISSUES_FILTER_PARAM in filters) {
        const value = filters[ISSUES_FILTER_PARAM];
        if (typeof value === "string") {
          updates.push(
            setIssuesParam(value ? value.split(",") : [], nuqsOptions)
          );
        }
      }

      if (STAKEHOLDERS_FILTER_PARAM in filters) {
        const value = filters[STAKEHOLDERS_FILTER_PARAM];
        if (typeof value === "string") {
          updates.push(
            setStakeholdersParam(value ? value.split(",") : [], nuqsOptions)
          );
        }
      }

      return Promise.all(updates).then(([firstParams, ...rest]) => {
        // Return the first URLSearchParams object since they should all be the same
        return firstParams || new URLSearchParams();
      });
    },
    [
      setEndorsed,
      setHasStatement,
      setMyDelegatesAddress,
      setIssuesParam,
      setStakeholdersParam,
      setIsDelegatesFiltering,
    ]
  );

  const resetAllFiltersToUrl = async () => {
    setIsDelegatesFiltering(true);

    const updates = [
      setEndorsed(false, nuqsOptions),
      setHasStatement(false, nuqsOptions),
      setMyDelegatesAddress(null, nuqsOptions),
      setIssuesParam([], nuqsOptions),
      setStakeholdersParam([], nuqsOptions),
    ];

    return Promise.all(updates).then(([endorsedParams]) => {
      // Return the first URLSearchParams object since they should all be the same
      return endorsedParams;
    });
  };

  const addFilterToUrl = async (filter: string, value: string) => {
    setIsDelegatesFiltering(true);

    switch (filter) {
      case ISSUES_FILTER_PARAM:
        return setIssuesParam((prev) => {
          const prevArray = prev || [];
          return [...prevArray, value];
        }, nuqsOptions);
      case STAKEHOLDERS_FILTER_PARAM:
        return setStakeholdersParam((prev) => {
          const prevArray = prev || [];
          return [...prevArray, value];
        }, nuqsOptions);
    }

    // Return a resolved promise if no action was taken
    return Promise.resolve(new URLSearchParams());
  };

  const removeFilterToUrl = useCallback(
    async (filter: string, value: string) => {
      setIsDelegatesFiltering(true);

      switch (filter) {
        case MY_DELEGATES_FILTER_PARAM:
          return setMyDelegatesAddress(null, nuqsOptions);
        case ENDORSED_FILTER_PARAM:
          return setEndorsed(false, nuqsOptions);
        case HAS_STATEMENT_FILTER_PARAM:
          return setHasStatement(false, nuqsOptions);
        case ISSUES_FILTER_PARAM:
          return setIssuesParam((prev) => {
            const prevArray = prev || [];
            return prevArray.filter((v) => v !== value);
          }, nuqsOptions);
        case STAKEHOLDERS_FILTER_PARAM:
          return setStakeholdersParam((prev) => {
            const prevArray = prev || [];
            return prevArray.filter((v) => v !== value);
          }, nuqsOptions);
      }
      // Return a resolved promise if no action was taken
      return Promise.resolve(new URLSearchParams());
    },
    [setIssuesParam, setStakeholdersParam, setIsDelegatesFiltering]
  );

  return {
    activeFilters,
    hasIssues,
    hasStakeholders,
    issuesFromUrl: issuesParam,
    stakeholdersFromUrl: stakeholdersParam,
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
