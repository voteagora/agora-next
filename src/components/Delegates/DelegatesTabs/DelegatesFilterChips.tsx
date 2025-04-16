"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/shared/CloseIcon";
import Tenant from "@/lib/tenant/tenant";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import { useDelegatesFilter } from "@/components/Delegates/DelegatesFilter/useDelegatesFilter";

type FilterChipProps = {
  label: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
};

export const DelegateFilterChip = ({
  label,
  isActive = false,
  icon,
  onClick,
}: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 pr-2 rounded-full border border-teritiary flex justify-center items-center gap-2",
        isActive ? "bg-brandPrimary text-neutral" : "bg-neutral text-primary"
      )}
    >
      <span className="text-xs font-semibold leading-4">{label}</span>
      {icon}
    </button>
  );
};

export const DelegatesFilterChips = () => {
  const [activeFilters, setActiveFilters] = useState<
    { label: string; param: string; key?: string }[]
  >([]);
  const { ui } = Tenant.current();
  const {
    activeFilters: activeFilterParams,
    issuesFromUrl,
    stakeholdersFromUrl,
    endorsedToggleConfig,
    removeFilterToUrl,
  } = useDelegatesFilter();

  useEffect(() => {
    const filters: { label: string; param: string; key?: string }[] = [];

    // Check for filter params
    if (
      activeFilterParams.includes(ENDORSED_FILTER_PARAM) &&
      endorsedToggleConfig?.showFilterLabel
    ) {
      filters.push({
        label: endorsedToggleConfig.showFilterLabel,
        param: ENDORSED_FILTER_PARAM,
      });
    }

    if (activeFilterParams.includes(HAS_STATEMENT_FILTER_PARAM)) {
      filters.push({
        label: "Has statement",
        param: HAS_STATEMENT_FILTER_PARAM,
      });
    }

    if (activeFilterParams.includes(MY_DELEGATES_FILTER_PARAM)) {
      filters.push({
        label: "My delegate(s)",
        param: MY_DELEGATES_FILTER_PARAM,
      });
    }

    // Check for issues param
    issuesFromUrl.forEach((issue) => {
      if (ui.governanceIssues) {
        const issueConfig = ui.governanceIssues.find((i) => i.key === issue);
        if (issueConfig) {
          filters.push({
            label: `${issueConfig.title}`,
            param: ISSUES_FILTER_PARAM,
            key: issue,
          });
        }
      }
    });

    // Check for stakeholders param
    stakeholdersFromUrl.forEach((stakeholder) => {
      if (ui.governanceStakeholders) {
        const stakeholderConfig = ui.governanceStakeholders.find(
          (s) => s.key === stakeholder
        );
        if (stakeholderConfig) {
          filters.push({
            label: `${stakeholderConfig.title}`,
            param: STAKEHOLDERS_FILTER_PARAM,
            key: stakeholder,
          });
        }
      }
    });

    setActiveFilters(filters);
  }, [
    activeFilterParams,
    issuesFromUrl,
    stakeholdersFromUrl,
    endorsedToggleConfig?.showFilterLabel,
    ui.governanceIssues,
    ui.governanceStakeholders,
  ]);

  const clearFilter = (param: string, key?: string) => {
    if (key) {
      removeFilterToUrl(param, key);
    } else {
      // For non-array params, we can just set them to false/empty
      switch (param) {
        case ENDORSED_FILTER_PARAM:
        case HAS_STATEMENT_FILTER_PARAM:
          removeFilterToUrl(param, "false");
          break;
        case MY_DELEGATES_FILTER_PARAM:
          removeFilterToUrl(param, "");
          break;
      }
    }
  };

  return (
    <>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 mb-2">
          {activeFilters.map((filter) => (
            <DelegateFilterChip
              key={filter.param + (filter.key || "")}
              label={filter.label}
              onClick={() => clearFilter(filter.param, filter.key)}
              icon={<CloseIcon className="text-tertiary w-4 h-4" />}
            />
          ))}
        </div>
      )}
    </>
  );
};
