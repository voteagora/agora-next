import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";
import { HStack } from "@/components/Layout/Stack";
import { HYBRID_PROPOSAL_QUORUM } from "@/lib/constants";

export const HybridApprovalCriteria = ({
  proposalSettings,
  currentQorum,
}: {
  proposalSettings?: ParsedProposalData["HYBRID_APPROVAL"]["kind"]["proposalSettings"];
  currentQorum?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!proposalSettings) return null;

  return (
    <div className="justify-start items-start">
      <div className="px-4">
        <HStack
          justifyContent="justify-between"
          className="text-xs font-semibold text-secondary pt-4"
        >
          <div>Quorum {HYBRID_PROPOSAL_QUORUM * 100}%</div>
          <div>Current {currentQorum?.toFixed(2)}%</div>
        </HStack>
      </div>
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="self-stretch rounded-sm  w-full"
      >
        <Collapsible.Trigger asChild>
          <div className="flex w-full justify-between items-center cursor-pointer px-4">
            <div className="flex-1 h-10 inline-flex flex-col justify-center items-start gap-2">
              <div className="text-sm font-semibold leading-none">Details</div>
            </div>
            <button className="w-4 h-4 flex items-center justify-center">
              <ExpandCollapseIcon className="stroke-primary" />
            </button>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="p-4 bg-neutral w-full">
          {proposalSettings.criteria === "TOP_CHOICES" && (
            <p className="text-sm">
              In this top-choices style proposal, the top{" "}
              {proposalSettings.criteriaValue.toString()} options will be
              executed. Voters can select up to {proposalSettings.maxApprovals}{" "}
              options. If the quorum is not met, no options will be executed.
            </p>
          )}
          {proposalSettings.criteria === "THRESHOLD" && (
            <p className="text-sm">
              In this threshold-based proposal, all options passing the approval
              threshold of{" "}
              <TokenAmountDecorated amount={proposalSettings.criteriaValue} />{" "}
              votes will be executed in order from most to least popular, until
              the total budget of{" "}
              <TokenAmountDecorated amount={proposalSettings.budgetAmount} />{" "}
              runs out. Voters can select up to {proposalSettings.maxApprovals}{" "}
              options. If the quorum is not met, no options will be executed.
            </p>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
};
