import { useState, useEffect, useMemo } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Tenant from "@/lib/tenant/tenant";
import { CountBadge } from "@/components/common/CountBadge";
import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateFilterCheckBoxItem } from "@/components/Delegates/DelegatesFilter/DelegateFilterCheckBoxItem";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { ISSUES_FILTER_PARAM } from "@/lib/constants";

const DelegatesIssuesFilter = () => {
  const { ui } = Tenant.current();
  const router = useRouter();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { issuesFromUrl } = useDelegatesFilter();

  // Collapsible state
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);

  const initialIssueCategories: Record<string, boolean> = useMemo(() => {
    const categories: Record<string, boolean> = {
      all: issuesFromUrl.length === 0,
    };

    ui.governanceIssues!.forEach((issue) => {
      categories[issue.key] = issuesFromUrl.includes(issue.key);
    });

    return categories;
  }, [issuesFromUrl, ui.governanceIssues]);

  // Checkbox states
  const [allIssuesChecked, setAllIssuesChecked] = useState(
    issuesFromUrl.length === 0
  );
  const [issueCategories, setIssueCategories] = useState(
    initialIssueCategories
  );

  // Update state when URL parameters change
  useEffect(() => {
    const newIssueCategories: Record<string, boolean> = {
      all: issuesFromUrl.length === 0,
    };
    ui.governanceIssues!.forEach((issue) => {
      newIssueCategories[issue.key] = issuesFromUrl.includes(issue.key);
    });
    setIssueCategories(newIssueCategories);
    setAllIssuesChecked(issuesFromUrl.length === 0);
  }, [issuesFromUrl, ui.governanceIssues]);

  const toggleAllIssues = () => {
    setIsDelegatesFiltering(true);
    const newValue = !allIssuesChecked;
    setAllIssuesChecked(newValue);

    if (newValue) {
      // If "All issues" is checked, remove issues param from URL
      router.push(deleteSearchParam({ name: ISSUES_FILTER_PARAM }), {
        scroll: false,
      });

      // Reset issue categories

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
      router.push(
        addSearchParam({
          name: ISSUES_FILTER_PARAM,
          value: selectedIssues.join(","),
        }),
        { scroll: false }
      );
    } else {
      router.push(deleteSearchParam({ name: ISSUES_FILTER_PARAM }), {
        scroll: false,
      });
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
              <ChevronUpDownIcon className="stroke-primary" />
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
