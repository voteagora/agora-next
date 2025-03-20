import { useState, useEffect, useMemo } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import Tenant from "@/lib/tenant/tenant";
import { CountBadge } from "@/components/common/CountBadge";
import { useRouter } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateFilterCheckBoxItem } from "@/components/Delegates/DelegatesFilter/DelegateFilterCheckBoxItem";
import { STAKEHOLDERS_FILTER_PARAM } from "@/lib/constants";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";

const DelegatesStakeholdersFilter = () => {
  const { ui } = Tenant.current();
  const router = useRouter();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { stakeholdersFromUrl } = useDelegatesFilter();
  // Collapsible state
  const [isStakeholdersOpen, setIsStakeholdersOpen] = useState(false);

  const initialStakeholders: Record<string, boolean> = useMemo(() => {
    const stakeholders: Record<string, boolean> = {
      all: stakeholdersFromUrl.length === 0,
    };
    ui.governanceStakeholders!.forEach((stakeholder) => {
      stakeholders[stakeholder.key] = stakeholdersFromUrl.includes(
        stakeholder.key
      );
    });
    return stakeholders;
  }, [stakeholdersFromUrl, ui.governanceStakeholders]);

  // Checkbox states
  const [allStakeholdersChecked, setAllStakeholdersChecked] = useState(
    stakeholdersFromUrl.length === 0
  );
  const [stakeholders, setStakeholders] = useState(initialStakeholders);

  // Update state when URL parameters change
  useEffect(() => {
    // Update stakeholders
    const newStakeholders: Record<string, boolean> = {
      all: stakeholdersFromUrl.length === 0,
    };
    ui.governanceStakeholders!.forEach((stakeholder) => {
      newStakeholders[stakeholder.key] = stakeholdersFromUrl.includes(
        stakeholder.key
      );
    });
    setStakeholders(newStakeholders);
    setAllStakeholdersChecked(stakeholdersFromUrl.length === 0);
  }, [stakeholdersFromUrl, ui.governanceStakeholders]);

  const toggleAllStakeholders = () => {
    setIsDelegatesFiltering(true);
    const newValue = !allStakeholdersChecked;
    setAllStakeholdersChecked(newValue);

    if (newValue) {
      // If "All stakeholders" is checked, remove stakeholders param from URL
      router.push(deleteSearchParam({ name: STAKEHOLDERS_FILTER_PARAM }), {
        scroll: false,
      });

      // Reset stakeholders
      const resetStakeholders: Record<string, boolean> = { all: true };
      ui.governanceStakeholders!.forEach((stakeholder) => {
        resetStakeholders[stakeholder.key] = false;
      });
      setStakeholders(resetStakeholders);
    }
  };

  // Handler for stakeholder checkbox changes
  const handleStakeholderChange = (stakeholder: string) => {
    setIsDelegatesFiltering(true);
    const newStakeholders = {
      ...stakeholders,
      [stakeholder]: !stakeholders[stakeholder],
    };
    setStakeholders(newStakeholders);
    setAllStakeholdersChecked(false);

    // Update URL with selected stakeholders
    const selectedStakeholders = Object.entries(newStakeholders)
      .filter(([key, value]) => key !== "all" && value)
      .map(([key]) => key);

    if (selectedStakeholders.length > 0) {
      router.push(
        addSearchParam({
          name: STAKEHOLDERS_FILTER_PARAM,
          value: selectedStakeholders.join(","),
        }),
        { scroll: false }
      );
    } else {
      router.push(deleteSearchParam({ name: STAKEHOLDERS_FILTER_PARAM }), {
        scroll: false,
      });
    }
  };

  // Calculate selected stakeholders count
  const selectedStakeholdersCount = Object.entries(stakeholders).reduce(
    (count, [key, value]) => {
      return key !== "all" && value ? count + 1 : count;
    },
    0
  );

  return (
    <Collapsible.Root
      open={isStakeholdersOpen}
      onOpenChange={setIsStakeholdersOpen}
      className="self-stretch"
    >
      <div className="bg-wash flex flex-col justify-start items-start gap-2.5">
        <Collapsible.Trigger asChild>
          <div className="self-stretch inline-flex justify-between items-start cursor-pointer">
            <div className="justify-center text-secondary text-base font-semibold leading-normal inline-flex gap-2">
              Stakeholders{" "}
              {selectedStakeholdersCount > 0 && (
                <CountBadge count={selectedStakeholdersCount} />
              )}
            </div>
            <button className="w-6 h-6 flex items-center justify-center">
              <ExpandCollapseIcon className="stroke-primary" />
            </button>
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content className="self-stretch">
          <div className="w-full p-3 bg-wash flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex flex-col justify-start items-start gap-5">
              <DelegateFilterCheckBoxItem
                label="All Stakeholders"
                checked={allStakeholdersChecked}
                onChange={toggleAllStakeholders}
              />
              {ui.governanceStakeholders!.map((stakeholder) => (
                <DelegateFilterCheckBoxItem
                  key={stakeholder.key}
                  label={stakeholder.title}
                  checked={stakeholders[stakeholder.key]}
                  onChange={() => handleStakeholderChange(stakeholder.key)}
                />
              ))}
            </div>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};

export default DelegatesStakeholdersFilter;
