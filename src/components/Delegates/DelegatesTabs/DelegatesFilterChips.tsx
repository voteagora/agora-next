"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useDeleteSearchParam, useAddSearchParam } from "@/hooks";
import { CloseIcon } from "@/components/shared/CloseIcon";
import Tenant from "@/lib/tenant/tenant";
import {
  ENDORSED_FILTER_PARAM,
  HAS_STATEMENT_FILTER_PARAM,
  ISSUES_FILTER_PARAM,
  MY_DELEGATES_FILTER_PARAM,
  STAKEHOLDERS_FILTER_PARAM,
} from "@/lib/constants";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";

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
  const { setIsDelegatesFiltering } = useAgoraContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const deleteSearchParam = useDeleteSearchParam();
  const addSearchParam = useAddSearchParam();
  const { ui } = Tenant.current();

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  const endorsedToggleConfig = endorsedToggle?.config as UIEndorsedConfig;

  useEffect(() => {
    const filters: { label: string; param: string; key?: string }[] = [];

    // Check for filter params
    const endorsed = searchParams?.get(ENDORSED_FILTER_PARAM);
    if (endorsed === "true" && endorsedToggleConfig?.showFilterLabel) {
      filters.push({
        label: endorsedToggleConfig.showFilterLabel,
        param: ENDORSED_FILTER_PARAM,
      });
    }

    const hasStatement = searchParams?.get(HAS_STATEMENT_FILTER_PARAM);
    if (hasStatement === "true") {
      filters.push({
        label: "Has statement",
        param: HAS_STATEMENT_FILTER_PARAM,
      });
    }

    const myDelegatesAddress =
      searchParams?.get(MY_DELEGATES_FILTER_PARAM) || "";
    const hasMyDelegates = myDelegatesAddress !== "";
    if (hasMyDelegates) {
      filters.push({
        label: "My delegate(s)",
        param: MY_DELEGATES_FILTER_PARAM,
      });
    }

    // Check for issues param
    const issuesParam = searchParams?.get(ISSUES_FILTER_PARAM);
    if (issuesParam) {
      const issues = issuesParam.split(",");
      issues.forEach((issue) => {
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
    }

    // Check for stakeholders param
    const stakeholdersParam = searchParams?.get(STAKEHOLDERS_FILTER_PARAM);
    if (stakeholdersParam) {
      const stakeholdersList = stakeholdersParam.split(",");
      stakeholdersList.forEach((stakeholder) => {
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
    }

    setActiveFilters(filters);
  }, [
    endorsedToggleConfig?.showFilterLabel,
    searchParams,
    ui.governanceIssues,
    ui.governanceStakeholders,
  ]);

  const clearFilter = (param: string, key?: string) => {
    setIsDelegatesFiltering(true);

    if (
      (param === ISSUES_FILTER_PARAM || param === STAKEHOLDERS_FILTER_PARAM) &&
      key
    ) {
      // For issues and stakeholders, we need to remove the specific item
      const currentValue = searchParams?.get(param);
      if (!currentValue) return;

      const values = currentValue.split(",");
      const newValues = values.filter((v) => v !== key);

      if (newValues.length === 0) {
        // If no values left, remove the parameter
        router.push(deleteSearchParam({ name: param }), { scroll: false });
      } else {
        // Update with remaining values
        router.push(
          addSearchParam({
            name: param,
            value: newValues.join(","),
          }),
          { scroll: false }
        );
      }
    } else {
      // For other filters, just remove the parameter
      router.push(deleteSearchParam({ name: param }), { scroll: false });
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
