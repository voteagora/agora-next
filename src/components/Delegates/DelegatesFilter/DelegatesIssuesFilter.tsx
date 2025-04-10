import { useState, useEffect, useMemo, useRef } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import Tenant from "@/lib/tenant/tenant";
import { CountBadge } from "@/components/common/CountBadge";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateFilterCheckBoxItem } from "@/components/Delegates/DelegatesFilter/DelegateFilterCheckBoxItem";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { ISSUES_FILTER_PARAM } from "@/lib/constants";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";

const DelegatesIssuesFilter = ({
  handleIssueChange,
}: {
  handleIssueChange?: (selectedIssues: string[]) => void;
}) => {
  const { ui } = Tenant.current();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { issuesFromUrl, removeFilterToUrl, applyFiltersToUrl } =
    useDelegatesFilter();
  
  // Ref to track previous issues from URL
  const prevIssuesRef = useRef<string[]>([]);

  // Collapsible state
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);

  // No need for memoization since we're comparing with prevIssuesRef
  const issuesArray = issuesFromUrl || [];

  const initialIssueCategories: Record<string, boolean> = useMemo(() => {
    const categories: Record<string, boolean> = {
      all: issuesArray.length === 0,
    };

    ui.governanceIssues!.forEach((issue) => {
      categories[issue.key] = issuesArray.includes(issue.key);
    });

    return categories;
  }, [issuesArray, ui.governanceIssues]);

  // Checkbox states
  const [allIssuesChecked, setAllIssuesChecked] = useState(
    issuesArray.length === 0
  );
  const [issueCategories, setIssueCategories] = useState(
    initialIssueCategories
  );

  // Update state when URL parameters change
  useEffect(() => {
    // Compare current issues with previous issues to avoid unnecessary updates
    if (JSON.stringify(prevIssuesRef.current) === JSON.stringify(issuesArray)) {
      return;
    }
    
    // Update the ref with current issues
    prevIssuesRef.current = [...issuesArray];
    
    const newIssueCategories: Record<string, boolean> = {
      all: issuesArray.length === 0,
    };
    
    ui.governanceIssues!.forEach((issue) => {
      newIssueCategories[issue.key] = issuesArray.includes(issue.key);
    });
    
    setIssueCategories(newIssueCategories);
    setAllIssuesChecked(issuesArray.length === 0);
  }, [issuesArray, ui.governanceIssues]);

  const toggleAllIssues = () => {
    setIsDelegatesFiltering(true);
    const newValue = !allIssuesChecked;
    setAllIssuesChecked(newValue);

    if (newValue) {
      // If "All issues" is checked, remove issues param from URL
      if (!handleIssueChange) {
        removeFilterToUrl(ISSUES_FILTER_PARAM);
      } else {
        handleIssueChange([]);
      }

      const resetIssues: Record<string, boolean> = { all: true };
      ui.governanceIssues!.forEach((issue) => {
        resetIssues[issue.key] = false;
      });
      setIssueCategories(resetIssues);
    }
  };

  // Handler for issue category checkbox changes
  const handleIssueCategoryChange = (category: string) => {
    setIsDelegatesFiltering(true);
    const newIssueCategories = {
      ...issueCategories,
      [category]: !issueCategories[category],
    };
    setIssueCategories(newIssueCategories);
    setAllIssuesChecked(false);

    // Update URL with selected issues
    const selectedIssues = Object.entries(newIssueCategories)
      .filter(([key, value]) => key !== "all" && value)
      .map(([key]) => key);

    if (selectedIssues.length > 0) {
      if (!handleIssueChange) {
        applyFiltersToUrl({ [ISSUES_FILTER_PARAM]: selectedIssues.join(",") });
      }
      if (handleIssueChange) {
        handleIssueChange(selectedIssues);
      }
    } else {
      if (!handleIssueChange) {
        removeFilterToUrl(ISSUES_FILTER_PARAM);
      }
      if (handleIssueChange) {
        handleIssueChange([]);
      }
    }
  };

  // Calculate selected issues count
  const selectedIssueCategoriesCount = Object.entries(issueCategories).reduce(
    (count, [key, value]) => {
      return key !== "all" && value ? count + 1 : count;
    },
    0
  );

  return (
    <Collapsible.Root
      open={isIssuesOpen}
      onOpenChange={setIsIssuesOpen}
      className="self-stretch"
    >
      <div className="bg-wash flex flex-col justify-start items-start gap-2.5">
        <Collapsible.Trigger asChild>
          <div className="self-stretch inline-flex justify-between items-start cursor-pointer">
            <div className="justify-center text-secondary text-base font-semibold leading-normal inline-flex gap-2">
              Issue Categories{" "}
              {selectedIssueCategoriesCount > 0 && (
                <CountBadge count={selectedIssueCategoriesCount} />
              )}
            </div>
            <button className="w-6 h-6 flex items-center justify-center">
              <ExpandCollapseIcon className="stroke-primary" />
            </button>
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content className="self-stretch">
          <div className="self-stretch p-3 flex flex-col justify-start items-start gap-5">
            <DelegateFilterCheckBoxItem
              label="All issues"
              checked={allIssuesChecked}
              onChange={toggleAllIssues}
            />
            {ui.governanceIssues!.map((issue) => (
              <DelegateFilterCheckBoxItem
                key={issue.key}
                label={issue.title}
                checked={issueCategories[issue.key]}
                onChange={() => handleIssueCategoryChange(issue.key)}
              />
            ))}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};

export default DelegatesIssuesFilter;
