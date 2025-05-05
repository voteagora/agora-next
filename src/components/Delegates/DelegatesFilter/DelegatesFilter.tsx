import { useState } from "react";
import { cn } from "@/lib/utils";
import { FilterIcon } from "@/icons/filter";
import { CheckMark } from "@/icons/CheckMark";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
} from "@/lib/constants";
import DelegatesIssuesFilter from "./DelegatesIssuesFilter";
import DelegatesStakeholdersFilter from "./DelegatesStakeholdersFilter";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { useAccount } from "wagmi";

type FilterButtonProps = {
  label: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
};

export const FilterButton = ({
  label,
  isActive = false,
  icon,
  onClick,
}: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "h-10 px-4 py-1.5 rounded-full flex justify-center items-center gap-1",
      isActive
        ? "bg-brandPrimary text-neutral"
        : "bg-neutral text-primary border border-secondary"
    )}
  >
    {icon}
    <span className="text-base font-medium leading-normal">{label}</span>
  </button>
);

export const DelegatesFilter = () => {
  // Filter state
  const [isOpen, setIsOpen] = useState(false);
  const { address: connectedAddress } = useAccount();
  const {
    activeFilters,
    hasIssues,
    hasStakeholders,
    issuesFromUrl,
    stakeholdersFromUrl,
    hasEndorsedFilter,
    endorsedToggleConfig,
    toggleFilterToUrl,
    resetAllFiltersToUrl,
  } = useDelegatesFilter();

  // Calculate total active filters count (excluding "all" options)
  const getTotalActiveFiltersCount = () => {
    let count = activeFilters.length;

    // Count selected issue categories
    if (hasIssues && issuesFromUrl.length > 0) {
      count += issuesFromUrl.length;
    }

    // Count selected stakeholders
    if (hasStakeholders && stakeholdersFromUrl.length > 0) {
      count += stakeholdersFromUrl.length;
    }
    return count;
  };

  const totalActiveFiltersCount = getTotalActiveFiltersCount();

  const onFilterClose = (status: boolean) => {
    setIsOpen(status);
  };

  return (
    <FilterResetListbox
      triggerLabel="Filter"
      triggerIcon={
        <FilterIcon
          className={
            totalActiveFiltersCount > 0
              ? "stroke-primary sm:stroke-neutral"
              : "stroke-primary"
          }
        />
      }
      activeCount={totalActiveFiltersCount}
      onReset={resetAllFiltersToUrl}
      isOpen={isOpen}
      onOpenChange={onFilterClose}
    >
      {/* Filter Chips */}
      <div className="self-stretch px-2.5 py-6 bg-wash flex flex-col justify-start items-start">
        <div className="self-stretch inline-flex justify-start items-start gap-2.5 flex-wrap content-start">
          <FilterButton
            label="All Delegates"
            isActive={activeFilters.length === 0}
            onClick={() => toggleFilterToUrl("all")}
          />
          {connectedAddress && (
            <FilterButton
              label="My Delegate(s)"
              isActive={activeFilters.includes(MY_DELEGATES_FILTER_PARAM)}
              onClick={() => toggleFilterToUrl(MY_DELEGATES_FILTER_PARAM)}
            />
          )}
          {hasEndorsedFilter && (
            <FilterButton
              label={endorsedToggleConfig.showFilterLabel}
              isActive={activeFilters.includes(ENDORSED_FILTER_PARAM)}
              onClick={() => toggleFilterToUrl(ENDORSED_FILTER_PARAM)}
              icon={
                <CheckMark
                  className={
                    activeFilters.includes(ENDORSED_FILTER_PARAM)
                      ? "fill-brandPrimary stroke-neutral"
                      : "fill-primary stroke-neutral"
                  }
                />
              }
            />
          )}
          <FilterButton
            label="Has statement"
            isActive={activeFilters.includes(HAS_STATEMENT_FILTER_PARAM)}
            onClick={() => toggleFilterToUrl(HAS_STATEMENT_FILTER_PARAM)}
          />
        </div>
      </div>

      {/* Issue Categories Filter */}

      {hasIssues && (
        <div className="border-t border-line px-2.5 py-6">
          <DelegatesIssuesFilter />
        </div>
      )}

      {/* Stakeholders Filter */}
      {hasStakeholders && (
        <div className="border-t border-line px-2.5 py-6">
          <DelegatesStakeholdersFilter />
        </div>
      )}
    </FilterResetListbox>
  );
};
