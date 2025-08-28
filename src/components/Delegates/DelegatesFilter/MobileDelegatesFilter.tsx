"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterIcon } from "@/icons/filter";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
  delegatesFilterOptions,
} from "@/lib/constants";
import { FilterButton } from "./DelegatesFilter";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { useDelegatesSort } from "./useDelegatesSort";
import DelegatesIssuesFilter from "./DelegatesIssuesFilter";
import DelegatesStakeholdersFilter from "./DelegatesStakeholdersFilter";
import { CheckMark } from "@/icons/CheckMark";
import { MobileSortOption } from "./FilterSortOption";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

export const MobileDelegatesFilter = () => {
  const { ui } = Tenant.current();
  const hide7dChange = ui.toggle("hide-7d-change")?.enabled ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>(
    []
  );
  const { address: connectedAddress } = useAccount();

  const [tempMyDelegates, setTempMyDelegates] = useState(false);
  const [tempEndorsed, setTempEndorsed] = useState(false);
  const [tempHasStatement, setTempHasStatement] = useState(false);
  const [tempSortParam, setTempSortParam] = useState("weighted_random");

  // Use shared hooks for filter and sort functionality
  const {
    activeFilters,
    hasIssues,
    hasStakeholders,
    issuesFromUrl,
    stakeholdersFromUrl,
    hasEndorsedFilter,
    endorsedToggleConfig,
    resetAllFiltersToUrl,
    applyFiltersToUrl,
  } = useDelegatesFilter();

  const { orderByParam, handleSortChange } = useDelegatesSort();

  useEffect(() => {
    // Initialize temp states from URL on component mount
    setTempMyDelegates(activeFilters.includes(MY_DELEGATES_FILTER_PARAM));
    setTempEndorsed(activeFilters.includes(ENDORSED_FILTER_PARAM));
    setTempHasStatement(activeFilters.includes(HAS_STATEMENT_FILTER_PARAM));
    setSelectedIssues(issuesFromUrl);
    setSelectedStakeholders(stakeholdersFromUrl);
    setTempSortParam(orderByParam);
  }, [activeFilters, issuesFromUrl, stakeholdersFromUrl, orderByParam]);

  const getTotalActiveFiltersCount = () => {
    let count = activeFilters.length;
    if (hasIssues && issuesFromUrl.length > 0) {
      count += issuesFromUrl.length;
    }
    if (hasStakeholders && stakeholdersFromUrl.length > 0) {
      count += stakeholdersFromUrl.length;
    }
    if (orderByParam !== "weighted_random") {
      count += 1;
    }

    return count;
  };

  const handleIssuesChange = useCallback((issues: string[]) => {
    setSelectedIssues(issues);
  }, []);

  const handleStakeholdersChange = useCallback((stakeholders: string[]) => {
    setSelectedStakeholders(stakeholders);
  }, []);

  // Convert array to comma-separated string for the filter components
  const getIssuesString = (issues: string[]) => {
    return issues.join(",");
  };

  const getStakeholdersString = (stakeholders: string[]) => {
    return stakeholders.join(",");
  };

  const handleToggleFilter = (filter: string) => {
    if (filter === "all") {
      setTempMyDelegates(false);
      setTempEndorsed(false);
      setTempHasStatement(false);
      setSelectedIssues([]);
      setSelectedStakeholders([]);
    } else if (filter === MY_DELEGATES_FILTER_PARAM) {
      setTempMyDelegates(!tempMyDelegates);
    } else if (filter === ENDORSED_FILTER_PARAM) {
      setTempEndorsed(!tempEndorsed);
    } else if (filter === HAS_STATEMENT_FILTER_PARAM) {
      setTempHasStatement(!tempHasStatement);
    }
  };

  const handleTempSortChange = (sortValue: string) => {
    setTempSortParam(sortValue);
  };

  const resetTempSort = () => {
    setTempSortParam("weighted_random");
  };

  const applyAllFilters = () => {
    applyFiltersToUrl({
      [MY_DELEGATES_FILTER_PARAM]: tempMyDelegates
        ? connectedAddress || ""
        : false,
      [ENDORSED_FILTER_PARAM]: tempEndorsed,
      [HAS_STATEMENT_FILTER_PARAM]: tempHasStatement,
      [ISSUES_FILTER_PARAM]:
        selectedIssues.length > 0 ? getIssuesString(selectedIssues) : "",
      [STAKEHOLDERS_FILTER_PARAM]:
        selectedStakeholders.length > 0
          ? getStakeholdersString(selectedStakeholders)
          : "",
    });
    handleSortChange(tempSortParam);
    setIsOpen(false);
  };

  const totalActiveFiltersCount = getTotalActiveFiltersCount();

  return (
    <FilterResetListbox
      triggerLabel="Sort"
      triggerIcon={
        <FilterIcon
          className={
            totalActiveFiltersCount > 0 ? "stroke-primary" : "stroke-primary"
          }
        />
      }
      activeCount={totalActiveFiltersCount}
      onReset={resetTempSort}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      borderBelowLabel={false}
      animateFromBottom={true}
    >
      {/* Sort Section */}
      <div className="self-stretch border-b border-line">
        <div className="p-[10px] pb-6">
          <div className="flex flex-col gap-[20px] p-3">
            {Object.keys(delegatesFilterOptions)
              .filter((key) => {
                const option =
                  delegatesFilterOptions[
                    key as keyof typeof delegatesFilterOptions
                  ];
                if (
                  hide7dChange &&
                  (option.sort === "vp_change_7d" ||
                    option.sort === "vp_change_7d_desc")
                ) {
                  return false;
                }
                return true;
              })
              .map((key) => {
                const option =
                  delegatesFilterOptions[
                    key as keyof typeof delegatesFilterOptions
                  ];
                return (
                  <MobileSortOption
                    key={key}
                    label={option.value}
                    checked={option.sort === tempSortParam}
                    onClick={() => handleTempSortChange(option.sort)}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="self-stretch h-16 px-4 py-2 inline-flex justify-between items-center">
          <div className="text-secondary text-base font-semibold leading-normal">
            Filter
          </div>
          <button
            onClick={resetAllFiltersToUrl}
            className="justify-center text-primary text-xs font-medium leading-none cursor-pointer"
          >
            Reset
          </button>
        </div>
        <div className="self-stretch px-2.5 pb-6 bg-wash flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch inline-flex justify-start items-start gap-2.5 flex-wrap content-start">
            <FilterButton
              label="All Delegates"
              isActive={!tempMyDelegates && !tempEndorsed && !tempHasStatement}
              onClick={() => handleToggleFilter("all")}
            />
            {connectedAddress && (
              <FilterButton
                label="My Delegate(s)"
                isActive={tempMyDelegates}
                onClick={() => handleToggleFilter(MY_DELEGATES_FILTER_PARAM)}
              />
            )}
            {hasEndorsedFilter && (
              <FilterButton
                label={endorsedToggleConfig.showFilterLabel}
                isActive={tempEndorsed}
                onClick={() => handleToggleFilter(ENDORSED_FILTER_PARAM)}
                icon={
                  <CheckMark
                    className={
                      tempEndorsed
                        ? "fill-brandPrimary stroke-neutral"
                        : "fill-primary stroke-neutral"
                    }
                  />
                }
              />
            )}
            <FilterButton
              label="Has statement"
              isActive={tempHasStatement}
              onClick={() => handleToggleFilter(HAS_STATEMENT_FILTER_PARAM)}
            />
          </div>
        </div>
        {/* Issue Categories Filter */}
        {(hasIssues || hasStakeholders) && (
          <div className="pl-4 py-7 pr-2.5 flex flex-col gap-8 w-full">
            {hasIssues && (
              <DelegatesIssuesFilter handleIssueChange={handleIssuesChange} />
            )}
            {hasStakeholders && (
              <DelegatesStakeholdersFilter
                handleStakeholdersChange={handleStakeholdersChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Apply button at the bottom */}
      <div className="px-2.5 py-6 border-t border-line sticky bottom-0 bg-wash">
        <button
          onClick={applyAllFilters}
          className="w-full rounded-lg py-3 px-2 text-neutral bg-brandPrimary hover:bg-brandPrimary/90 flex justify-center"
        >
          Apply
        </button>
      </div>
    </FilterResetListbox>
  );
};
